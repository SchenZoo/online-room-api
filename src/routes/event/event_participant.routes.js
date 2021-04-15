const express = require('express');

const { EVENT_PARTICIPANT_ROLES } = require('../../constants/company/event/roles');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
  eventParticipantJwtAuthMiddleware,
  hasEventParticipantRoleMiddleware,
} = require('../../middlewares');

const { EventService } = require('../../services/app');
const { BadBodyError } = require('../../errors/general');

const router = express.Router();


router.post('/:id/participants',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPDATE_EVENT_PARTICIPANTS),
  asyncMiddleware(createParticipantHandler));

router.delete('/:id/participants/:participantId',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPDATE_EVENT_PARTICIPANTS),
  asyncMiddleware(deleteParticipantHandler));

router.get('/participants/video-token',
  eventParticipantJwtAuthMiddleware(),
  asyncMiddleware(getParticipantVideoTokenHandler));

router.post('/participants/:participantId/is-kicked',
  eventParticipantJwtAuthMiddleware(),
  hasEventParticipantRoleMiddleware(EVENT_PARTICIPANT_ROLES.ADMIN),
  asyncMiddleware(kickParticipantHandler));


async function createParticipantHandler(req, res) {
  const { params: { id }, companyId, body } = req;
  const event = await EventService.getOne({
    _id: id,
    companyId,
  });

  return res.json({
    event: await EventService.addParticipants(event, body),
  });
}

async function deleteParticipantHandler(req, res) {
  const { params: { id, participantId }, companyId } = req;

  const event = await EventService.getOne({
    _id: id,
    companyId,
  });

  return res.json({
    event: await EventService.removeParticipant(event, participantId),
  });
}

async function getParticipantVideoTokenHandler(req, res) {
  const { event, eventPartId } = req;

  const videoToken = EventService.getEventTwilioToken(event, eventPartId);

  return res.json({
    videoToken,
  });
}

async function kickParticipantHandler(req, res) {
  const { event, eventPartId, params: { participantId } } = req;

  if (eventPartId === participantId) {
    throw new BadBodyError('You cant kick yourself.', true);
  }

  await EventService.kickParticipant(event, participantId);

  return res.json({
    kicked: true,
  });
}

module.exports = router;