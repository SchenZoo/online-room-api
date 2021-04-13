const express = require('express');

const { asyncMiddleware, managerJwtAuthMiddleware } = require('../middlewares');
const { UserService, ManagerService } = require('../services/app');


const router = express.Router();

router.post('/login/users', asyncMiddleware(loginUserHandler));
router.post('/login/managers', asyncMiddleware(loginManagerHandler));
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

module.exports = router;
