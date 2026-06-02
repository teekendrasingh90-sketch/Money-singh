import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const PUBLIC_DIR = path.resolve('./www');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
  // Translate URL path to file path, remove query params
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);

  // Security check: ensure path does not escape PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    // If file does not exist or is a directory, fallback to index.html (standard SPA routing fallback)
    if (err || !stats.isFile()) {
      const indexFallback = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFallback, (fallbackErr, content) => {
        if (fallbackErr) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Not Found');
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(content);
        }
      });
      return;
    }

    // Serve the file
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Static Server] Running at http://0.0.0.0:${PORT}/ serving ${PUBLIC_DIR}`);
});
