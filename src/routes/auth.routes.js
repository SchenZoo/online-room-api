const express = require('express');

const {
  asyncMiddleware,
  widgetAuthMiddleware,
  managerJwtAuthMiddleware,
} = require('../middlewares');
const {
  UserService,
  ManagerService,
  EventService,
} = require('../services/app');

const {
  NotFoundError,
} = require('../errors/general');


const router = express.Router();

router.post('/login/users', asyncMiddleware(loginUserHandler));
router.post('/login/managers', asyncMiddleware(loginManagerHandler));
router.post('/login/events/participants', widgetAuthMiddleware(), asyncMiddleware(loginEventParticipantHandler));
router.post('/login/events', widgetAuthMiddleware(), asyncMiddleware(loginOpenEventHandler));
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
  const { companyId, body: { participantToken } } = req;

  const { event, participant, token } = await EventService.loginParticipantUsingToken(participantToken);


  if (companyId && `${event.companyId}` !== companyId) {
    throw new NotFoundError('Event with this companyId not found');
  }

  return res.json({
    event,
    participant,
    token,
  });
}

async function loginOpenEventHandler(req, res) {
  const { companyId, body: { eventToken } } = req;

  const { event, participant, token } = await EventService.getOpenEventAuth(eventToken);

  if (companyId && `${event.companyId}` !== companyId) {
    throw new NotFoundError('Event with this companyId not found');
  }

  return res.json({
    event,
    participant,
    token,
  });
}

module.exports = router;
