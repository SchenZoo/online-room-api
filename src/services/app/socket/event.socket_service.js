// eslint-disable-next-line no-unused-vars
const { Socket } = require('socket.io');
const { AuthorizeError } = require('../../../errors/general');
// eslint-disable-next-line no-unused-vars
const { SocketService, OnlineUser } = require('../../socket');
const { EVENT_PARTICIPANT_ROLES } = require('../../../constants/company/event/roles');

/**
 * @typedef {{
 * partId:string,
 * partRole:keyof typeof EVENT_PARTICIPANT_ROLES,
 * eventId:string
 * } & Socket} EventServer
 */

class EventSocketService extends SocketService {
  constructor() {
    super('/event', {
      tabOvertaking: true,
    });

    this.initialize({
      idKey: 'partId',
      authorize: this._authorizeConnection.bind(this),
      joinRooms: this._joinRooms.bind(this),
      initHandlers: this._initHandlers.bind(this),
    });

    this.initializeOnlineTracking(
      this._setUserOnline.bind(this),
      this._setUserOffline.bind(this),
      {
        maxPingTries: 3,
        pingInterval: 3000,
        responseTimeout: 2500,
      }
    );
  }

  /**
   *
   * @param {string} eventId
   * @param {string} partId
   * @param {string} eventName
   * @param {any} payload
   */
  sendEventToParticipant(eventId, partId, eventName, payload) {
    this.sendEventInRoom(this.SOCKET_ROOM_NAMES.EVENT_USER_ROOM(eventId, partId), eventName, payload);
  }

  /**
   *
   * @param {string} eventId
   * @param {string} eventName
   * @param {any} payload
   */
  sendEventToAllParticipants(eventId, eventName, payload) {
    this.sendEventInRoom(this.SOCKET_ROOM_NAMES.EVENT_ROOM(eventId), eventName, payload);
  }

  /**
   *
   * @param {EventServer} socketClient
   * @param {string} eventId
   * @param {string} eventName
   * @param {any} payload
   */
  sendEventToAllParticipantsExceptCurrent(socketClient, eventId, eventName, payload) {
    socketClient.to(this.SOCKET_ROOM_NAMES.EVENT_ROOM(eventId)).emit(eventName, payload);
  }

  /**
   *
   * @param {OnlineUser} user
   */
  async _setUserOnline(user) {
    const { EventService } = require('..');

    await EventService.participantConnected(user.id);
  }

  /**
   *
   * @param {OnlineUser} user
   */
  async _setUserOffline(user) {
    const { EventService } = require('..');

    await EventService.participanDisconnected(user.id, user.connectedAt, user.disconnectedAt);
  }

  /**
   *
   * @param {EventServer} socketClient
   */
  _authorizeConnection(socketClient) {
    return new Promise((resolve, reject) => {
      socketClient.on(this.SOCKET_EVENT_NAMES.AUTH, (token) => {
        try {
          const { AuthService } = require('..');
          const { _id, eventId, role } = AuthService.verifyEventParticipantJwt(token);
          socketClient.partId = _id;
          socketClient.partRole = role;
          socketClient.eventId = eventId;

          socketClient.emit(this.SOCKET_EVENT_NAMES.AUTH_SUCCESS);
          return resolve();
        } catch (error) {
          socketClient.emit(this.SOCKET_EVENT_NAMES.AUTH_FAIL, { message: error.message });
        }
        reject(new AuthorizeError(`Event not authorized socket access, token=${token}`));
      });
    });
  }

  /**
   *
   * @param {EventServer} socketClient
   */
  _joinRooms(socketClient) {
    const { partId, partRole, eventId } = socketClient;
    socketClient.join(this.SOCKET_ROOM_NAMES.EVENT_ROOM(eventId));
    socketClient.join(this.SOCKET_ROOM_NAMES.EVENT_USER_ROOM(eventId, partId));
    if (partRole === EVENT_PARTICIPANT_ROLES.ADMIN) {
      socketClient.join(this.SOCKET_ROOM_NAMES.EVENT_ADMINS_ROOM(eventId));
    }
  }

  /**
   *
   * @param {EventServer} socketClient
   */
  async _initHandlers(socketClient) {
    const { partRole, eventId } = socketClient;

    if (partRole === EVENT_PARTICIPANT_ROLES.ADMIN) {
      socketClient.on(
        this.SOCKET_EVENT_NAMES.EVENT_DISABLE_MIC_PARTICIPANT,
        ({ partId }) => {
          this.sendEventToParticipant(eventId, partId, this.SOCKET_EVENT_NAMES.EVENT_DISABLE_MIC_PARTICIPANT);
        }
      );
      socketClient.on(
        this.SOCKET_EVENT_NAMES.EVENT_DISABLE_CAMERA_PARTICIPANT,
        ({ partId }) => {
          this.sendEventToParticipant(eventId, partId, this.SOCKET_EVENT_NAMES.EVENT_DISABLE_CAMERA_PARTICIPANT);
        }
      );
      socketClient.on(
        this.SOCKET_EVENT_NAMES.EVENT_DISABLE_MIC_ALL,
        () => {
          this.sendEventToAllParticipantsExceptCurrent(socketClient, eventId, this.SOCKET_EVENT_NAMES.EVENT_DISABLE_MIC_PARTICIPANT);
        }
      );
      socketClient.on(
        this.SOCKET_EVENT_NAMES.EVENT_DISABLE_CAMERA_ALL,
        () => {
          this.sendEventToAllParticipantsExceptCurrent(socketClient, eventId, this.SOCKET_EVENT_NAMES.EVENT_DISABLE_CAMERA_PARTICIPANT);
        }
      );
    }
  }
}


module.exports = {
  EventSocketService: new EventSocketService(),
};
