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

router.get('/global', managerJwtAuthMiddleware(), asyncMiddleware(getGeneralStatsHandler));

router.get('/company',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.READ_COMPANY_STATISTICS),
  asyncMiddleware(getCompanyStatsHandler));

router.get('/events/:eventId',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.READ_COMPANY_STATISTICS),
  companyHasModelAccessMiddleware(EventModel, 'params.eventId', 'event'),
  asyncMiddleware(getEventStatsHandler));

async function getGeneralStatsHandler(req, res) {
  return res.json(await TrackingEventStatsService.getStats({
    general: TrackingEventStatsService.generalStatsAgg(),
    call: TrackingEventStatsService.callAgg(),
    participant: TrackingEventStatsService.eventParticipantAgg(),
    review: TrackingEventStatsService.reviewsAgg(),
    callByType: TrackingEventStatsService.callPerTypeAgg(),
  }));
}

async function getCompanyStatsHandler(req, res) {
  const { companyId } = req;

  const query = { companyId: mongoose.Types.ObjectId(companyId) };

  return res.json(await TrackingEventStatsService.getStats({
    general: TrackingEventStatsService.generalStatsAgg(query),
    call: TrackingEventStatsService.callAgg(query),
    participant: TrackingEventStatsService.eventParticipantAgg(query),
    review: TrackingEventStatsService.reviewsAgg(query),
    callByType: TrackingEventStatsService.callPerTypeAgg(query),
  }));
}

async function getEventStatsHandler(req, res) {
  const { event } = req;

  const query = { resourceId: mongoose.Types.ObjectId(event._id) };

  return res.json(await TrackingEventStatsService.getStats({
    general: TrackingEventStatsService.eventStatsAgg(query),
    call: TrackingEventStatsService.callAgg(query),
    participant: TrackingEventStatsService.eventParticipantAgg(query),
    review: TrackingEventStatsService.reviewsAgg(query),
  }));
}


module.exports = router;
