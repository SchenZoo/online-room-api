const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
} = require('../../middlewares');

const { EventService } = require('../../services/app');

const router = express.Router();


router.post('/:id/participants',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPDATE_EVENT_PARTICIPANTS),
  asyncMiddleware(createParticipantHandler));

router.delete('/:id/participants/:participantId',
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
  const { params: { id, participantId }, companyId } = req;

  const event = await EventService.getOne({
    _id: id,
    companyId,
  });

  return res.json({
    event: await EventService.removeParticipant(event, participantId),
  });
}

module.exports = router;
