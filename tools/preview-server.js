const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PREVIEW_PORT || 4174);
const previewDir = path.resolve(__dirname, '..', 'preview');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function send(response, status, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': contentType });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  const pathname = url.pathname === '/' ? '/rentease-warm-lifestyle-preview.html' : url.pathname;
  const filePath = path.resolve(previewDir, `.${pathname}`);

  if (!filePath.startsWith(previewDir)) {
    send(response, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      send(response, 404, 'Preview file not found');
      return;
    }

    send(response, 200, file, mimeTypes[path.extname(filePath)] || 'application/octet-stream');
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`RentEase theme preview running at http://127.0.0.1:${port}`);
});
