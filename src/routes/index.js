const express = require('express');

const authRoutes = require('./auth.routes');
const companyRoutes = require('./company.routes');
const userRoutes = require('./user.routes');
const apiKeyRoutes = require('./api_key.routes');
const webhookRoutes = require('./webhook.routes');
const eventRoutes = require('./event');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/users', userRoutes);
router.use('/api_keys', apiKeyRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/events', eventRoutes);


module.exports = router;
