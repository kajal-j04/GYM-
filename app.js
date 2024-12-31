// Import the http module
const http = require('http');

// Create a server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello!');
});

// Listen on port 3000
server.listen(3002, () => {
    console.log('Server running at http://localhost:3000/');
});
