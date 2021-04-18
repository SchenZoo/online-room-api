const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const {
  EVENT_ACCESS_TYPES,
  EVENT_CARDINALITY_TYPE,
} = require('../../../constants/company/event/types');
const { EVENT_PARTICIPANT_ROLES } = require('../../../constants/company/event/roles');
const { WEBHOOK_EVENT_TYPES } = require('../../../constants/company/webhook/event_types');
const {
  addHookWebhooks,
} = require('../../plugins');

const { Schema } = mongoose;

const EventParticipantSchema = new Schema({
  name: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(EVENT_PARTICIPANT_ROLES),
    default: EVENT_PARTICIPANT_ROLES.PARTICIPANT,
  },
  hasJoined: {
    type: Boolean,
    default: false,
  },
  isKicked: {
    type: Boolean,
    default: false,
  },
  lastJoinedAt: {
    type: Date,
  },
  token: {
    type: String,
    required: true,
    immutable: true,
    unique: true,
  },
}, { timestamps: true });

const EventSchema = new Schema(
  {
    name: {
      type: String,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    accessType: {
      type: String,
      required: true,
      enum: Object.values(EVENT_ACCESS_TYPES),
      default: EVENT_ACCESS_TYPES.CLOSED,
    },
    participants: {
      type: [EventParticipantSchema],
      required: true,
    },
    cardinalityType: {
      type: String,
      required: true,
      enum: Object.values(EVENT_CARDINALITY_TYPE),
      immutable: true,
    },
    token: {
      type: String,
      required: true,
      immutable: true,
      unique: true,
    },
    companyId: {
      type: mongoose.Types.ObjectId,
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

EventSchema.plugin(addHookWebhooks({
  create: WEBHOOK_EVENT_TYPES.EVENT_CREATED,
  update: WEBHOOK_EVENT_TYPES.EVENT_UPDATED,
  remove: WEBHOOK_EVENT_TYPES.EVENT_DELETED,
  propertyName: 'event',
}));

module.exports = {
  EventModel: mongoose.model(MONGO_MODEL_NAMES.Event, EventSchema),
  EventSchema,
};
