const express = require('express');

const {
  asyncMiddleware, jwtAuthMiddleware,
} = require('../middlewares');


const { chatService } = require('../services/app');

const router = express.Router();

router.post('/:roomId/messages', jwtAuthMiddleware(), asyncMiddleware(createEventMessageHandler));

router.get('/:roomId/messages', jwtAuthMiddleware(), asyncMiddleware(getEventMessagesHandler));


async function createEventMessageHandler(req, res) {
  const {
    params: { roomId }, body: partialMessageBody, user,
  } = req;

  const { message } = await chatService.create(partialMessageBody, roomId, user);

  return res.json({ message });
}

async function getEventMessagesHandler(req, res) {
  const { params: { roomId } } = req;
  const messages = await chatService.findAll(roomId);

  return res.json({ messages });
}

module.exports = router;
