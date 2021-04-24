const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const { WEBHOOK_EVENT_TYPES } = require('../../../constants/company/webhook/event_types');
const { addSortableFields, addHookWebhooks } = require('../../plugins');

const { Schema } = mongoose;

const EventReviewSchema = new Schema({
  text: {
    type: String,
  },
  rate: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  participantId: {
    type: Schema.Types.ObjectId,
    required: true,
    immutable: true,
    unique: true,
  },
  eventId: {
    type: Schema.Types.ObjectId,
    required: true,
    immutable: true,
    index: 1,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    required: true,
    immutable: true,
    index: 1,
  },
}, { timestamps: true });

EventReviewSchema.plugin(addSortableFields(['createdAt']));

EventReviewSchema.plugin(addHookWebhooks({
  propertyName: 'review',
  create: WEBHOOK_EVENT_TYPES.EVENT_REVIEW_CREATED,
}));

module.exports = {
  EventReviewModel: mongoose.model(MONGO_MODEL_NAMES.EventReview, EventReviewSchema),
  EventReviewSchema,
};
