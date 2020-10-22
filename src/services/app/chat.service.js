const { ModelService } = require('./model.service');
const { ChatMessageModel, RoomModel } = require('../../database/models');
const { RoomSocketInstace } = require('../socket');


class ChatService extends ModelService {
  constructor() {
    super(ChatMessageModel);
  }

  async findAll(roomId) {
    return this.Model.find({ parentModelId: roomId }).sort({ createdAt: 1 }).lean();
  }

  async create(partialMessageBody, roomId, sender) {
    const { roomService } = require('.');
    const message = new ChatMessageModel({
      ...partialMessageBody, sender, parentModel: RoomModel.modelName, parentModelId: roomId,
    });

    const [room] = await Promise.all([
      roomService.findOne({ _id: roomId }),
      message.save(),
    ]);

    RoomSocketInstace.sendEventInTeachingRoom(room, RoomSocketInstace.SOCKET_EVENT_NAMES.ROOM_MESSAGE_CREATED, {
      message,
      roomId,
    });
    return {
      message,
      room,
    };
  }
}


module.exports = {
  ChatService,
};
