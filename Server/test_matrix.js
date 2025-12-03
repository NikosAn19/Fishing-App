const http = require('http');

function testUrl(path) {
  const options = {
    hostname: 'localhost',
    port: 8008,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Path: ${path} -> Status: ${res.statusCode}`);
    res.on('data', () => {}); // Consume data
  });

  req.on('error', (e) => {
    console.error(`Path: ${path} -> Error: ${e.message}`);
  });

  req.end();
}

console.log('Testing Matrix Server Paths...');
testUrl('/_matrix/client/versions');
testUrl('/_matrix/_matrix/client/versions');
