const { keystore } = require('./index');
const path = require('path');

module.exports = {
  async sign (payload) {
    const certFile = process.env.CERT || path.join(__dirname, '../certs/privateKey.key')
    console.log(certFile);
    const privateKey = await keystore.loadPrivateCert(certFile, 'utf-8', 'pem');

    const keyFile = process.env.KEY || path.join(__dirname, '../certs/certificate.crt')
    const publicKey = await keystore.loadPublicCert(keyFile, 'utf-8', 'pem');
  
    const signed = await keystore.sign(privateKey, publicKey, payload, 'utf-8');

    return signed;
  }
}