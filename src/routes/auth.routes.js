const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const { UserModel } = require('../database/models');
const { asyncMiddleware } = require('../middlewares');

router.post(
  '/login',
  asyncMiddleware(async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username }).select('+password');
    if (user && UserModel.checkPassword(password, user.password)) {
      const payload = { _id: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      // eslint-disable-next-line no-unused-vars
      const { password, ...userRest } = user.toObject();
      return res.json({
        token,
        user: userRest,
      });
    }
    return res.status(404).json({ message: 'Wrong username or password' });
  })
);

module.exports = router;
