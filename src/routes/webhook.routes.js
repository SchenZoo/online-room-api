const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
} = require('../middlewares');

const { WebhookService } = require('../services/app');

const router = express.Router();

router.use(hasCompanyAccessMiddleware());

router.post('/', hasPermissionMiddleware(PERMISSIONS.CREATE_WEBHOOKS), asyncMiddleware(createHandler));
router.get('/', hasPermissionMiddleware(PERMISSIONS.READ_WEBHOOKS), asyncMiddleware(getHandler));
router.get('/:id', hasPermissionMiddleware(PERMISSIONS.READ_WEBHOOKS), asyncMiddleware(findHandler));
router.patch('/:id', hasPermissionMiddleware(PERMISSIONS.UPDATE_WEBHOOKS), asyncMiddleware(updateHandler));
router.delete('/:id', hasPermissionMiddleware(PERMISSIONS.DELETE_WEBHOOKS), asyncMiddleware(deleteHandler));

async function createHandler(req, res) {
  const { companyId, body } = req;

  const webhook = await WebhookService.create({
    ...body,
    companyId,
  });

  return res.json({
    webhook,
  });
}

async function getHandler(req, res) {
  const { companyId, query } = req;
  return res.json(await WebhookService.getPaginated(query, {
    additionalQuery: {
      companyId,
    },
  }));
}

async function findHandler(req, res) {
  const { params: { id }, companyId, query } = req;

  return res.json({
    webhook: await WebhookService.getOne(query, {
      additionalQuery: {
        companyId,
        _id: id,
      },
    }),
  });
}

async function updateHandler(req, res) {
  const {
    params: { id }, companyId, body,
  } = req;

  const webhook = await WebhookService.updateOne({
    _id: id,
    companyId,
  }, body);

  return res.json({
    webhook,
  });
}

async function deleteHandler(req, res) {
  const { params: { id }, companyId } = req;

  await WebhookService.removeOne({ _id: id, companyId });

  return res.json({
    deleted: true,
  });
}

module.exports = router;
