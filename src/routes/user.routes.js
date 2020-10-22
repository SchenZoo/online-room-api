const express = require('express');

const router = express.Router();

const { asyncMiddleware, apiKeyAuthMiddleware } = require('../middlewares');

const { userService } = require('../services/app');
const { MongoListOptions } = require('../services/list_options');

router.post('/', apiKeyAuthMiddleware(), asyncMiddleware(createUserHandler));
router.get('/', apiKeyAuthMiddleware(), asyncMiddleware(getUsersHandler));
router.get('/:userId', apiKeyAuthMiddleware(), asyncMiddleware(getUserHandler));
router.patch('/:userId', apiKeyAuthMiddleware(), asyncMiddleware(updateUserHandler));
router.delete('/:userId', apiKeyAuthMiddleware(), asyncMiddleware(deleteUserHandler));


async function getUsersHandler(req, res) {
  const { query } = req;
  const listOptions = new MongoListOptions(query);
  return res.json(await userService.find(listOptions));
}

async function createUserHandler(req, res) {
  const { body: userBody } = req;
  const user = await userService.create(userBody);
  return res.json({
    user,
  });
}

async function getUserHandler(req, res) {
  const { params: { userId } } = req;
  const user = await userService.findOne({ _id: userId });
  return res.json({
    user,
  });
}

async function updateUserHandler(req, res) {
  const { params: { userId }, body } = req;
  const user = await userService.updateOne({ _id: userId }, body);
  return res.json({
    user,
  });
}

async function deleteUserHandler(req, res) {
  const { params: { userId } } = req;
  const user = await userService.removeOne({ _id: userId });
  return res.json({
    user,
  });
}


module.exports = router;
