const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../../constants/mongo/model_names');
const {
  EVENT_ACCESS_TYPES,
  EVENT_CARDINALITY_TYPE,
} = require('../../../constants/company/event/types');
const { EVENT_PARTICIPANT_ROLES } = require('../../../constants/company/event/roles');


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
  ip: {
    type: String,
  },
  token: {
    type: String,
    required: true,
    select: false,
    immutable: true,
  },
}, { timestamps: true });

const EventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
    },
    accessType: {
      type: String,
      required: true,
      enum: Object.values(EVENT_ACCESS_TYPES),
    },
    cardinalityType: {
      type: String,
      required: true,
      enum: Object.values(EVENT_CARDINALITY_TYPE),
    },
    participants: {
      type: [EventParticipantSchema],
      required: true,
    },
    token: {
      type: String,
      required: true,
      select: false,
      immutable: true,
    },
    companyId: {
      type: mongoose.Types.ObjectId,
      required: true,
      immutable: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = {
  EventModel: mongoose.model(MONGO_MODEL_NAMES.Event, EventSchema),
  EventSchema,
};
