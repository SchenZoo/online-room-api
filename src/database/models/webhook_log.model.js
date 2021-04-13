const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');

const { Schema } = mongoose;

const WebhookLogSchema = new Schema(
  {
    requestData: {
      type: Schema.Types.Mixed,
    },
    responseData: {
      type: Schema.Types.Mixed,
    },
    responseCode: {
      type: Number,
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