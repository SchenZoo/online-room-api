const express = require('express');

const eventParticipantRoutes = require('./event_participant.routes');
const eventChatRoutes = require('./event_chat.routes');
const eventRoutes = require('./event.routes');

const router = express.Router();

router.use('/', eventChatRoutes, eventParticipantRoutes, eventRoutes);

module.exports = router;
