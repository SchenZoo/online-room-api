const express = require('express');

const {
  asyncMiddleware,
  eventParticipantJwtAuthMiddleware,
} = require('../../middlewares');

const { EventReviewService } = require('../../services/app');

const router = express.Router();

router.post('/participant/reviews',
  eventParticipantJwtAuthMiddleware(),
  asyncMiddleware(createHandler));

router.get('/participant/reviews',
  eventParticipantJwtAuthMiddleware(),
  asyncMiddleware(getHandler));

async function createHandler(req, res) {
  const {
    companyId,
    eventId,
    eventPartId,
    body,
  } = req;

  const review = await EventReviewService.create({
    ...body,
    participantId: eventPartId,
    eventId,
    companyId,
  });

  return res.json({
    review,
  });
}

async function getHandler(req, res) {
  const { eventId, companyId, eventPartId } = req;

  return res.json({
    review: await EventReviewService.getOne({
      participantId: eventPartId,
      eventId,
      companyId,
    }),
  });
}

module.exports = router;
