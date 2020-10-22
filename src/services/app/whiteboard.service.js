const { ModelService } = require('./model.service');
const { WhiteboardModel } = require('../../database/models');
const { RoomSocketInstace } = require('../socket');
const { NotFoundError } = require('../../errors/general');


class WhiteboardService extends ModelService {
  constructor() {
    super(WhiteboardModel);
  }

  async updateObject(roomId, user, partialWhiteboard) {
    const { roomService } = require('.');

    const [room, whiteboard] = await Promise.all([
      roomService.findOne({ _id: roomId }),
      this.findOne({ roomId }),
    ]);

    if (!room) {
      throw new NotFoundError('Room not found!');
    }

    let finalWhiteboard;
    if (!whiteboard) {
      finalWhiteboard = await new WhiteboardModel({ roomId, ...partialWhiteboard }).save();
    } else {
      finalWhiteboard = await WhiteboardModel.findOneAndUpdate({
        roomId,
      }, partialWhiteboard, { new: true });
    }


    RoomSocketInstace.sendEventInTeachingRoom(room, RoomSocketInstace.SOCKET_EVENT_NAMES.WHITEBOARD_CHANGED, {
      whiteboard: finalWhiteboard,
      user,
    });
    return {
      whiteboard,
      room,
    };
  }
}


module.exports = {
  WhiteboardService,
};
