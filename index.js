const http = require('http');

require('./src/loaders');
const { SocketIOAdapter } = require('./src/services/socket');

const app = require('./src/app');

const port = process.env.PORT || '3000';
const server = http.createServer(app);
server.listen(port);
SocketIOAdapter.initializeSocketFromExpressServer(server);

server.once('listening', () => {
  console.log(`Server started port:${port}`);
});

setProcessListeners();


function setProcessListeners() {
  process.on('uncaughtException', (error) => {
    console.error('Error not cought');
    console.error(error);
  });
}
