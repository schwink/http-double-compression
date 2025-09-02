
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { pipeline } from 'node:stream/promises';
import { URL } from 'node:url';
import { createBrotliCompress, createDeflate, createGzip, createZstdCompress } from 'node:zlib';

function bodyStream() {
    return createReadStream('lipsum.txt', { encoding: 'utf8' });
}

function streamLength(stream) {
    return new Promise((resolve, reject) => {
        let length = 0;
        stream.on('data', chunk => {
            length += chunk.length;
        });
        stream.on('end', () => resolve(length));
        stream.on('error', reject);
    });
}

const uncompressedLength = await streamLength(bodyStream());
const compressionSchemes = [
    {
        used: ['br'],
        length: await streamLength(bodyStream().pipe(createBrotliCompress()))
    },
    {
        used: ['deflate'],
        length: await streamLength(bodyStream().pipe(createDeflate()))
    },
    {
        used: ['gzip'],
        length: await streamLength(bodyStream().pipe(createGzip()))
    },
    {
        used: ['zstd'],
        length: await streamLength(bodyStream().pipe(createZstdCompress()))
    },
    {
        used: ['br', 'deflate'],
        length: await streamLength(bodyStream().pipe(createBrotliCompress()).pipe(createDeflate()))
    },
    {
        used: ['br', 'gzip'],
        length: await streamLength(bodyStream().pipe(createBrotliCompress()).pipe(createGzip()))
    },
    {
        used: ['br', 'zstd'],
        length: await streamLength(bodyStream().pipe(createBrotliCompress()).pipe(createZstdCompress()))
    },
]

const numberFormatter = new Intl.NumberFormat('en-US');

const server = createServer(async (req, res) => {
    console.log(`Received request for ${req.url}`);

    const acceptEncodingHeader = req.headers['accept-encoding'] || '';

    if (req.url === '/') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`<!DOCTYPE html>
<html>
  <head>
    <title>Compression Test</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        p, pre {
            padding: 8px 12px;
        }

        table {
            border-collapse: collapse;
            margin-bottom: 1em;
        }

        th, td {
            padding: 8px 12px;
            border: 1px solid #dfe2e5;
            text-align: left;
        }

        td.number {
            text-align: right;
        }

        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background-color: #fcfcfc;
        }

        tr:hover {
            background-color: #f0f0f0;
        }
    </style>
  </head>
  <body>

  ${acceptEncodingHeader
                ? `<pre>Accept-Encoding: ${acceptEncodingHeader}</pre>`
                : '<p>No <tt>Accept-Encoding</tt> header present</p>'
            }

    <table>
        <tr>
            <th><tt>Content-Encoding</tt></th>
            <th>body length</th>
        </tr>
        <tr>
            <td><a href="/lipsum">Uncompressed</a></td>
            <td class="number">${numberFormatter.format(uncompressedLength)}</td>
        </tr>
        ${compressionSchemes.map(({ used, length }) => `
    <tr>
      <td><a href="/lipsum?compress=${used.join(',')}"><tt>${used.join(", ")}</tt></a></td>
      <td class="number">${numberFormatter.format(length)}</td>
    </tr>
    `).join('')}
    </table>

  </body >
</html > `);
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname !== '/lipsum') {
        res.statusCode = 404;
        res.end();
        return;
    }

    const compressParam = url.searchParams.get('compress') || '';
    const compress = compressParam.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);

    let stream = bodyStream();
    for (const scheme of compress) {
        if (scheme === 'br') {
            stream = stream.pipe(createBrotliCompress());
        } else if (scheme === 'deflate') {
            stream = stream.pipe(createDeflate());
        } else if (scheme === 'gzip') {
            stream = stream.pipe(createGzip());
        } else if (scheme === 'zstd') {
            stream = stream.pipe(createZstdCompress());
        } else {
            res.statusCode = 400;
            res.end(`Unknown compression scheme: ${scheme}`);
            return;
        }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain;charset=utf-8');
    res.setHeader('Content-Disposition', 'inline');

    if (compress.length !== 0) {
        res.setHeader('Content-Encoding', compress.join(', '));
    }

    await pipeline(stream, res);
    res.end();
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
