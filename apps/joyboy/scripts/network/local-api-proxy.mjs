import http from 'node:http';

const PORT = Number(process.env.LOCAL_API_PROXY_PORT || 8010);
const TARGET_ORIGIN = process.env.LOCAL_API_PROXY_TARGET || 'https://apigw-sg-prod.castlery.com';

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
]);

function copyHeaders(inputHeaders) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(inputHeaders)) {
    if (!value) continue;
    const lowerKey = key.toLowerCase();
    if (hopByHopHeaders.has(lowerKey)) continue;
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}

const server = http.createServer(async (req, res) => {
  // Abort upstream fetch when the client disconnects (browser nav, RSC abort, etc.).
  const ac = new AbortController();
  req.on('close', () => {
    if (!ac.signal.aborted) ac.abort(new Error('client disconnected'));
  });

  try {
    if (!req.url) {
      res.writeHead(400).end('Missing URL');
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers': req.headers['access-control-request-headers'] || '*',
        'access-control-max-age': '86400',
      });
      res.end();
      return;
    }

    const upstreamUrl = new URL(req.url, TARGET_ORIGIN);
    const headers = copyHeaders(req.headers);

    let body;
    if (req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) {
      body = req;
    }

    const upstreamResp = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body,
      duplex: body ? 'half' : undefined,
      redirect: 'manual',
      signal: ac.signal,
    });

    const responseHeaders = {};
    upstreamResp.headers.forEach((value, key) => {
      if (!hopByHopHeaders.has(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    responseHeaders['access-control-allow-origin'] = '*';
    responseHeaders['access-control-allow-credentials'] = 'true';

    res.writeHead(upstreamResp.status, responseHeaders);

    if (upstreamResp.body) {
      for await (const chunk of upstreamResp.body) {
        // Stop writing if the client already disconnected mid-stream
        if (res.destroyed) break;
        res.write(chunk);
      }
    }
    if (!res.destroyed) res.end();
  } catch (error) {
    // Headers already sent or socket gone — nothing we can do
    if (res.headersSent || res.destroyed) return;

    const isAbort = ac.signal.aborted;
    // 499 = client closed request (nginx convention); 502 = proxy/upstream failure
    const status = isAbort ? 499 : 502;
    res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
    res.end(
      JSON.stringify({
        error: isAbort ? 'request_aborted' : 'proxy_failed',
        message: error instanceof Error ? error.message : 'Unknown proxy error',
      })
    );
  }
});

// Keep TCP connections alive across requests — avoids per-request handshake overhead.
// headersTimeout must be > keepAliveTimeout to prevent a race condition in Node.js HTTP server.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

server.listen(PORT, () => {
  console.log(`[local-api-proxy] listening on http://localhost:${PORT} -> ${TARGET_ORIGIN}`);
});
