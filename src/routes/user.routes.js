const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
  userJwtAuthMiddleware,
} = require('../middlewares');

const { UserService } = require('../services/app');

const { NotFoundError, BadBodyError } = require('../errors/general');

const { ObjectTransforms } = require('../common');

const router = express.Router();

router.get('/current', userJwtAuthMiddleware(), asyncMiddleware(getCurrentUserHandler));

router.use(hasCompanyAccessMiddleware());

router.post('/', hasPermissionMiddleware(PERMISSIONS.CREATE_USERS), asyncMiddleware(createHandler));
router.get('/', hasPermissionMiddleware(PERMISSIONS.READ_USERS), asyncMiddleware(getHandler));
router.get('/:id', hasPermissionMiddleware(PERMISSIONS.READ_USERS), asyncMiddleware(findHandler));
router.patch('/:id', hasPermissionMiddleware(PERMISSIONS.UPDATE_USERS), asyncMiddleware(updateHandler));
router.post('/:id/permissions', hasPermissionMiddleware(PERMISSIONS.UPDATE_USER_PERMISSIONS), asyncMiddleware(updatePermissionsHandler));
router.delete('/:id', hasPermissionMiddleware(PERMISSIONS.DELETE_USERS), asyncMiddleware(deleteHandler));

async function createHandler(req, res) {
  const { companyId, body: userBody } = req;

  const user = await UserService.create({
    ...userBody,
    companyId,
  });

  return res.json({
    user,
  });
}

async function getHandler(req, res) {
  const { companyId, query } = req;
  return res.json(await UserService.getPaginated(query, {
    additionalQuery: {
      companyId,
    },
  }));
}

async function getCurrentUserHandler(req, res) {
  const { user } = req;
  return res.json({
    user,
  });
}

async function findHandler(req, res) {
  const { params: { id }, companyId, query } = req;

  return res.json({
    user: await UserService.getOne({
      companyId,
      _id: id,
    }, {
      query,
    }),
  });
}

async function updateHandler(req, res) {
  const {
    params: { id }, companyId, userId, body: userBody,
  } = req;

  const user = await UserService.findOne({
    _id: id,
    companyId,
  });

  if (!user) {
    throw new NotFoundError('User not found in your company.', true);
  }

  if (user.isMain && id !== userId) {
    throw new BadBodyError('Only main user can change himself.', true);
  }

  const filteredBody = ObjectTransforms.pick(userBody, ['name', 'username', 'password'], true);

  const updatedUser = await UserService.updateObject(user, filteredBody);

  return res.json({
    user: updatedUser,
  });
}

async function updatePermissionsHandler(req, res) {
  const {
    params: { id }, companyId, body: permissions,
  } = req;

  const user = await UserService.findOne({
    _id: id,
    companyId,
  });

  if (!user) {
    throw new NotFoundError('User not found in your company.', true);
  }

  if (user.isMain) {
    throw new BadBodyError('Main user permissions cannot be changed.', true);
  }

  const updatedUser = await UserService.updateObject(user, {
    permissions,
  });

  return res.json({
    user: updatedUser,
  });
}

async function deleteHandler(req, res) {
  const { params: { id }, companyId, userId } = req;

  const user = await UserService.findOne({ _id: id, companyId });

  if (!user) {
    throw new NotFoundError('User not found in your company.', true);
  }

  if (user.isMain) {
    throw new BadBodyError("You can't remove main user.", true);
  }

  if (`${user._id}` === userId) {
    throw new BadBodyError("You can't delete yourself.", true);
  }

  await UserService.removeObject(user);

  return res.json({
    deleted: true,
  });
}

module.exports = router;
