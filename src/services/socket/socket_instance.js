const { SocketProxy } = require('./socket_proxy');
const { SOCKET_EVENT_NAMES } = require('../../constants/socket/event_names.socket');
const { SOCKET_ROOMS } = require('../../constants/socket/rooms.socket');


class SocketInstance {
  constructor(namespace) {
    this.namespace = namespace;
    this.SOCKET_EVENT_NAMES = SOCKET_EVENT_NAMES;
    this.SOCKET_ROOMS = SOCKET_ROOMS;
  }

  initialize(connectionHandlers) {
    SocketProxy.addNamespace(this.namespace, connectionHandlers);
  }

  sendEvent(eventName, payload) {
    SocketProxy.sendEvent(this.namespace, eventName, payload);
  }

  sendEventInRoom(roomName, eventName, payload) {
    SocketProxy.sendEventInRoom(this.namespace, roomName, eventName, payload);
  }

  sendEventInMultipleRooms(roomsArray, eventName, payload) {
    if (Array.isArray(roomsArray)) {
      roomsArray.forEach((roomName) => {
        SocketProxy.sendEventInRoom(this.namespace, roomName, eventName, payload);
      });
    } else {
      console.warn('sendEventInMultipleRooms was called with roomsArray not Array object');
    }
  }
}

module.exports = {
  SocketInstance,
};
