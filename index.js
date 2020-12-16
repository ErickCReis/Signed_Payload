const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const { overwriteRender, getJwkset } = require('./payload');

server.use(jsonServer.bodyParser);
server.use(middlewares);
server.get('/jwk', getJwkset);

server.use(router);

router.render = overwriteRender;

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('JSON Server is running');
});
