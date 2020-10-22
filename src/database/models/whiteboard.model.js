const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');


const WhiteboardSchema = new mongoose.Schema(
  {
    version: {
      type: String,
    },
    background: {
      type: String,
    },
    objects: {
      type: [mongoose.Schema.Types.Mixed],
    },
    roomId: {
      type: mongoose.Types.ObjectId,
      ref: MONGO_MODEL_NAMES.Room,
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

module.exports = {
  WhiteboardModel: mongoose.model(MONGO_MODEL_NAMES.Whiteboard, WhiteboardSchema),
  WhiteboardSchema,
};
