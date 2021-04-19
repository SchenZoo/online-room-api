const { ModelService } = require('./model.service');
const { ChatMessageModel } = require('../../database/models');
const { TrackingEventService } = require('./tracking_event.service');

class EventChatService extends ModelService {
  constructor() {
    super(ChatMessageModel);
  }

  async create(partialDocument) {
    const doc = await super.create(partialDocument);

    TrackingEventService.trackMessageCreated(doc.companyId, doc.eventId, doc.senderId);

    return doc;
  }
}

module.exports = {
  EventChatService: new EventChatService(),
};
