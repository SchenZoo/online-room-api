const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { TRACKING_EVENT_TYPES } = require('../../constants/tracking/tracking_event_types');
const { addSearchableFields, addEventTracking } = require('../plugins');

const { Schema } = mongoose;

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CompanySchema.plugin(addSearchableFields(['name']));
CompanySchema.plugin(addEventTracking(MONGO_MODEL_NAMES.Company, {
  create: TRACKING_EVENT_TYPES.COMPANY_CREATED,
  remove: TRACKING_EVENT_TYPES.COMPANY_DELETED,
}));

module.exports = {
  CompanyModel: mongoose.model(MONGO_MODEL_NAMES.Company, CompanySchema),
  CompanySchema,
};
