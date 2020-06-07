const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { UserSchema } = require('./user.model');


const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users: [UserSchema],
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);


module.exports = {
  RoomModel: mongoose.model(MONGO_MODEL_NAMES.Room, RoomSchema),
  RoomSchema,
};
