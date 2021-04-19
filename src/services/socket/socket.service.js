// eslint-disable-next-line no-unused-vars
const { Socket } = require('socket.io');
const { SocketIOAdapter } = require('./socketio.adapter');
const { OnlineTrackingService, OnlineUser } = require('./online_tracking.service');
const { SOCKET_EVENT_NAMES, SOCKET_ROOM_NAMES } = require('../../constants/socket');

class SocketService {
  /**
     *
     * @param {string} namespace
     * @param {{tabOvertaking:boolean}} [options]
     */
  constructor(namespace, options = {}) {
    const { tabOvertaking = false } = options;
    this.namespace = namespace;
    this.SOCKET_EVENT_NAMES = SOCKET_EVENT_NAMES;
    this.SOCKET_ROOM_NAMES = SOCKET_ROOM_NAMES;
    SocketIOAdapter.addNamespace(this.namespace, this._onConnect);
    this.tabOvertaking = tabOvertaking;
    this.initialized = false;
  }

  /**
   *
   * @param {(user:OnlineUser)=>any} connectUser
   * @param {(user:OnlineUser)=>any} disconnectUser
   * @param {{
    *    pingInterval?: number,
    *    responseTimeout?: number,
    *    maxPingTries?: number
    * }} options
   */
  initializeOnlineTracking(connectUser, disconnectUser, options) {
    if (!this.initialized) {
      console.error('Calling activateOnlineTracking before socket initialized.');
      return;
    }

    if (this.onlineTrackingService) {
      console.error('Calling activateOnlineTracking multiple times.');
      return;
    }

    this.onlineTrackingService = new OnlineTrackingService(connectUser, disconnectUser, (userId) => {
      this.sendEventInRoom(
        SOCKET_ROOM_NAMES.SOCKET_SERVICE_USER_ROOM(userId),
        SOCKET_EVENT_NAMES.ONLINE_ACKNOWLEDGE
      );
    }, options);
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
   * @param {{
   *   idKey: string,
   *   authorize: (socketClient:Socket)=>Promise,
   *   joinRooms: (socketClient:Socket)=>Promise,
   *   initHandlers: (socketClient:Socket)=>Promise,
   *   onDisconnect: (socketClient:Socket)=>Promise,
   * }} options
   */
  async initialize(options) {
    if (this.initialized) {
      console.error('Calling SocketService start multiple times');
      return;
    }

    this.initialized = true;

    const {
      idKey = 'id',
      authorize = () => {},
      joinRooms = () => {},
      initHandlers = () => {},
      onDisconnect = () => {},
    } = options;

    this.idKey = idKey;

    SocketIOAdapter.addNamespace(this.namespace, async (socketClient) => {
      try {
        await authorize(socketClient);
        const socketId = socketClient[this.idKey];
        const socketUserRoom = this.SOCKET_ROOM_NAMES.SOCKET_SERVICE_USER_ROOM(socketId);

        socketClient.join(socketUserRoom);

        if (this.onlineTrackingService) {
          this.onlineTrackingService.onConnect(socketId);
          socketClient.on(this.SOCKET_EVENT_NAMES.ONLINE_ACKNOWLEDGE_SUCCESS, () => this.onlineTrackingService.onUserAcknowledge(socketId));
        }

        if (this.tabOvertaking) {
          socketClient.to(socketUserRoom).emit(this.SOCKET_EVENT_NAMES.KICKED);
        }

        joinRooms(socketClient);
        initHandlers(socketClient);

        socketClient.on(SOCKET_EVENT_NAMES.DISCONNECT, () => onDisconnect(socketClient));
      } catch (err) {
        console.error('Failed connecting to socket: ', err);
        socketClient.disconnect();
      }
    });
  }
}

module.exports = {
  SocketService,
  OnlineUser,
};
