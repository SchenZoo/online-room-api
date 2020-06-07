const express = require('express');

const router = express.Router();

const { asyncMiddleware, jwtAuthMiddleware } = require('../../middlewares');

const { RoomModel } = require('../../database/models');

const { DefaultSocketInstance } = require('../../services/socket');

router.post('/:roomName/join', jwtAuthMiddleware(), asyncMiddleware(joinRoom));

async function joinRoom(req, res) {
  const { params: { roomName }, user } = req;
  let room = await RoomModel.findOne({ name: roomName });
  if (!room) {
    room = await new RoomModel({ name: roomName, users: [user] }).save();
  } else {
    const userExists = room.users.some((roomUser) => `${roomUser._id}` === `${user._id}`);
    if (userExists) {
      return res.status(400).json({
        message: 'Already in room!',
      });
    }
    room = await RoomModel.findByIdAndUpdate(room._id, { $push: { users: user } }, { new: true });
  }
  room.users.forEach((roomUser) => {
    DefaultSocketInstance.sendEventInRoom(
      DefaultSocketInstance.SOCKET_ROOMS.USER_ROOM(roomUser._id),
      DefaultSocketInstance.SOCKET_EVENT_NAMES.ROOM_USER_JOINED,
      {
        roomId: room._id,
        user,
      }
    );
  });
  return res.json(room);
}


module.exports = router;
