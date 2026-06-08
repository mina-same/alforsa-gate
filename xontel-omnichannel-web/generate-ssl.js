// const { execSync } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// const sslDir = path.join(__dirname, 'ssl');

// // Create ssl directory
// if (!fs.existsSync(sslDir)) {
//   fs.mkdirSync(sslDir, { recursive: true });
// }

// const keyPath = path.join(sslDir, 'key.pem');
// const certPath = path.join(sslDir, 'cert.pem');

// // Check if already exist
// if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
//   console.log('✅ SSL certificates already exist');
//   process.exit(0);
// }

// // Generate using selfsigned
// try {
//   console.log('Generating self-signed certificate...');
//   const selfsigned = require('selfsigned');
  
//   const attrs = [
//     { name: 'commonName', value: '192.168.2.175' },
//     { name: 'countryName', value: 'EG' },
//     { name: 'organizationName', value: 'Xontel' }
//   ];
  
//   const pems = selfsigned.generate(attrs, { 
//     days: 365,
//     keySize: 2048,
//     algorithm: 'sha256'
//   });
  
//   if (pems && pems.private && pems.cert) {
//     fs.writeFileSync(keyPath, pems.private);
//     fs.writeFileSync(certPath, pems.cert);
    
//     console.log('✅ SSL certificates generated successfully!');
//     console.log(`📂 Key: ${keyPath}`);
//     console.log(`📂 Cert: ${certPath}`);
//     console.log('\n🔐 HTTPS is now enabled on https://192.168.2.175:5173/');
//   } else {
//     throw new Error('Failed to generate certificates');
//   }
  
// } catch (error) {
//   console.error('❌ Error:', error.message);
//   process.exit(1);
// }
