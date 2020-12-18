require('dotenv/config');
const jose = require('node-jose');

const { cert_to_x5c } = require('./utils/cert_to_x5c');

class KeyStore {
  constructor() {
    if (!KeyStore.instance) {
      this._keystore = jose.JWK.createKeyStore();
      this.keys = {
        certificate: null,
        privateKey: null,
      }
    }
  }
  
  async checkCertificate() {
    if(!this.keys.certificate) {
      this.keys.certificate = await this.loadCertificate();
    }
    if(!this.keys.privateKey) {
      this.keys.privateKey = await this.loadPrivateKey();
    }
  }
  
  async loadCertificate (){
    let props = {
      key_ops: 'verify',
      x5c: cert_to_x5c(certificate)
    };
    return await this._keystore.add(certificate, 'pem', props);
  }
  
  async loadPrivateKey() {
    let props = {
      key_ops: 'sign'
    };
    return await this._keystore.add(privateKey, 'pem', props);
  }
  
  async getFingerprint(key) {
    let fingerprint =  await key.thumbprint('SHA-1').then(function (print) {
      return jose.util.base64url.encode(print);
    });
    return fingerprint;
  }
  
  async sign(payload) {
    await this.checkCertificate();
    
    let options = {
      fields: {
        x5t: await this.getFingerprint(this.keys.certificate),
        jku: `${process.env.API_PV_URL}/jwk`,
        kid: this.keys.certificate.kid
      },
      alg: 'RS256',
      format: 'compact'
    }
    let signed = await jose.JWS
      .createSign(options, this.keys.privateKey)
      .update(JSON.stringify(payload), 'utf-8')
      .final();
    return signed;
  }
  
  async getPublicKeys() {
    await this.checkCertificate();

    let jwkset = this._keystore.toJSON();
    let publicKeys = jwkset.keys.filter((key) => key.key_ops == 'verify');
    return publicKeys;
  }
}

const certificate = process.env.CERTIFICATE;
const privateKey = process.env.PRIVATE_KEY;

const keystore = new KeyStore();
Object.freeze(keystore);

module.exports = { keystore };
