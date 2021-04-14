const { ModelService } = require('./model.service');
const { EventModel } = require('../../database/models');
const { Randoms } = require('../../common');
const { BadBodyError } = require('../../errors/general');


class EventService extends ModelService {
  constructor() {
    super(EventModel);
  }


  create(partialDocument) {
    return super.create({
      ...partialDocument,
      token: Randoms.getRandomString(),
    });
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
}

module.exports = {
  EventService: new EventService(),
};
