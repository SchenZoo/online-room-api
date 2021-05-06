const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
} = require('../middlewares');

const { ApiKeyService } = require('../services/app');

const router = express.Router();

router.use(hasCompanyAccessMiddleware());

router.post('/', hasPermissionMiddleware(PERMISSIONS.CREATE_API_KEYS), asyncMiddleware(createHandler));
router.get('/', hasPermissionMiddleware(PERMISSIONS.READ_API_KEYS), asyncMiddleware(getHandler));
router.get('/:id', hasPermissionMiddleware(PERMISSIONS.READ_API_KEYS), asyncMiddleware(findHandler));
router.patch('/:id', hasPermissionMiddleware(PERMISSIONS.UPDATE_API_KEYS), asyncMiddleware(updateHandler));
router.delete('/:id', hasPermissionMiddleware(PERMISSIONS.DELETE_API_KEYS), asyncMiddleware(deleteHandler));

async function createHandler(req, res) {
  const { companyId, body } = req;

  const apiKey = await ApiKeyService.create({
    ...body,
    companyId,
  });

  return res.json({
    apiKey,
  });
}

async function getHandler(req, res) {
  const { companyId, query } = req;
  return res.json(await ApiKeyService.getPaginated(query, {
    additionalQuery: {
      companyId,
    },
  }));
}

async function findHandler(req, res) {
  const { params: { id }, companyId, query } = req;

  return res.json({
    apiKey: await ApiKeyService.getOne({
      companyId,
      _id: id,
    }, {
      query,
    }),
  });
}

async function updateHandler(req, res) {
  const {
    params: { id }, companyId, body,
  } = req;

  const apiKey = await ApiKeyService.updateOne({
    _id: id,
    companyId,
  }, body);

  return res.json({
    apiKey,
  });
}

async function deleteHandler(req, res) {
  const { params: { id }, companyId } = req;

  await ApiKeyService.removeOne({ _id: id, companyId });

  return res.json({
    deleted: true,
  });
}

module.exports = router;
