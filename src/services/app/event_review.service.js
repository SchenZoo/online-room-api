const { ModelService } = require('./model.service');
const { EventReviewModel } = require('../../database/models');
const { TrackingEventService } = require('./tracking_event.service');

class EventReviewService extends ModelService {
  constructor() {
    super(EventReviewModel);
  }


  async create(partialDocument) {
    const doc = await super.create(partialDocument);

    TrackingEventService.trackReviewCreated(doc.companyId, doc.eventId, doc.participantId, partialDocument.rate);

    return doc;
  }

  async removeOne(companyId, eventId, participantId) {
    try {
      await super.removeOne({
        companyId,
        eventId,
        participantId,
      });
      await TrackingEventService.deleteReviewEvent(companyId, eventId, participantId);
    } catch (err) { }
  }
}

module.exports = {
  EventReviewService: new EventReviewService(),
};
