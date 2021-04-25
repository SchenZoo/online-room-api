// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const { ModelService } = require('./model.service');
const { EventModel } = require('../../database/models');
const { Randoms, ObjectTransforms } = require('../../common');
const { BadBodyError, NotFoundError, AuthorizeError } = require('../../errors/general');
const { AuthService } = require('./auth.service');
const { WebhookService } = require('./webhook.service');
const { DefaultVideoService } = require('../twilio');
const { EVENT_CARDINALITY_TYPE, EVENT_ACCESS_TYPES } = require('../../constants/company/event/types');
const { WEBHOOK_EVENT_TYPES } = require('../../constants/company/webhook/event_types');
const { EventSocketService } = require('./socket/event.socket_service');
const { TrackingEventService } = require('./tracking_event.service');


class EventService extends ModelService {
  constructor() {
    super(EventModel);
  }


  async create(partialDocument) {
    return super.create({
      ...partialDocument,
      token: Randoms.getRandomString(),
    });
  }

  async loginParticipantUsingToken(companyId, participantToken) {
    const event = await this.getOne({
      'participants.token': participantToken,
      companyId,
    }, {
      findOptions: {
        lean: true,
      },
    });

    const participant = event.participants.find((part) => part.token === participantToken);

    if (participant.isKicked) {
      throw new AuthorizeError('You have been kicked from event', true);
    }

    const token = await AuthService.signEventParticipantJwt(event._id, participant._id, participant.role);

    event.participants.forEach((part) => {
      part.token = undefined;
    });

    return {
      token,
      participant,
      event,
    };
  }

  async getOpenEventAuth(companyId, eventToken) {
    let event = await this.getOne({
      token: eventToken,
      companyId,
      accessType: EVENT_ACCESS_TYPES.OPEN,
    });

    if (event.participants.length >= event.seats) {
      throw new BadBodyError('Event is full!', true);
    }

    await this.addParticipants(event, [{}]);

    const participant = event.participants[event.participants.length - 1];

    const token = await AuthService.signEventParticipantJwt(event._id, participant._id, participant.role);

    event = event.toObject();

    event.participants.forEach((part) => {
      part.token = undefined;
    });

    return {
      token,
      participant,
      event,
    };
  }

  getEventTwilioToken(event, participantId) {
    if (event.cardinalityType !== EVENT_CARDINALITY_TYPE.GROUP) {
      throw new BadBodyError(`Only ${EVENT_CARDINALITY_TYPE.GROUP} events work with video tokens!`, true);
    }

    return DefaultVideoService.getVideoToken(event._id, participantId);
  }

  /**
   *
   * @param {mongoose.Document} event
   * @param {string|mongoose.Types.ObjectId} participantId
   *
   * @returns {mongoose.Document}
   */
  getParticipant(event, participantId) {
    const participant = event.participants.find((part) => `${part._id}` === `${participantId}`);
    if (!participant) {
      throw new NotFoundError('Participant not found!', true);
    }
    return participant;
  }

  /**
   *
   * @param {mongoose.Document} event
   */
  async saveEventChanges(event) {
    await event.save();

    EventSocketService.sendEventToAllParticipants(event._id,
      EventSocketService.SOCKET_EVENT_NAMES.EVENT_CHANGED, {
        event,
      });

    return event;
  }

  async addParticipants(event, partialParticipants) {
    if (!Array.isArray(partialParticipants)) {
      throw new BadBodyError('Body must be array of participants', true);
    }

    if (event.participants.length + partialParticipants.length > event.seats) {
      throw new BadBodyError('Event is full!', true);
    }

    event.participants.push(...partialParticipants.map((part) => ({
      ...part,
      isKicked: false,
      hasJoined: false,
      lastJoinedAt: undefined,
      token: Randoms.getRandomString(),
    })));

    event.participants.slice(-partialParticipants.length).forEach((part) => {
      TrackingEventService.trackParticipantCreated(event, part._id);
    });

    return this.saveEventChanges(event);
  }

  async removeParticipant(event, participantId) {
    const prevLength = event.participants.length;
    event.participants = event.participants.filter((part) => `${part._id}` !== `${participantId}`);

    EventSocketService.sendEventToParticipant(event._id, participantId, EventSocketService.SOCKET_EVENT_NAMES.EVENT_KICK_PARTICIPANT);

    if (prevLength !== event.participants.length) {
      TrackingEventService.trackParticipantDeleted(event, participantId);
    }

    return this.saveEventChanges(event);
  }

  async kickParticipant(event, participantId) {
    const participant = this.getParticipant(event, participantId);

    if (!participant.isKicked) {
      TrackingEventService.trackParticipantKicked(event, participantId);
    }

    participant.isKicked = true;

    EventSocketService.sendEventToParticipant(event._id, participantId, EventSocketService.SOCKET_EVENT_NAMES.EVENT_KICK_PARTICIPANT);

    WebhookService.sendCompanyWebhooks(event.companyId, WEBHOOK_EVENT_TYPES.EVENT_PARTICIPANT_KICKED, {
      event,
    });

    return this.saveEventChanges(event);
  }

  async updateParticipant(event, participantId, partialDocument) {
    const participant = this.getParticipant(event, participantId);

    ObjectTransforms.updateObject(participant, partialDocument, true);

    await this.saveEventChanges(event);

    return participant;
  }

  async participantConnected(participantId) {
    const event = await this.getOne({
      'participants._id': participantId,
    });

    const participant = this.getParticipant(event, participantId);

    TrackingEventService.trackParticipantJoined(event, participantId, participant.lastJoinedAt);

    participant.hasJoined = true;
    participant.lastJoinedAt = new Date();

    return this.saveEventChanges(event);
  }

  async participanDisconnected(participantId, connectedAt, disconnectedAt) {
    const event = await this.getOne({
      'participants._id': participantId,
    });

    const participant = this.getParticipant(event, participantId);

    participant.hasJoined = false;

    TrackingEventService.trackParticipantLeft(event, participantId, connectedAt, disconnectedAt);

    return this.saveEventChanges(event);
  }

  async trackParticipantOnlineTime(event) {
    return this.saveEventChanges(event);
  }

  async restartAllParticipantsOnlineStatus() {
    return EventModel.updateMany({}, {
      $set: { 'participants.$[].hasJoined': false },
    });
  }
}

module.exports = {
  EventService: new EventService(),
};
