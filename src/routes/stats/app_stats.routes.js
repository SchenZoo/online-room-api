const express = require('express');
const mongoose = require('mongoose');

const {
  PERMISSIONS,
  asyncMiddleware,
  managerJwtAuthMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
  companyHasModelAccessMiddleware,
} = require('../../middlewares');

const { TrackingEventStatsService } = require('../../services/app');

const { EventModel } = require('../../database/models');


const router = express.Router();

router.get('/general', managerJwtAuthMiddleware(), asyncMiddleware(getGeneralStatsHandler));

router.get('/company',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.READ_EVENT_STATISTICS),
  asyncMiddleware(getCompanyStatsHandler));

router.get('/events/:eventId',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.READ_EVENT_STATISTICS),
  companyHasModelAccessMiddleware(EventModel, 'params.eventId', 'event'),
  asyncMiddleware(getEventStatsHandler));

async function getGeneralStatsHandler(req, res) {
  return res.json(await TrackingEventStatsService.getStats({
    general: TrackingEventStatsService.generalStatsAgg(),
    event: TrackingEventStatsService.eventStatsAgg(),
    callDuration: TrackingEventStatsService.callDurationAgg(),
    participant: TrackingEventStatsService.eventParticipantAgg(),
  }));
}

async function getCompanyStatsHandler(req, res) {
  const { companyId } = req;

  const query = { companyId: mongoose.Types.ObjectId(companyId) };

  return res.json(await TrackingEventStatsService.getStats({
    general: TrackingEventStatsService.generalStatsAgg(query),
    event: TrackingEventStatsService.eventStatsAgg(query),
    callDuration: TrackingEventStatsService.callDurationAgg(query),
    participant: TrackingEventStatsService.eventParticipantAgg(query),
  }));
}

async function getEventStatsHandler(req, res) {
  const { event } = req;

  const query = { resourceId: mongoose.Types.ObjectId(event._id) };

  return res.json(await TrackingEventStatsService.getStats({
    event: TrackingEventStatsService.eventStatsAgg(query),
    callDuration: TrackingEventStatsService.callDurationAgg(query),
    participant: TrackingEventStatsService.eventParticipantAgg(query),
  }));
}


module.exports = router;
