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

router.post('/', hasPermissionMiddleware(PERMISSIONS.CREATE_USERS), asyncMiddleware(createUserHandler));
router.get('/', hasPermissionMiddleware(PERMISSIONS.READ_USERS), asyncMiddleware(getUsersHandler));
router.get('/:id', hasPermissionMiddleware(PERMISSIONS.READ_USERS), asyncMiddleware(findUserHandler));
router.patch('/:id', hasPermissionMiddleware(PERMISSIONS.UPDATE_USERS), asyncMiddleware(updateUserHandler));
router.post('/:id/permissions', hasPermissionMiddleware(PERMISSIONS.UPDATE_USER_PERMISSIONS), asyncMiddleware(updateUserPermissionsHandler));
router.delete('/:id', hasPermissionMiddleware(PERMISSIONS.DELETE_USERS), asyncMiddleware(deleteUserHandler));

async function createUserHandler(req, res) {
  const { companyId, body: userBody } = req;

  const user = await UserService.create({
    ...userBody,
    companyId,
  });

  return res.json({
    user,
  });
}

async function getUsersHandler(req, res) {
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

async function findUserHandler(req, res) {
  const { params: { id }, companyId, query } = req;

  return res.json({
    user: await UserService.getOne(query, {
      additionalQuery: {
        companyId,
        _id: id,
      },
    }),
  });
}

async function updateUserHandler(req, res) {
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

async function updateUserPermissionsHandler(req, res) {
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

async function deleteUserHandler(req, res) {
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
