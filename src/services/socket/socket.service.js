// eslint-disable-next-line no-unused-vars
const { Socket } = require('socket.io');
const { SocketIOAdapter } = require('./socketio.adapter');
const { SOCKET_EVENT_NAMES, SOCKET_ROOM_NAMES } = require('../../constants/socket');

class SocketService {
  /**
     *
     * @param {string} namespace
     * @param {(socketClient:Socket)=>void} connectionHandler
     */
  constructor(namespace, connectionHandler) {
    this.namespace = namespace;
    this.SOCKET_EVENT_NAMES = SOCKET_EVENT_NAMES;
    this.SOCKET_ROOM_NAMES = SOCKET_ROOM_NAMES;
    SocketIOAdapter.addNamespace(this.namespace, connectionHandler);
  }


  /**
   *
   * @param {string} eventName
   * @param {any} payload
   */
  sendEvent(eventName, payload) {
    SocketIOAdapter.sendEvent(this.namespace, eventName, payload);
  }

  /**
   *
   * @param {string} roomName
   * @param {string} eventName
   * @param {any} payload
   */
  sendEventInRoom(roomName, eventName, payload) {
    SocketIOAdapter.sendEventInRoom(this.namespace, roomName, eventName, payload);
  }

  /**
   *
   * @param {string[]} roomsArray
   * @param {string} eventName
   * @param {any} payload
   */
  sendEventInMultipleRooms(roomsArray, eventName, payload) {
    if (Array.isArray(roomsArray)) {
      roomsArray.forEach((roomName) => {
        SocketIOAdapter.sendEventInRoom(this.namespace, roomName, eventName, payload);
      });
    } else {
      console.warn('sendEventInMultipleRooms was called with roomsArray not Array object');
    }
  }

  /**
   *
   * @param {Socket} socketClient
   */
  async _onConnect(socketClient) {
    try {
      await this._authorizeConnection(socketClient);

      this._joinRooms(socketClient);
      this._initHandlers(socketClient);

      socketClient.on(SOCKET_EVENT_NAMES.DISCONNECT, this._onDisconnect(socketClient));
    } catch (err) {
      console.error('Failed connecting to socket: ', err);
      socketClient.disconnect();
    }
  }

  /**
   *
   * @param {Socket} socketClient
   */
  async _onDisconnect(socketClient) {
    console.log(`${socketClient.id} disconnected`);
  }

  /**
   *
   * @param {Socket} socketClient
   */
  async _authorizeConnection(socketClient) {
    console.log(`${socketClient.id} authorized`);
    return true;
  }

  /**
   *
   * @param {Socket} socketClient
   */
  async _initHandlers(socketClient) {
    console.log(`${socketClient.id} handlers initialized`);
  }

  /**
   *
   * @param {Socket} socketClient
   */
  async _joinRooms(socketClient) {
    console.log(`${socketClient.id} joining rooms`);
  }
}

module.exports = {
  SocketService,
};
