const socket = require('socket.io');

const pendingNamespaces = [];
const pendingEvents = [];

class SocketIOAdapter {
  constructor() {
    this.namespaces = {};
    this.io = null;
  }

  /**
   *@param server is the instance made with http or https instance
   *
   * */
  initializeSocketFromExpressServer(server) {
    this.io = socket(server, {
      cors: '*',
    });
    pendingNamespaces.forEach(({ namespaceName, connectionListener }) => {
      this.addNamespace(namespaceName, connectionListener);
    });
    pendingEvents.forEach(({
      namespaceName, roomName, eventName, payload,
    }) => {
      if (roomName) {
        this.sendEventInRoom(namespaceName, roomName, eventName, payload);
      } else {
        this.sendEvent(namespaceName, eventName, payload);
      }
    });
    console.log('Socket server started');
  }

  addNamespace(namespaceName, connectionListener) {
    if (this.io) {
      const namespace = this.io.of(namespaceName);
      this.namespaces[namespaceName] = namespace;
      namespace.on('connection', (socketClient) => connectionListener(socketClient));
    } else {
      pendingNamespaces.push({ namespaceName, connectionListener });
    }
  }

  sendEvent(namespaceName, eventName, payload) {
    if (this.io) {
      this.io.of(namespaceName).emit(eventName, payload);
    } else {
      pendingEvents.push({ namespaceName, eventName, payload });
    }
  }

  sendEventInRoom(namespaceName, roomName, eventName, payload) {
    if (this.io) {
      this.io.of(namespaceName).to(roomName).emit(eventName, payload);
    } else {
      pendingEvents.push({
        namespaceName, roomName, eventName, payload,
      });
    }
  }

  async close() {
    return new Promise((resolve) => {
      if (this.io) {
        this.io.close(() => {
          console.log('Socket closed');
          return resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = {
  SocketIOAdapter: new SocketIOAdapter(),
};
