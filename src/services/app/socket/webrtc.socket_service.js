// eslint-disable-next-line no-unused-vars
const { Socket } = require('socket.io');
const { AuthorizeError } = require('../../../errors/general');
// eslint-disable-next-line no-unused-vars
const { SocketService, OnlineUser } = require('../../socket');
const { Encryptions } = require('../../../common');
const { WEBRTC_JWT_SECRET } = require('../../../config');

/**
 * @typedef {{
 * peerId:string,
 * groupId:string
 * } & Socket} WebRTCServer
 */

class WebRTCSocketService extends SocketService {
  constructor() {
    super('/webrtc', {
      tabOvertaking: true,
    });

    this.initialize({
      idKey: 'peerId',
      authorize: this._authorizeConnection.bind(this),
      joinRooms: this._joinRooms.bind(this),
      initHandlers: this._initHandlers.bind(this),
    });

    this.initializeOnlineTracking(
      () => {},
      this._setUserOffline.bind(this),
      {
        maxPingTries: 2,
        pingInterval: 2000,
        responseTimeout: 1900,
        additionalOnlineData: (socketClient) => ({ groupId: socketClient.groupId }),
      }
    );
  }

  verifyToken(token) {
    const { peerId, groupId } = Encryptions.verifyJWT(token, WEBRTC_JWT_SECRET);

    return {
      peerId,
      groupId,
    };
  }

  async signToken(groupId, peerId, expiresIn = 14400) {
    return Encryptions.signJWT({
      peerId,
      groupId,
    },
    WEBRTC_JWT_SECRET, {
      expiresIn,
    });
  }

  /**
   *
   * @param {string} peerId
   * @param {string} eventName
   * @param {any} payload
   */
  sendEventToPeer(peerId, eventName, payload) {
    this.sendEventInRoom(this.SOCKET_ROOM_NAMES.PEER_ROOM(peerId), eventName, payload);
  }

  /**
   *
   * @param {string} groupId
   * @param {string} eventName
   * @param {any} payload
   */
  sendEventToGroup(groupId, eventName, payload) {
    this.sendEventInRoom(this.SOCKET_ROOM_NAMES.PEERS_GROUP_ROOM(groupId), eventName, payload);
  }

  /**
   *
   * @param {OnlineUser} user
   */
  async _setUserOffline(user) {
    const { id, additionalData = { } } = user;

    if (additionalData.groupId) {
      this.sendEventToGroup(additionalData.groupId, this.SOCKET_EVENT_NAMES.WEBRTC_PEER_DISCONNECTED, {
        peerId: id,
      });
    } else {
      console.warn('Webrtc disconnected but no groupId in additional data');
    }
  }

  /**
   *
   * @param {WebRTCServer} socketClient
   */
  _authorizeConnection(socketClient) {
    return new Promise((resolve, reject) => {
      socketClient.on(this.SOCKET_EVENT_NAMES.AUTH, (token) => {
        try {
          const { peerId, groupId } = this.verifyToken(token);
          socketClient.peerId = peerId;
          socketClient.groupId = groupId;

          socketClient.emit(this.SOCKET_EVENT_NAMES.AUTH_SUCCESS);
          this.sendEventToGroup(groupId, this.SOCKET_EVENT_NAMES.WEBRTC_PEER_CONNECTED, { peerId });
          return resolve();
        } catch (error) {
          socketClient.emit(this.SOCKET_EVENT_NAMES.AUTH_FAIL, { message: error.message });
        }
        reject(new AuthorizeError(`webrtc not authorized socket access, token=${token}`));
      });
    });
  }

  /**
   *
   * @param {WebRTCServer} socketClient
   */
  _joinRooms(socketClient) {
    const { peerId, groupId } = socketClient;

    socketClient.join(this.SOCKET_ROOM_NAMES.PEER_ROOM(peerId));
    socketClient.join(this.SOCKET_ROOM_NAMES.PEERS_GROUP_ROOM(groupId));
  }

  /**
   *
   * @param {WebRTCServer} socketClient
   */
  async _initHandlers(socketClient) {
    const { peerId, groupId } = socketClient;
    socketClient.on(
      this.SOCKET_EVENT_NAMES.WEBRTC_OFFER,
      ({ offer, receiverId }) => {
        this.sendEventToPeer(
          receiverId,
          this.SOCKET_EVENT_NAMES.WEBRTC_OFFER,
          {
            offer,
            senderId: peerId,
          }
        );
      }
    );
    socketClient.on(
      this.SOCKET_EVENT_NAMES.WEBRTC_ANSWER,
      ({ answer, receiverId }) => {
        this.sendEventToPeer(
          receiverId,
          this.SOCKET_EVENT_NAMES.WEBRTC_ANSWER,
          {
            answer,
            senderId: peerId,
          }
        );
      }
    );

    socketClient.on(
      this.SOCKET_EVENT_NAMES.WEBRTC_ICE_CANDIDATE,
      ({ candidate, receiverId }) => {
        this.sendEventToPeer(
          receiverId,
          this.SOCKET_EVENT_NAMES.WEBRTC_ICE_CANDIDATE,
          {
            candidate,
            senderId: peerId,
          }
        );
      }
    );

    socketClient.on(
      this.SOCKET_EVENT_NAMES.WEBRTC_TRACK_OFF,
      ({ trackKind }) => {
        this.sendEventToGroup(groupId, this.SOCKET_EVENT_NAMES.WEBRTC_TRACK_OFF, { trackKind, senderId: peerId });
      }
    );
  }
}


module.exports = {
  WebRTCSocketService: new WebRTCSocketService(),
};
