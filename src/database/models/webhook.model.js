const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { WEBHOOK_EVENT_TYPES } = require('../../constants/company/webhook/event_types');
const { addSearchableFields } = require('../plugins');

const { Schema } = mongoose;

const WebhookSchema = new Schema(
  {
    name: {
      type: String,
    },
    requestUrl: {
      type: String,
      required: true,
    },
    requestMethod: {
      type: String,
      required: true,
      enum: ['POST', 'GET'],
      default: 'POST',
    },
    headers: {
      type: new Schema({
        Authorization: {
          type: String,
        },
      }, { _id: false, id: false }),
    },
    eventTypes: {
      type: [String],
      required: true,
      enum: Object.values(WEBHOOK_EVENT_TYPES),
      validate: {
        validator(value) {
          return value.length !== 0;
        },
        message: 'Webhook must have at least one event type.',
      },
    },
    secret: {
      type: String,
      required: true,
      immutable: true,
      unique: true,
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

WebhookSchema.plugin(addSearchableFields(['name']));

module.exports = {
  WebhookModel: mongoose.model(MONGO_MODEL_NAMES.Webhook, WebhookSchema),
  WebhookSchema,
};
