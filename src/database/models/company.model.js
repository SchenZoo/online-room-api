const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { TRACKING_EVENT_TYPES } = require('../../constants/tracking/tracking_event_types');
const { addSearchableFields, addEventTracking, addSignedUrlPlugin } = require('../plugins');

const ColorSchemaType = {
  type: String,
  validate: {
    validator(value) {
      return !value || /^#[0-9a-fA-F]{6}$/i.test(value);
    },
    msg: 'Color value must be in hex format (#1f2f3f)',
  },
};

const { Schema } = mongoose;

const ConfigurationSchema = new Schema({
  widgetUrl: {
    type: String,
    lowercase: true,
    trim: true,
  },
  eventBackgroundColor: ColorSchemaType,
  avatarBackgroundColor: ColorSchemaType,
  avatarFillColor: ColorSchemaType,
  avatarImageKey: {
    type: String,
  },
  integrationId: {
    type: String,
    required: true,
    immutable: true,
  },
}, {
  timestamps: true, _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true },
});

ConfigurationSchema.plugin(addSignedUrlPlugin('avatarImageKey', 'avatarImageUrl'));


const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    businessType: {
      type: String,
    },
    logoKey: {
      type: String,
    },
    configuration: {
      type: ConfigurationSchema,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CompanySchema.plugin(addSearchableFields(['name', 'configuration.integrationId']));

CompanySchema.plugin(addSignedUrlPlugin('logoKey', 'logoUrl'));

CompanySchema.plugin(addEventTracking(MONGO_MODEL_NAMES.Company, {
  create: TRACKING_EVENT_TYPES.COMPANY_CREATED,
  remove: TRACKING_EVENT_TYPES.COMPANY_DELETED,
}));

module.exports = {
  CompanyModel: mongoose.model(MONGO_MODEL_NAMES.Company, CompanySchema),
  CompanySchema,
};
