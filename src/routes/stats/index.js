const express = require('express');

const appStatsRoutes = require('./app_stats.routes');

const router = express.Router();

router.use('/', appStatsRoutes);

module.exports = router;
