const express = require('express');

const router = express.Router();

const { asyncMiddleware, jwtAuthMiddleware, mapRequestPropMiddleware } = require('../middlewares');

const { roomService } = require('../services/app');
const { AuthorizedMongoListOptions } = require('../services/list_options');

router.post('/:roomId/customers', jwtAuthMiddleware(), asyncMiddleware(customerJoinRoomHandler));
router.delete('/:roomId/customers', jwtAuthMiddleware(), asyncMiddleware(customerLeaveRoomHandler));

router.patch('/:roomId/customers/control',
  jwtAuthMiddleware(),
  asyncMiddleware(customerChangeRoomControlHandler));

router.patch('/:roomId/customers/:customerId',
  jwtAuthMiddleware(),
  mapRequestPropMiddleware(['isVideoEnabled', 'isAudioEnabled'], 'keepSentProps'),
  asyncMiddleware(updateRoomCustomerHandler));


router.post('/', jwtAuthMiddleware(), asyncMiddleware(createRoomHandler));
router.get('/', jwtAuthMiddleware(), asyncMiddleware(getRoomsHandler));
router.get('/:roomId', jwtAuthMiddleware(), asyncMiddleware(getRoomHandler));
router.patch('/:roomId', jwtAuthMiddleware(), asyncMiddleware(updateRoomHandler));
router.delete('/:roomId', jwtAuthMiddleware(), asyncMiddleware(deleteRoomHandler));


async function getRoomsHandler(req, res) {
  const { query, user } = req;
  const listOptions = new AuthorizedMongoListOptions(query, user);
  return res.json(await roomService.find(listOptions));
}

async function createRoomHandler(req, res) {
  const { body: roomBody, user } = req;
  const room = await roomService.create(user, roomBody);
  return res.json({
    room,
  });
}

async function getRoomHandler(req, res) {
  const { params: { roomId }, user } = req;
  const room = await roomService.findOne({ _id: roomId, userId: user._id }, '+host.token +customers.token');
  return res.json({
    room,
  });
}

async function updateRoomHandler(req, res) {
  const { params: { roomId }, body, user } = req;
  const room = await roomService.updateOne({ _id: roomId, userId: user._id }, body);
  return res.json({
    room,
  });
}

async function deleteRoomHandler(req, res) {
  const { params: { roomId }, user } = req;
  const room = await roomService.removeOne({ _id: roomId, userId: user._id });
  return res.json({
    room,
  });
}

async function customerJoinRoomHandler(req, res) {
  const { params: { roomId }, user } = req;
  const room = await roomService.customerJoin(roomId, user);
  if (!room) {
    return res.status(400).json({
      message: 'Already in room!',
    });
  }
  return res.json({
    room,
  });
}

async function customerLeaveRoomHandler(req, res) {
  const { params: { roomId }, user } = req;
  const room = await roomService.customerLeave(roomId, user);
  return res.json({
    room,
  });
}

async function updateRoomCustomerHandler(req, res) {
  const { body, params: { customerId, roomId }, user } = req;
  const room = await roomService.customerUpdate({ _id: roomId, userId: user._id }, customerId, body);
  return res.json({
    room,
  });
}

async function customerChangeRoomControlHandler(req, res) {
  const { user, params: { roomId }, body: { takeControl } } = req;
  let madeChange;
  if (takeControl) {
    madeChange = await roomService.takeControl(roomId, user._id);
  } else {
    madeChange = await roomService.leaveControl(roomId, user._id);
  }
  return res.json({
    madeChange,
  });
}

module.exports = router;
