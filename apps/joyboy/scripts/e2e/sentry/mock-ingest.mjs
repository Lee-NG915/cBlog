#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

function parseArgs(argv) {
  const args = { port: 8123, output: '.tmp/sentry-mock/server-envelopes.ndjson' };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--port' && value) {
      args.port = Number(value);
      i++;
      continue;
    }
    if (key === '--output' && value) {
      args.output = value;
      i++;
    }
  }
  return args;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseEnvelope(body) {
  const lines = body.split('\n').filter(Boolean);
  const header = safeJsonParse(lines[0] || '{}');
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const itemHeader = safeJsonParse(lines[i]);
    if (!itemHeader) continue;
    const itemPayload = lines[i + 1] ?? '';
    items.push({
      header: itemHeader,
      payload: safeJsonParse(itemPayload) ?? itemPayload,
    });
    i++;
  }

  return { header, items };
}

const { port, output } = parseArgs(process.argv.slice(2));
ensureDir(output);
fs.writeFileSync(output, '', { encoding: 'utf8' });

const server = http.createServer((req, res) => {
  const url = req.url || '';
  // Sentry envelope URLs may include query params (e.g. sentry_key/client/version).
  const isEnvelope = /\/api\/\d+\/envelope\/?(?:\?.*)?$/.test(url);

  if (req.method !== 'POST' || !isEnvelope) {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{}');
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    const parsed = parseEnvelope(raw);
    const record = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url,
      headers: req.headers,
      envelope: parsed,
    };
    fs.appendFileSync(output, `${JSON.stringify(record)}\n`, { encoding: 'utf8' });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{}');
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[mock-sentry-ingest] listening on http://localhost:${port}`);
  console.log(`[mock-sentry-ingest] writing envelopes to ${output}`);
});
