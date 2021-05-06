const { ModelService } = require('./model.service');
const { EventChatMessageModel } = require('../../database/models');
const { TrackingEventService } = require('./tracking_event.service');
const { EventSocketService } = require('./socket/event.socket_service');

class EventChatService extends ModelService {
  constructor() {
    super(EventChatMessageModel);
  }

  async create(partialDocument) {
    const doc = await super.create(partialDocument);

    TrackingEventService.trackMessageCreated(doc.companyId, doc.eventId, doc.senderId);

    EventSocketService.sendEventToAllParticipants(partialDocument.eventId,
      EventSocketService.SOCKET_EVENT_NAMES.EVENT_MESSAGE_CREATED,
      {
        message: doc,
      });

    return doc;
  }
}

module.exports = {
  EventChatService: new EventChatService(),
};
