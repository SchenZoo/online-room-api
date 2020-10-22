const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');


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
  },
  { }
);

module.exports = {
  UserModel: mongoose.model(MONGO_MODEL_NAMES.User, UserSchema),
  UserSchema,
};
