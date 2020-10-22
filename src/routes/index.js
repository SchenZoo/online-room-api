const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roomRoutes = require('./room.routes');
const chatRoutes = require('./chat.routes');
const whiteboardRoutes = require('./whiteboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/chat', chatRoutes);
router.use('/whiteboard', whiteboardRoutes);


module.exports = router;
