const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4173;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

http
  .createServer((request, response) => {
    const urlPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
    const safePath = path.normalize(path.join(ROOT, urlPath));

    if (!safePath.startsWith(ROOT)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(safePath, (error, data) => {
      if (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500);
        response.end(error.code === "ENOENT" ? "Not Found" : "Server Error");
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`Vote page available at http://localhost:${PORT}`);
  });
