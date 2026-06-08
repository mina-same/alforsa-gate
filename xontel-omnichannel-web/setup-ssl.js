// const fs = require('fs');
// const path = require('path');
// const selfsigned = require('selfsigned');

// const sslDir = path.join(__dirname, 'ssl');

// if (!fs.existsSync(sslDir)) {
//   fs.mkdirSync(sslDir, { recursive: true });
// }

// const keyPath = path.join(sslDir, 'key.pem');
// const certPath = path.join(sslDir, 'cert.pem');

// if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
//   console.log('✅ SSL certificates already exist');
//   process.exit(0);
// }

// try {
//   const attrs = [
//     { name: 'commonName', value: '192.168.2.175' }
//   ];
  
//   const { private: privateKey, cert } = selfsigned.generate(attrs, { 
//     days: 365 
//   });
  
//   fs.writeFileSync(keyPath, privateKey);
//   fs.writeFileSync(certPath, cert);
  
//   console.log('✅ SSL certificates created!');
//   console.log(`Key: ${keyPath}`);
//   console.log(`Cert: ${certPath}`);
//   console.log('🔐 HTTPS enabled!');
  
// } catch (err) {
//   console.error('Error:', err.message);
//   process.exit(1);
// }
