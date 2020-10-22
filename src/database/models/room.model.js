const mongoose = require('mongoose');
const { MONGO_MODEL_NAMES } = require('../../constants/mongo/model_names');
const { UserSchema } = require('./user.model');

const { RoomSocketInstace } = require('../../services/socket');

const { SOCKET_EVENT_NAMES } = RoomSocketInstace;

const { Schema } = mongoose;

const CustomerSchema = new Schema({
  user: UserSchema,
  hasJoined: {
    type: Boolean,
    default: false,
  },
  isAudioEnabled: {
    type: Boolean,
    default: false,
  },
  isVideoEnabled: {
    type: Boolean,
    default: true,
  },
  hasControl: {
    type: Boolean,
    default: false,
  },
  hasRequestedControl: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    required: true,
    select: false,
    immutable: true,
  },
}, { timestamps: true });

const HostSchema = new Schema({
  user: UserSchema,
  hasJoined: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    required: true,
    select: false,
    immutable: true,
  },
}, { timestamps: true });

const RoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    host: {
      type: HostSchema,
      required: true,
      immutable: true,
    },
    customers: {
      type: [CustomerSchema],
      default: [],
    },
    allowOvertaking: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: MONGO_MODEL_NAMES.User,
      required: true,
      immutable: true,
    },

  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

RoomSchema.virtual('participants').get(function () {
  const participants = [];
  if (this.host) {
    participants.push(this.host);
  }
  if (this.customers) {
    participants.push(...this.customers);
  }
  return participants;
});

RoomSchema.pre('save', function () {
  const modifiedPaths = this.modifiedPaths();
  // as userId is immutable
  const isCreate = modifiedPaths.includes('userId');

  if (!isCreate) {
    const SOCKET_EVENT_MAPPING = {
      customers: SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_CHANGED,
      host: SOCKET_EVENT_NAMES.ROOM_HOST_CHANGED,
      allowOvertaking: SOCKET_EVENT_NAMES.ROOM_OVERTAKING_CHANGED,
    };

    Object.entries(SOCKET_EVENT_MAPPING).forEach(([prop, socketEvent]) => {
      if (modifiedPaths.includes(prop)) {
        RoomSocketInstace.sendEventInTeachingRoom(this, socketEvent, {
          [prop]: this[prop],
          room: this,
        });
      }
    });
  }
});

module.exports = {
  RoomModel: mongoose.model(MONGO_MODEL_NAMES.Room, RoomSchema),
  RoomSchema,
};
