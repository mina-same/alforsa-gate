// const { execSync } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// const sslDir = path.join(__dirname, 'ssl');

// // Create ssl directory if it doesn't exist
// if (!fs.existsSync(sslDir)) {
//   fs.mkdirSync(sslDir, { recursive: true });
// }

// // Check if certificates already exist
// const keyPath = path.join(sslDir, 'key.pem');
// const certPath = path.join(sslDir, 'cert.pem');

// if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
//   console.log('✅ SSL certificates already exist');
//   process.exit(0);
// }

// // Try to generate using PowerShell
// try {
//   console.log('Generating self-signed SSL certificate...');
  
//   const psCommand = `
//     $cert = New-SelfSignedCertificate -DnsName "192.168.2.175", "localhost" -CertStoreLocation "cert:\\CurrentUser\\My" -FriendlyName "Xontel Dev"
//     $certPath = "${certPath}"
//     $keyPath = "${keyPath}"
    
//     [System.io.file]::WriteAllBytes($certPath, [System.Text.Encoding]::ASCII.GetBytes((openssl x509 -inform PEM -in $cert.PSPath)))
//   `;
  
//   // Alternative: Use Node's crypto
//   const { createPrivateKey, createPublicKey } = require('crypto');
//   const { generateKeyPairSync } = require('crypto');
  
//   const { privateKey, publicKey } = generateKeyPairSync('rsa', {
//     modulusLength: 2048,
//   });
  
//   const privateKeyPem = privateKey.export({ format: 'pem', type: 'pkcs8' });
//   fs.writeFileSync(keyPath, privateKeyPem);
  
//   console.log('✅ Private key generated');
  
//   // For self-signed cert, we'll use a simple approach
//   const cmd = `certutil -user -silent || echo "Note: Run as admin for persistent cert"`;
  
//   console.log('📝 Using Node.js to generate certificates');
//   console.log('⚠️  For production, use: npx mkcert 192.168.2.175 localhost');
  
// } catch (error) {
//   console.error('Error generating certificates:', error.message);
//   process.exit(1);
// }

// console.log('✅ SSL setup complete');
