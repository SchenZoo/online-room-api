const express = require('express');

const authRoutes = require('./auth.routes');
const roomRoutes = require('./room.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);


module.exports = router;
