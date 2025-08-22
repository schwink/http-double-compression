
import { createServer } from 'node:http';
import { createBrotliCompress, createGzip } from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// 4096 bytes of lipsum
const BODY = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nulla metus, ultricies sed elit ac, commodo pretium odio. Suspendisse pretium porttitor odio, nec venenatis quam ornare non. Phasellus in lectus sed felis posuere blandit in quis orci. Sed tellus nulla, iaculis ut lorem at, tempor facilisis ante. Proin rutrum euismod velit, id congue tortor interdum et. Nulla ut pharetra orci. Pellentesque porttitor augue et massa laoreet, sed pellentesque diam eleifend. Aliquam ut feugiat eros. Curabitur at eros et libero suscipit maximus. Fusce feugiat dui non nulla tempor, nec bibendum lorem accumsan. Nam sed lorem nulla. Nullam feugiat risus eget magna maximus sodales. Suspendisse commodo metus felis, vitae rutrum augue ornare eu. Pellentesque ornare lectus tortor, pulvinar venenatis nunc commodo eu. Cras rutrum, arcu vel tristique convallis, odio ex aliquet nulla, lobortis vehicula erat est at leo. In placerat nunc vel mollis pulvinar.

Nulla sollicitudin turpis sem, quis fermentum odio accumsan nec. Nulla euismod nisi vel consequat euismod. Suspendisse ac finibus eros. Donec non porta ipsum, fermentum pretium mi. Donec congue semper ligula nec tincidunt. Etiam sodales dui id faucibus fermentum. Phasellus ut feugiat odio. Vestibulum vestibulum metus sem, eu porta orci porta eu.

Donec lacinia cursus orci. Nulla arcu mauris, imperdiet at ex a, vehicula laoreet eros. Vivamus ornare finibus dolor, ac pharetra neque consequat sit amet. Nunc et ullamcorper justo. Proin id felis est. Curabitur nibh arcu, mollis at placerat at, rhoncus a lorem. Maecenas vitae elit euismod, pharetra ligula hendrerit, eleifend tellus. Curabitur gravida magna nec augue viverra, vel interdum ante lobortis. Maecenas malesuada lacus libero. Integer et turpis ligula. Quisque quis elit in eros sodales consequat.

Praesent dui urna, vehicula at justo nec, pellentesque aliquam massa. Proin at sollicitudin orci. Vivamus convallis tortor id varius volutpat. Sed ante augue, venenatis vitae finibus ut, molestie ac dolor. Fusce posuere volutpat risus, non vehicula dui mollis in. Fusce eleifend gravida ex, nec pharetra dolor faucibus ac. Vestibulum in consectetur sem, et luctus ligula. Nunc vestibulum risus eget lacus molestie, scelerisque vestibulum magna pharetra. Morbi tincidunt euismod velit.

Nullam vitae ullamcorper leo. Vestibulum vel molestie quam. Vivamus eleifend sodales enim ut lacinia. Ut porta ac nisi non placerat. Vivamus id urna dictum, rutrum mi sed, tincidunt libero. Etiam porttitor mauris in turpis tincidunt pharetra. Nulla sed orci ut augue dictum sodales in vitae turpis.

Suspendisse vel gravida lacus, nec eleifend diam. Cras eget turpis tempor nunc sollicitudin porttitor. Nam vel ex sed diam fermentum cursus. Integer nunc tortor, scelerisque eget justo vitae, maximus pharetra velit. Proin sit amet aliquet magna. Vivamus commodo orci in dui varius mollis. Etiam consectetur sodales cursus. Fusce feugiat est vel ipsum iaculis, eu venenatis massa laoreet. Vivamus id semper eros, eget maximus metus. Nullam lobortis odio nisl, ut elementum quam elementum quis. Nullam nibh magna, dictum vel est sit amet, finibus semper tellus. Aliquam mollis aliquet auctor. Sed finibus et neque ut venenatis. In aliquet, nisi quis ultricies sollicitudin, leo arcu feugiat eros, sed sagittis ante tellus ut orci. Vestibulum augue tortor, porttitor ut molestie nec, consectetur eu tellus.

Cras efficitur velit vitae velit lacinia, sit amet tempus velit fringilla. Sed vitae condimentum sapien. Quisque congue est quis tellus convallis, at imperdiet ante gravida. Praesent sollicitudin lacus eget nulla molestie, quis iaculis erat sagittis. Donec id turpis luctus, consequat mauris tincidunt, viverra orci. Mauris quis elit elit. Etiam non scelerisque libero. Morbi massa eros, scelerisque ut orci pretium, consectetur posuere mi. Praesent faucibus, turpis eget semper elementum, mi lacus malesuada dolor, in consequat metus justo blandit massa. Nullam ornare sem et nisi rhoncus, et varius ligula varius. Morbi ut est eros. Donec euismod ullamcorper ex at imperdiet. Donec tristique donec.`;

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
