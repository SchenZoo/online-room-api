const express = require('express');

const { asyncMiddleware, managerJwtAuthMiddleware } = require('../middlewares');
const {
  UserService, ManagerService, EventService,
} = require('../services/app');


const router = express.Router();

router.post('/login/users', asyncMiddleware(loginUserHandler));
router.post('/login/managers', asyncMiddleware(loginManagerHandler));
router.post('/login/events/participants', asyncMiddleware(loginEventParticipantHandler));
router.post('/login-as/companies/:id', managerJwtAuthMiddleware(), asyncMiddleware(loginAsCompanyUserHandler));

async function loginUserHandler(req, res) {
  const { username, password } = req.body;

  const { token, user } = await UserService.loginUsingCredentials(username, password);

  return res.json({
    user,
    token,
  });
}

async function loginManagerHandler(req, res) {
  const { username, password } = req.body;

  const { token, manager } = await ManagerService.loginUsingCredentials(username, password);

  return res.json({
    manager,
    token,
  });
}

async function loginAsCompanyUserHandler(req, res) {
  const { params: { id }, managerId } = req;

  const { token, user } = await UserService.loginUsingManager(id, managerId);

  return res.json({
    user,
    token,
  });
}

async function loginEventParticipantHandler(req, res) {
  const { body: { participantToken } } = req;

  const { event, participant, token } = await EventService.loginParticipantUsingToken(participantToken);

  return res.json({
    event,
    participant,
    token,
  });
}

module.exports = router;
