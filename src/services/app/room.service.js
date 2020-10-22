const { RoomModel } = require('../../database/models');
const { ModelService } = require('./model.service');
const { RoomSocketInstace } = require('../socket');
const { memoryStorage } = require('../storage');
const { Randoms, ObjectTransforms } = require('../../common');
const { NotFoundError } = require('../../errors/general');

class RoomService extends ModelService {
  constructor() {
    super(RoomModel);
  }

  async create(user, roomBody = {}) {
    return super.create({
      ...roomBody,
      host: {
        user,
        token: this.generateParticipantToken(),
      },
      userId: user._id,
    });
  }

  async findParticipantByToken(token) {
    const room = await this.findOne({
      $or: [
        {
          'host.token': token,
        },
        {
          'customers.token': token,
        },
      ],
    }, '+host.token +customers.token');
    if (!room) {
      throw new NotFoundError('Room with this participant token not found!');
    }
    const participant = room.participants.find((participant) => participant.token === token);
    return {
      room,
      participant,
    };
  }

  async customerJoin(roomId, user) {
    const room = await this.findOne({ _id: roomId });
    if (!room) {
      return null;
    }

    const customer = this.getCustomer(room, user._id);

    if (customer) {
      return null;
    }

    room.customers.push({
      token: this.generateParticipantToken(),
      user,
    });

    await room.save();

    RoomSocketInstace.sendEventInTeachingRoom(room, RoomSocketInstace.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_CHANGED, {
      room,
    });

    return room;
  }

  async customerLeave(roomId, user) {
    const room = await this.findOne({ _id: roomId });
    if (!room) {
      return null;
    }


    room.customers = room.customers.filter((customer) => `${customer.user._id}` !== `${user._id}`);

    await room.save();

    RoomSocketInstace.sendEventInTeachingRoom(room, RoomSocketInstace.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_CHANGED, {
      room,
    });

    return room;
  }

  async customerUpdate(roomQuery, customerId, customerBody = {}) {
    const room = await this.findOne(roomQuery);

    if (!room) {
      throw new NotFoundError('Room not found!');
    }
    const customer = this.getCustomer(room, customerId);

    if (!customer) {
      throw new NotFoundError('Customer not found!');
    }

    ObjectTransforms.updateObject(customer, customerBody, true);

    // If turning off overtaking clear array
    if (customerBody.allowOvertaking === false) {
      await memoryStorage.remove(this.getOvertakingKey(room._id));
    }

    return room.save();
  }

  generateParticipantToken() {
    return Randoms.getRandomString();
  }

  async takeControl(roomId, userId) {
    const room = await this.findOne({ roomId });

    if (!room) {
      throw new NotFoundError('Room not found!');
    }

    const customer = this.getCustomer(room, userId);

    if (!customer) {
      throw new NotFoundError('Customer not found!');
    }

    const key = this.getOvertakingKey(roomId);

    let roomOvertakers = await memoryStorage.get(key);

    if (roomOvertakers) {
      roomOvertakers = JSON.parse(roomOvertakers);
    } else {
      roomOvertakers = [];
    }

    if (roomOvertakers.some((overtakerId) => `${overtakerId}` === `${userId}`)) {
      return false;
    }

    roomOvertakers.push(userId);

    await memoryStorage.set(JSON.stringify(roomOvertakers));

    if (roomOvertakers[0] === `${userId}`) {
      customer.hasControl = true;
      await room.save();
      return true;
    }
    return false;
  }

  async leaveControl(roomId, userId) {
    const room = await this.findOne({ roomId });

    if (!room) {
      throw new NotFoundError('Room not found!');
    }

    const customer = this.getCustomer(room, userId);

    if (!customer) {
      throw new NotFoundError('Customer not found!');
    }

    const key = this.getOvertakingKey(roomId);

    let roomOvertakers = await memoryStorage.get(key);

    if (roomOvertakers) {
      roomOvertakers = JSON.parse(roomOvertakers);
    } else {
      roomOvertakers = [];
    }

    if (!roomOvertakers.some((overtakerId) => `${overtakerId}` === `${userId}`)) {
      return false;
    }

    roomOvertakers = roomOvertakers.filter((overtakerId) => `${overtakerId}` !== `${userId}`);

    await memoryStorage.set(JSON.stringify(roomOvertakers));

    // If he had control
    if (customer.hasControl) {
      customer.hasControl = false;
      if (roomOvertakers[0]) {
        const newTaker = this.getCustomer(room, roomOvertakers[0]);
        newTaker.hasControl = true;
      }
      await room.save();
      return true;
    }
    return false;
  }

  getOvertakingKey(roomId) {
    return `room-overtakers-${roomId}`;
  }

  getCustomer(room, userId) {
    return room.customers.find((customer) => `${customer.user._id}` === `${userId}`);
  }
}


module.exports = {
  RoomService,
};
