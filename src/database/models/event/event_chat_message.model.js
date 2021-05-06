const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const { addSearchableFields, addSortableFields } = require('../../plugins');

const { Schema } = mongoose;

const EventChatMessageSchema = new Schema({
  text: {
    type: String,
    minlength: 1,
    required: true,
  },
  messageRef: {
    type: String,
  },
  senderName: {
    type: String,
    required: true,
    default: 'Event participant',
  },
  senderId: {
    type: Schema.Types.ObjectId,
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

EventChatMessageSchema.plugin(addSortableFields(['createdAt']));
EventChatMessageSchema.plugin(addSearchableFields(['text']));

module.exports = {
  EventChatMessageModel: mongoose.model(MONGO_MODEL_NAMES.EventChatMessage, EventChatMessageSchema),
  EventChatMessageSchema,
};
