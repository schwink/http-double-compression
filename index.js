
import { createServer } from 'http';

const server = createServer((req, res) => {
    res.statusCode = 404;
    res.end();
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
