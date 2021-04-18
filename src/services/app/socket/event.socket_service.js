// eslint-disable-next-line no-unused-vars
const { Socket } = require('socket.io');
// eslint-disable-next-line no-unused-vars
const { SocketService, OnlineUser } = require('../../socket');
const { EVENT_PARTICIPANT_ROLES } = require('../../../constants/company/event/roles');
const { EVENT_CARDINALITY_TYPE } = require('../../../constants/company/event/types');

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
      authorize: this._authorizeConnection,
      joinRooms: this._joinRooms,
      initHandlers: this._initHandlers,
    });

    this.initializeOnlineTracking(
      this._setUserOnline,
      this._setUserOffline,
      {
        maxPingTries: 3,
        pingInterval: 7000,
        responseTimeout: 5000,
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

    await EventService.participanDisconnected(user.id);
  }

  /**
   *
   * @param {EventServer} socketClient
   */
  _authorizeConnection(socketClient) {
    return new Promise((resolve, reject) => {
      socketClient.on(this.SOCKET_EVENT_NAMES.AUTH, async (token) => {
        try {
          const { AuthService } = require('..');
          const { _id, eventId, role } = AuthService.verifyEventParticipantJwt(token);
          socketClient.partId = _id;
          socketClient.partRole = role;
          socketClient.eventId = eventId;

          socketClient.emit(this.SOCKET_EVENT_NAMES.AUTH_SUCCESS);
          resolve();
        } catch (error) {
          socketClient.emit(this.SOCKET_EVENT_NAMES.AUTH_FAIL, { message: error.message });
        }
        reject();
      });
    });
  }

  /**
   *
   * @param {EventServer} socketClient
   */
  async _onDisconnect(socketClient) {
    const { EventService } = require('..');

    const { partId, eventId } = socketClient;

    if (partId && eventId) {
      const event = await EventService.getOne({ _id: eventId });

      await EventService.participanDisconnected(event, partId);
    }
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
    const { EventService } = require('..');

    const { eventId } = socketClient;
    const event = await EventService.getOne({ _id: eventId });

    if (event.cardinalityType === EVENT_CARDINALITY_TYPE.PTP) {
      await this._initPTPHandlers(socketClient);
    }

    this._initMuteHandlers(socketClient);
  }

  /**
   *
   * @param {EventServer} socketClient
   */
  async _initMuteHandlers(socketClient) {
    const { partRole, eventId } = socketClient;

    if (partRole === EVENT_PARTICIPANT_ROLES.ADMIN) {
      socketClient.on(
        this.SOCKET_EVENT_NAMES.EVENT_MUTE_PARTICIPANT,
        ({ partId }) => {
          this.sendEventToParticipant(eventId, partId, this.SOCKET_EVENT_NAMES.EVENT_MUTE_PARTICIPANT);
        }
      );
    }
  }

  /**
   *
   * @param {EventServer} socketClient
   */
  async _initPTPHandlers(socketClient) {
    const { partId, eventId } = socketClient;
    socketClient.on(
      this.SOCKET_EVENT_NAMES.WEBRTC_SEND_OFFER,
      ({ offer, offerReceiver }) => {
        console.log(`Offer : (${partId})->(${offerReceiver})`);
        this.sendEventToParticipant(
          eventId,
          offerReceiver,
          this.SOCKET_EVENT_NAMES.WEBRTC_RECEIVE_OFFER,
          {
            offer,
            offerSender: partId,
          }
        );
      }
    );
    socketClient.on(
      this.SOCKET_EVENT_NAMES.WEBRTC_SEND_ANSWER,
      ({ answer, answerReceiver }) => {
        console.log(`Answer : (${partId})->(${answerReceiver})`);
        this.sendEventToParticipant(
          eventId,
          answerReceiver,
          this.SOCKET_EVENT_NAMES.WEBRTC_RECEIVE_ANSWER,
          {
            answer,
            answerSender: partId,
          }
        );
      }
    );

    socketClient.on(
      this.SOCKET_EVENT_NAMES.WEBRTC_SEND_CANDIDATE,
      ({ candidate, candidateReceiver }) => {
        console.log(`Candidate : (${partId})->(${candidateReceiver})`);
        this.sendEventToParticipant(
          eventId,
          candidateReceiver,
          this.SOCKET_EVENT_NAMES.WEBRTC_RECEIVE_CANDIDATE,
          {
            candidate,
            candidateSender: partId,
          }
        );
      }
    );
  }
}


module.exports = {
  EventSocketService: new EventSocketService(),
};
