const { sign } = require('./keystore/sign');
const { keystore } = require('./keystore');

module.exports = {
  async overwriteRender(req, res) {
    if (req.url === '/payload' && res.statusCode === 201 && req.method === 'POST') {
        res.jsonp({url: `localhost:3000/payload/${res.locals.data.id}`});
    } else if (req.method == 'GET' && /.payload*/.test(req.url)) {
        const signed = await sign(res.locals.data);
        res.send(signed);
    } else {
      res.send(res.locals.data);
    }
  },
  async getJwkset(_, res) {
    res.jsonp(keystore.getPublicKeys());
  }
}