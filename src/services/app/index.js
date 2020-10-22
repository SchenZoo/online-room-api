const { UserService } = require('./user.service');
const { RoomService } = require('./room.service');
const { ChatService } = require('./chat.service');
const { WhiteboardService } = require('./whiteboard.service');


module.exports = {
  userService: new UserService(),
  roomService: new RoomService(),
  chatService: new ChatService(),
  whiteboardService: new WhiteboardService(),
};
