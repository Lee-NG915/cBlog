// proxy-server.js
const https = require('https');
const fs = require('fs');
const httpProxy = require('http-proxy');
const path = require('path');

// 解析命令行参数
function parseArgs(args) {
  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      params[args[i].slice(2)] = args[i + 1];
    }
  }
  return params;
}

// 获取命令行参数
const args = parseArgs(process.argv.slice(2));
const config = {
  source: parseInt(args.source) || 7010, // HTTPS 端口
  target: parseInt(args.target) || 7777, // HTTP 端口
};

// SSL 证书路径
const SSL_KEY_PATH = path.join(__dirname, 'ssl/localhost-key.pem');
const SSL_CERT_PATH = path.join(__dirname, 'ssl/localhost.pem');

// 创建代理服务器
const proxy = httpProxy.createProxyServer({
  target: {
    protocol: 'http:', // 目标使用 HTTP 协议
    host: 'localhost',
    port: config.target,
  },
  secure: false, // 允许不安全的证书
});

// 创建 HTTPS 服务器
const server = https.createServer(
  {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH),
  },
  (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // 打印请求信息，方便调试
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // 转发请求到目标服务器
    proxy.web(req, res, {}, (err) => {
      if (err) {
        console.error('代理错误:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('代理服务器错误');
      }
    });
  }
);

// 错误处理
proxy.on('error', (err, req, res) => {
  console.error('代理服务器错误:', err);
  if (!res.headersSent) {
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
  }
  res.end('代理服务器错误');
});

// 代理事件监听
proxy.on('proxyReq', (proxyReq, req) => {
  // 打印代理请求信息
  console.log(`代理请求: ${req.method} ${req.url} -> http://localhost:${config.target}`);
});

proxy.on('proxyRes', (proxyRes, req) => {
  // 打印代理响应信息
  console.log(`代理响应: ${proxyRes.statusCode} - ${req.method} ${req.url}`);
});

// 启动服务器
server.listen(config.source, () => {
  console.log(`HTTPS 代理服务器已启动:`);
  console.log(`https://localhost:${config.source} -> http://localhost:${config.target}`);
  console.log('按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭代理服务器...');
  server.close(() => {
    console.log('代理服务器已关闭');
    process.exit(0);
  });
});
