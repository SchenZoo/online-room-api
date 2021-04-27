const express = require('express');

const { EVENT_PARTICIPANT_ROLES } = require('../../constants/company/event/roles');
const { EVENT_CARDINALITY_TYPE } = require('../../constants/company/event/types');

const { ObjectTransforms } = require('../../common');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
  eventParticipantJwtAuthMiddleware,
  hasEventParticipantRoleMiddleware,
} = require('../../middlewares');

const { EventService, WebRTCSocketService } = require('../../services/app');
const { DefaultVideoService } = require('../../services/twilio');
const { BadBodyError } = require('../../errors/general');

const router = express.Router();


router.post('/participants/:participantId/is-kicked',
  eventParticipantJwtAuthMiddleware(),
  hasEventParticipantRoleMiddleware(EVENT_PARTICIPANT_ROLES.ADMIN),
  asyncMiddleware(kickParticipantHandler));

router.patch('/participants/current',
  eventParticipantJwtAuthMiddleware(),
  asyncMiddleware(updateCurrentParticipantHandler));

router.get('/participants/video-token',
  eventParticipantJwtAuthMiddleware(),
  asyncMiddleware(getParticipantVideoTokenHandler));

router.post('/:id/participants',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPDATE_EVENT_PARTICIPANTS),
  asyncMiddleware(createParticipantHandler));

router.patch('/participants/:participantId',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPDATE_EVENT_PARTICIPANTS),
  asyncMiddleware(updateParticipantHandler));

router.delete('/participants/:participantId',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPDATE_EVENT_PARTICIPANTS),
  asyncMiddleware(deleteParticipantHandler));


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
  const { params: { participantId }, companyId } = req;

  const event = await EventService.getOne({
    'participants._id': participantId,
    companyId,
  });

  return res.json({
    event: await EventService.removeParticipant(event, participantId),
  });
}

async function getParticipantVideoTokenHandler(req, res) {
  const { event, eventPartId } = req;

  let videoToken;

  switch (event.cardinalityType) {
    case EVENT_CARDINALITY_TYPE.GROUP:
      videoToken = DefaultVideoService.getVideoToken(event._id, eventPartId);
      break;
    case EVENT_CARDINALITY_TYPE.PTP:
      videoToken = await WebRTCSocketService.signToken(event._id, eventPartId);
      break;
  }

  if (!videoToken) {
    throw new BadBodyError('Cant create video token for this event!', true);
  }

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

async function updateCurrentParticipantHandler(req, res) {
  const { body, eventPartId, event } = req;

  const participant = await EventService.updateParticipant(event, eventPartId, ObjectTransforms.pick(body, ['name']));

  return res.json({
    participant,
  });
}

async function updateParticipantHandler(req, res) {
  const { body, companyId, params: { participantId } } = req;

  const event = await EventService.getOne({
    'participants._id': participantId,
    companyId,
  });

  await EventService.updateParticipant(event, participantId, ObjectTransforms.pick(body, ['role', 'name', 'externalId']));

  return res.json({
    event,
  });
}

module.exports = router;
