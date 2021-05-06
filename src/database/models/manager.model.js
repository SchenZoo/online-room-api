const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { addSearchableFields } = require('../plugins');

const { Schema } = mongoose;

const ManagerSchema = new Schema(
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ManagerSchema.plugin(addSearchableFields(['name', 'username']));

module.exports = {
  MangerModel: mongoose.model(MONGO_MODEL_NAMES.Manager, ManagerSchema),
  ManagerSchema,
};
