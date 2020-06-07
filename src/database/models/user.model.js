const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');


const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

UserSchema.statics.hashPassword = (password) => bcrypt.hashSync(password, 8);
UserSchema.statics.checkPassword = function (passwordPlan, passwordEncrypted) {
  return bcrypt.compareSync(passwordPlan, passwordEncrypted);
};


module.exports = {
  UserModel: mongoose.model(MONGO_MODEL_NAMES.User, UserSchema),
  UserSchema,
};
