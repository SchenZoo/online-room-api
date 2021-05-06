const http = require('http');

const { PORT } = require('./src/config');

const loadApp = require('./src/loaders');

const { SocketIOAdapter } = require('./src/services/socket');

const app = require('./src/app');

const server = http.createServer(app);

loadApp().then(() => {
  server.listen(PORT);
  SocketIOAdapter.initializeSocketFromExpressServer(server);
});

server.once('listening', () => {
  console.log(`Server started on port: ${PORT}`);
});

setProcessListeners();


function setProcessListeners() {
  process.on('uncaughtException', (error) => {
    console.error('Error not cought');
    console.error(error);
  });
}
