const express = require('express');

const {
  asyncMiddleware,
  eventParticipantJwtAuthMiddleware,
} = require('../../middlewares');

const { EventChatService } = require('../../services/app');

const router = express.Router();

router.post('/messages',
  eventParticipantJwtAuthMiddleware(),
  asyncMiddleware(createHandler));

router.get('/messages',
  eventParticipantJwtAuthMiddleware(),
  asyncMiddleware(getHandler));

async function createHandler(req, res) {
  const {
    companyId,
    eventId,
    eventPartId,
    eventParticipant,
    body,
  } = req;

  const message = await EventChatService.create({
    ...body,
    senderName: eventParticipant.name,
    senderId: eventPartId,
    eventId,
    companyId,
  });

  return res.json({
    message,
  });
}

async function getHandler(req, res) {
  const { eventId, companyId, query } = req;

  return res.json(await EventChatService.getPaginated(query, {
    additionalQuery: {
      eventId,
      companyId,
    },
    findOptions: { lean: true },
  }));
}

module.exports = router;
