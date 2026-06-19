const http = require('http');

const loginData = JSON.stringify({
  mobileNumber: '1234567890',
  password: 'admin123'
});

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    
    const req2 = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('Status:', res2.statusCode);
        console.log('Body:', data2);
      });
    });
    req2.end();
  });
});

req.write(loginData);
req.end();
