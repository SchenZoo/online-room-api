const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');

const { Schema } = mongoose;

const ChatMessageSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  messageRef: {
    type: String,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    immutable: true,
  },
  senderName: {
    type: String,
    required: true,
    immutable: true,
  },
  eventId: {
    type: Schema.Types.ObjectId,
    required: true,
    immutable: true,
    index: 1,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    required: true,
    immutable: true,
    index: 1,
  },
}, { timestamps: true });

const ChatMessageModel = mongoose.model(MONGO_MODEL_NAMES.ChatMessage, ChatMessageSchema);

module.exports = {
  ChatMessageModel,
  ChatMessageSchema,
};
