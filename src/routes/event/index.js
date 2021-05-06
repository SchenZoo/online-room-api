const express = require('express');

const eventParticipantRoutes = require('./event_participant.routes');
const eventReviewRoutes = require('./event_review.routes');
const eventChatRoutes = require('./event_chat.routes');
const eventRoutes = require('./event.routes');

const router = express.Router();

router.use('/',
  eventReviewRoutes,
  eventChatRoutes,
  eventParticipantRoutes,
  eventRoutes);

module.exports = router;
