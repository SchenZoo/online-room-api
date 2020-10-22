const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');

const { UserSchema } = require('./user.model');

const { Schema } = mongoose;

const CHAT_MODELS = [MONGO_MODEL_NAMES.Room];

const ChatMessageSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  messageRef: {
    type: String,
  },
  sender: {
    type: UserSchema,
    required: true,
    immutable: true,
  },
  parentModel: {
    type: String,
    required: true,
    enum: CHAT_MODELS,
  },
  parentModelId: {
    type: mongoose.Types.ObjectId,
    refPath: 'parentModel',
    required: true,
    immutable: true,
  },
}, { timestamps: true });

const ChatMessageModel = mongoose.model(MONGO_MODEL_NAMES.ChatMessage, ChatMessageSchema);

module.exports = {
  ChatMessageModel,
  ChatMessageSchema,
};
