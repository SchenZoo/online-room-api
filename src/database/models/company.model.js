const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { addSearchableFields } = require('../plugins');

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

module.exports = {
  CompanyModel: mongoose.model(MONGO_MODEL_NAMES.Company, CompanySchema),
  CompanySchema,
};
