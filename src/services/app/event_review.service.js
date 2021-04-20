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
}

module.exports = {
  EventReviewService: new EventReviewService(),
};
