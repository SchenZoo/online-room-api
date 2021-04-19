const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const { TRACKING_EVENT_TYPES } = require('../../../constants/tracking/tracking_event_types');
const { API_KEY_PERMISSIONS } = require('../../../constants/company/user/permissions');
const { addSearchableFields, addEventTracking } = require('../../plugins');

const { Schema } = mongoose;

const ApiKeySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: Object.values(API_KEY_PERMISSIONS),
      validate: {
        validator(value) {
          return value.length !== 0;
        },
        message: 'Api Key must have permissions',
      },
    },
    value: {
      type: String,
      required: true,
      immutable: true,
      unique: true,
    },
    externalId: {
      type: String,
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

ApiKeySchema.plugin(addSearchableFields(['name', 'externalId']));
ApiKeySchema.plugin(addEventTracking(MONGO_MODEL_NAMES.ApiKey, {
  create: TRACKING_EVENT_TYPES.API_KEY_CREATED,
  remove: TRACKING_EVENT_TYPES.API_KEY_DELETED,
}));

module.exports = {
  ApiKeyModel: mongoose.model(MONGO_MODEL_NAMES.ApiKey, ApiKeySchema),
  ApiKeySchema,
};
