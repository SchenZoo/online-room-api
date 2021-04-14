const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const { USER_PERMISSIONS } = require('../../../constants/company/user/permissions');
const { addSearchableFields, addRelationFields, addForbiddenFields } = require('../../plugins');

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
UserSchema.plugin(addSearchableFields(['username', 'name']));

module.exports = {
  UserModel: mongoose.model(MONGO_MODEL_NAMES.User, UserSchema),
  UserSchema,
};
