
import { createServer } from 'node:http';
import { createBrotliCompress, createGzip } from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const BODY = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const server = createServer(async (req, res) => {
    console.log(`Received request for ${req.url}`);

    if (req.url === '/') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`<!DOCTYPE html>
<html>
  <head>
    <title>Compression Test</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
  <p>View the response with the specified compression.</p>
  <ul>
    <li><a href="/br">Brotli</a></li>
    <li><a href="/gzip">Gzip</a></li>
    <li><a href="/br_gzip">Brotli then Gzip</a></li>
  </ul>
  <p>${BODY}</p>
  </body>
</html>`);
        return;
    }

    const acceptEncoding = (req.headers['accept-encoding'] || '')
        .split(',')
        .map(s => s.trim().toLowerCase())

    if (req.url === '/br') {
        if (!acceptEncoding.includes('br')) {
            res.statusCode = 400;
            res.end("Must include 'br' in Accept-Encoding header");
            return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Encoding', 'br');

        await pipeline(
            Readable.from(BODY),
            createBrotliCompress(),
            res
        );

        res.end(BODY);
        return;
    }

    if (req.url === '/gzip') {
        if (!acceptEncoding.includes('gzip')) {
            res.statusCode = 400;
            res.end("Must include 'gzip' in Accept-Encoding header");
            return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Encoding', 'gzip');

        await pipeline(
            Readable.from(BODY),
            createGzip(),
            res
        );

        res.end(BODY);
        return;
    }

    if (req.url === '/br_gzip') {
        if (!acceptEncoding.includes('br') || !acceptEncoding.includes('gzip')) {
            res.statusCode = 400;
            res.end("Must include 'br' and 'gzip' in Accept-Encoding header");
            return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Encoding', 'br, gzip');

        await pipeline(
            Readable.from(BODY),
            createBrotliCompress(),
            createGzip(),
            res
        );

        res.end(BODY);
        return;
    }

    res.statusCode = 404;
    res.end();
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
