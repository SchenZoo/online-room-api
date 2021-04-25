const express = require('express');

const companyRoutes = require('./company.routes');
const widgetConfigurationRoutes = require('./widget_configuration.routes');

const router = express.Router();

router.use('/widget_configurations', widgetConfigurationRoutes);
router.use('/', companyRoutes);


module.exports = router;
