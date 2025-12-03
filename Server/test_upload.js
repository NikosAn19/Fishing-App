const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a dummy file to upload
const filePath = path.join(__dirname, 'test_avatar.png');
fs.writeFileSync(filePath, 'fake image content');

const fileStats = fs.statSync(filePath);

const uploadOptions = {
  hostname: 'localhost',
  port: 8008,
  path: '/_matrix/media/v3/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'image/png',
    'Content-Length': fileStats.size
  }
};

function loginAndUpload() {
    const loginData = JSON.stringify({
        type: "m.login.password",
        user: "test_uploader",
        password: "password123"
    });
    
    const loginOptions = {
        hostname: 'localhost',
        port: 8008,
        path: '/_matrix/client/v3/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };
    
    console.log('Attempting to login as test_uploader...');
    const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.access_token) {
                    console.log('✅ Login Successful');
                    uploadOptions.headers['Authorization'] = `Bearer ${json.access_token}`;
                    performUpload(json.access_token);
                } else {
                    console.error('❌ Login Failed:', json);
                }
            } catch (e) { console.error(e); }
        });
    });
    req.write(loginData);
    req.end();
}

function performUpload(accessToken) {
    console.log('Testing Direct Upload to Synapse (Port 8008)...');

    const req = http.request(uploadOptions, (res) => {
        console.log(`Status: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Response:', data);
            
            try {
                const json = JSON.parse(data);
                if (json.content_uri) {
                    console.log('✅ Upload Successful! URI:', json.content_uri);
                    checkDownload(json.content_uri, accessToken);
                }
            } catch (e) {
                console.error('Failed to parse response');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Error: ${e.message}`);
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(req);
}

function checkDownload(mxcUri, accessToken) {
    const mediaId = mxcUri.split('/').pop();
    const serverName = mxcUri.split('/')[2];
    
    // Try authenticated endpoint with query param
    const downloadPath = `/_matrix/client/v1/media/download/${serverName}/${mediaId}?access_token=${accessToken}`;
    
    console.log(`\nVerifying Authenticated Download (Query Param): ${downloadPath}`);
    
    const dlOptions = {
        hostname: 'localhost',
        port: 8008,
        path: downloadPath,
        method: 'GET'
    };
    
    const dlReq = http.request(dlOptions, (res) => {
        console.log(`Download Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log('✅ Persistence Verified!');
        } else {
            console.log('❌ Persistence Failed (404)');
        }
    });
    dlReq.end();
}

// Start
loginAndUpload();