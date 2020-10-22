const express = require('express');

const {
  asyncMiddleware, jwtAuthMiddleware,
} = require('../middlewares');


const { whiteboardService } = require('../services/app');

const router = express.Router();

router.patch('/:roomId', jwtAuthMiddleware(), asyncMiddleware(updateRoomsWhiteboardHandler));

router.get('/:roomId', jwtAuthMiddleware(), asyncMiddleware(getRoomsWhiteboardHandler));


async function getRoomsWhiteboardHandler(req, res) {
  const { params: { roomId } } = req;
  const whiteboard = await whiteboardService.findOne({ roomId });

  return res.json({ whiteboard });
}


async function updateRoomsWhiteboardHandler(req, res) {
  const {
    params: { roomId }, body, user,
  } = req;
  const { whiteboard } = await whiteboardService.updateObject(roomId, user, body);


  return res.json({ whiteboard });
}

module.exports = router;
