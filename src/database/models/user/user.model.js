const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const { USER_PERMISSIONS } = require('../../../constants/company/user/permissions');
const { WEBHOOK_EVENT_TYPES } = require('../../../constants/company/webhook/event_types');
const { TRACKING_EVENT_TYPES } = require('../../../constants/tracking/tracking_event_types');
const {
  addSearchableFields,
  addRelationFields,
  addForbiddenFields,
  addHookWebhooks,
  addEventTracking,
} = require('../../plugins');


const { Schema } = mongoose;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    permissions: {
      type: [String],
      required: true,
      enum: Object.values(USER_PERMISSIONS),
      validate: {
        validator(value) {
          return value.length !== 0;
        },
        message: 'User must have permissions',
      },
    },
    isMain: {
      type: Boolean,
      default: false,
      immutable: true,
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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual('company', {
  ref: MONGO_MODEL_NAMES.Company,
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});

UserSchema.plugin(addForbiddenFields(['password']));
UserSchema.plugin(addRelationFields(['company']));
UserSchema.plugin(addSearchableFields(['username', 'name', 'externalId']));
UserSchema.plugin(addHookWebhooks({
  create: WEBHOOK_EVENT_TYPES.USER_CREATED,
  update: WEBHOOK_EVENT_TYPES.USER_UPDATED,
  remove: WEBHOOK_EVENT_TYPES.USER_DELETED,
  propertyName: 'user',
}));

UserSchema.plugin(addEventTracking(MONGO_MODEL_NAMES.User, {
  create: TRACKING_EVENT_TYPES.USER_CREATED,
  remove: TRACKING_EVENT_TYPES.USER_DELETED,
}));

module.exports = {
  UserModel: mongoose.model(MONGO_MODEL_NAMES.User, UserSchema),
  UserSchema,
};
