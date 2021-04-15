const { ModelService } = require('./model.service');
const { EventModel } = require('../../database/models');
const { Randoms } = require('../../common');
const { BadBodyError, NotFoundError, AuthorizeError } = require('../../errors/general');
const { AuthService } = require('./auth.service');
const { DefaultVideoService } = require('../twilio');
const { EVENT_CARDINALITY_TYPE } = require('../../constants/company/event/types');
const { EventSocketService } = require('./socket/event.socket_service');


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

  async loginParticipantUsingToken(participantToken) {
    const event = await this.getOne({
      'participants.token': participantToken,
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

  getEventTwilioToken(event, participantId) {
    if (event.cardinalityType !== EVENT_CARDINALITY_TYPE.GROUP) {
      throw new BadBodyError(`Only ${EVENT_CARDINALITY_TYPE.GROUP} events work with video tokens!`, true);
    }

    return DefaultVideoService.getVideoToken(event._id, participantId);
  }

  async addParticipants(event, partialParticipants) {
    if (!Array.isArray(partialParticipants)) {
      throw new BadBodyError('Body must be array of participants', true);
    }

    event.participants.push(...partialParticipants.map((part) => ({
      ...part,
      isKicked: false,
      hasJoined: false,
      lastJoinedAt: undefined,
      token: Randoms.getRandomString(),
    })));

    return event.save();
  }

  async removeParticipant(event, participantId) {
    event.participants = event.participants.filter((part) => `${part._id}` !== `${participantId}`);

    return event.save();
  }

  async kickParticipant(event, participantId) {
    const participant = event.participants.find((part) => `${part._id}` === `${participantId}`);

    if (!participant) {
      throw new NotFoundError('Participant not found!', true);
    }

    participant.isKicked = true;

    EventSocketService.sendEventToParticipant(event._id, participantId, EventSocketService.SOCKET_EVENT_NAMES.EVENT_KICK_PARTICIPANT);

    return event.save();
  }
}

module.exports = {
  EventService: new EventService(),
};
