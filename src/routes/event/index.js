const express = require('express');

const eventParticipantRoutes = require('./event_participant.routes');
const eventRoutes = require('./event.routes');

const router = express.Router();

router.use('/', eventParticipantRoutes, eventRoutes);

module.exports = router;
