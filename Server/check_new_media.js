const http = require('http');

function checkPath(path, label) {
  const options = {
    hostname: 'localhost',
    port: 8008,
    path: path,
    method: 'GET'
  };

  console.log(`Checking ${label}: ${path}`);

  const req = http.request(options, (res) => {
    console.log(`${label} Status: ${res.statusCode}`);
    res.on('data', () => {}); // Consume data
  });

  req.on('error', (e) => {
    console.error(`${label} Error: ${e.message}`);
  });

  req.end();
}

// Check the NEW media ID from the logs
checkPath('/_matrix/media/v3/download/localhost/pzbjKcUOtzuKsetcGdqEkCTU', 'New Media');
