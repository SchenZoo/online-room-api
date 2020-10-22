const http = require('http');
const { Environment } = require('./src/common');

Environment.initializeEnvironment();

require('./src/database/connections');
const { SocketProxy } = require('./src/services/socket');

const app = require('./src/app');

const port = process.env.PORT || '3000';
const server = http.createServer(app);
server.listen(port);
SocketProxy.initializeSocketFromExpressServer(server);

server.once('listening', () => {
  console.log(`Server started port:${port}`);
});

setProcessListeners();


function setProcessListeners() {
  process.on('uncaughtException', handleUncaughtException);
}

function handleUncaughtException(error) {
  console.error('Error not cought');
  console.error(error);
}
