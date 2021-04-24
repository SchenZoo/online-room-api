const moment = require('moment');
const { ModelService } = require('./model.service');
const { TrackingEventModel } = require('../../database/models/tracking_event.model');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { TRACKING_EVENT_TYPES } = require('../../constants/tracking/tracking_event_types');


class TrackingEventService extends ModelService {
  constructor() {
    super(TrackingEventModel);
  }

  async trackDefaultEvent(type, resourceId, resourceModel, companyId = undefined, data = undefined) {
    return this.create({
      type,
      resourceId,
      resourceModel,
      companyId,
      data,
    });
  }

  async trackParticipantEvents(type, companyId, eventId, participantId, data = {}) {
    return this.trackDefaultEvent(
      type,
      eventId,
      MONGO_MODEL_NAMES.Event,
      companyId,
      {
        ...data,
        participantId,
      }
    );
  }

  async trackMessageCreated(companyId, eventId, participantId) {
    return this.trackParticipantEvents(
      TRACKING_EVENT_TYPES.EVENT_MESSAGE_CREATED,
      companyId,
      eventId,
      participantId
    );
  }

  async trackReviewCreated(companyId, eventId, participantId, rate) {
    return this.trackParticipantEvents(
      TRACKING_EVENT_TYPES.EVENT_REVIEW_CREATED,
      companyId,
      eventId,
      participantId,
      {
        rate,
      }
    );
  }

  async trackParticipantCreated(event, participantId) {
    return this.trackParticipantEvents(
      TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_CREATED,
      event.companyId,
      event._id,
      participantId
    );
  }

  async trackParticipantDeleted(event, participantId) {
    return this.trackParticipantEvents(
      TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_DELETED,
      event.companyId,
      event._id,
      participantId
    );
  }

  async trackParticipantKicked(event, participantId) {
    return this.trackParticipantEvents(
      TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_KICKED,
      event.companyId,
      event._id,
      participantId
    );
  }

  async trackParticipantJoined(event, participantId, lastJoinedAt) {
    if (!lastJoinedAt) {
      this.trackParticipantEvents(
        TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_UNIQUE_JOINED,
        event.companyId,
        event._id,
        participantId
      );
    }
    return this.trackParticipantEvents(
      TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_JOINED,
      event.companyId,
      event._id,
      participantId
    );
  }


  async trackParticipantLeft(event, participantId, connectedAt, disconnectedAt) {
    let duration = 0;
    if (connectedAt && disconnectedAt) {
      duration = Math.ceil(moment(disconnectedAt).diff(connectedAt, 'minutes', true));
    }
    return this.trackParticipantEvents(
      TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_LEFT,
      event.companyId,
      event._id,
      participantId,
      {
        duration,
        type: event.cardinalityType,
      }
    );
  }

  async trackWebhookSent(webhook, statusCode) {
    return this.trackDefaultEvent(
      TRACKING_EVENT_TYPES.WEBHOOK_SENT,
      webhook._id,
      MONGO_MODEL_NAMES.Webhook,
      webhook.companyId,
      {
        statusCode,
      }
    );
  }
}

module.exports = {
  TrackingEventService: new TrackingEventService(),
};
