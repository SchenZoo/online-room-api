const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const { API_KEY_PERMISSIONS } = require('../../../constants/company/user/permissions');
const { addSearchableFields } = require('../../plugins');

const { Schema } = mongoose;

const ApiKeySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    permissions: {
      type: String,
      required: true,
      enum: Object.values(API_KEY_PERMISSIONS),
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

ApiKeySchema.plugin(addSearchableFields(['name']));

module.exports = {
  ApiKeyModel: mongoose.model(MONGO_MODEL_NAMES.ApiKey, ApiKeySchema),
  ApiKeySchema,
};
