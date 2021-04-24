const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { WEBHOOK_EVENT_TYPES } = require('../../constants/company/webhook/event_types');

const { Schema } = mongoose;

const WebhookLogSchema = new Schema(
  {
    requestData: {
      type: Schema.Types.Mixed,
      immutable: true,
    },
    requestHeaders: {
      type: Schema.Types.Mixed,
      immutable: true,
    },
    responseCode: {
      type: Number,
      immutable: true,
    },
    responseData: {
      type: Schema.Types.Mixed,
      immutable: true,
    },
    responseHeaders: {
      type: Schema.Types.Mixed,
      immutable: true,
    },
    signature: {
      type: String,
      immutable: true,
    },
    eventType: {
      type: String,
      enum: Object.values(WEBHOOK_EVENT_TYPES),
      required: true,
    },
    webhookId: {
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
  },
  { timestamps: true }
);

module.exports = {
  WebhookLogModel: mongoose.model(MONGO_MODEL_NAMES.WebhookLog, WebhookLogSchema),
  WebhookLogSchema,
};
