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

router.post('/', hasPermissionMiddleware(PERMISSIONS.CREATE_API_KEYS), asyncMiddleware(createApiKeyHandler));
router.get('/', hasPermissionMiddleware(PERMISSIONS.READ_API_KEYS), asyncMiddleware(getApiKeysHandler));
router.get('/:id', hasPermissionMiddleware(PERMISSIONS.READ_API_KEYS), asyncMiddleware(findApiKeyHandler));
router.patch('/:id', hasPermissionMiddleware(PERMISSIONS.UPDATE_API_KEYS), asyncMiddleware(updateApiKeyHandler));
router.delete('/:id', hasPermissionMiddleware(PERMISSIONS.DELETE_API_KEYS), asyncMiddleware(deleteApiKeyHandler));

async function createApiKeyHandler(req, res) {
  const { companyId, body } = req;

  const apiKey = await ApiKeyService.create({
    ...body,
    companyId,
  });

  return res.json({
    apiKey,
  });
}

async function getApiKeysHandler(req, res) {
  const { companyId, query } = req;
  return res.json(await ApiKeyService.getPaginated(query, {
    additionalQuery: {
      companyId,
    },
  }));
}

async function findApiKeyHandler(req, res) {
  const { params: { id }, companyId, query } = req;

  return res.json({
    apiKey: await ApiKeyService.getOne(query, {
      additionalQuery: {
        companyId,
        _id: id,
      },
    }),
  });
}

async function updateApiKeyHandler(req, res) {
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

async function deleteApiKeyHandler(req, res) {
  const { params: { id }, companyId } = req;

  await ApiKeyService.removeOne({ _id: id, companyId });

  return res.json({
    deleted: true,
  });
}

module.exports = router;
