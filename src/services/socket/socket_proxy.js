const socket = require('socket.io');

const pendingNamespaces = [];
const pendingEvents = [];

// :TODO add outside socket event sending using socket.io-emitter and socket.io-redis if required
class SocketProxy {
  constructor() {
    this.namespaces = {};
    this.io = null;
  }

  /**
   *@param server is the instance made with http or https instance
   *
   * */
  initializeSocketFromExpressServer(server) {
    this.io = socket.listen(server);
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
  }

  addNamespace(namespaceName, connectionListener) {
    if (this.io) {
      const namespace = this.io.of(namespaceName);
      this.namespaces[namespaceName] = namespace;
      namespace.on('connection', connectionListener);
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
}

module.exports = {
  SocketProxy: new SocketProxy(),
};
