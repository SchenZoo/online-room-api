const express = require('express');

const router = express.Router();
const { userService } = require('../services/app');
const { asyncMiddleware } = require('../middlewares');

router.post('/login/token', asyncMiddleware(loginUsingTokenHandler));
router.post('/login/credentials', asyncMiddleware(loginUsingCredentialsHandler));

async function loginUsingCredentialsHandler(req, res) {
  const { username, password } = req.body;
  const loginData = await userService.loginUsingCredentials(username, password);
  return res.json(loginData);
}

async function loginUsingTokenHandler(req, res) {
  const { token } = req.body;
  const loginData = await userService.loginUsingRoomToken(token);
  return res.json(loginData);
}

module.exports = router;
