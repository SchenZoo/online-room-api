const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');

const { Schema } = mongoose;

const TrackingEventSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      immutable: true,
    },
    data: {
      type: Schema.Types.Mixed,
      immutable: true,
    },
    resourceId: {
      type: mongoose.Types.ObjectId,
      immutable: true,
      index: 1,
    },
    resourceModel: {
      type: String,
      required() {
        return this.resourceId !== undefined;
      },
      index: 1,
    },
    companyId: {
      type: mongoose.Types.ObjectId,
      immutable: true,
      index: 1,
    },
  },
  { timestamps: true }
);


module.exports = {
  TrackingEventModel: mongoose.model(MONGO_MODEL_NAMES.TrackingEvent, TrackingEventSchema),
  TrackingEventSchema,
};
