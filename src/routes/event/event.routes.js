const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
} = require('../../middlewares');

const { EventService } = require('../../services/app');

const router = express.Router();

router.use(hasCompanyAccessMiddleware());

router.post('/', hasPermissionMiddleware(PERMISSIONS.CREATE_EVENTS), asyncMiddleware(createHandler));
router.get('/', hasPermissionMiddleware(PERMISSIONS.READ_EVENTS), asyncMiddleware(getHandler));
router.get('/:id', hasPermissionMiddleware(PERMISSIONS.READ_EVENTS), asyncMiddleware(findHandler));
router.patch('/:id', hasPermissionMiddleware(PERMISSIONS.UPDATE_EVENTS), asyncMiddleware(updateHandler));
router.delete('/:id', hasPermissionMiddleware(PERMISSIONS.DELETE_EVENTS), asyncMiddleware(deleteHandler));

async function createHandler(req, res) {
  const { companyId, body } = req;

  const event = await EventService.create({
    ...body,
    companyId,
  });

  return res.json({
    event,
  });
}

async function getHandler(req, res) {
  const { companyId, query } = req;
  return res.json(await EventService.getPaginated(query, {
    additionalQuery: {
      companyId,
    },
    additionalForbiddenProps: ['participants'],
  }));
}

async function findHandler(req, res) {
  const { params: { id }, companyId, query } = req;

  return res.json({
    event: await EventService.getOne({
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

  const event = await EventService.updateOne({
    _id: id,
    companyId,
  }, body);

  return res.json({
    event,
  });
}

async function deleteHandler(req, res) {
  const { params: { id }, companyId } = req;

  await EventService.removeOne({ _id: id, companyId });

  return res.json({
    deleted: true,
  });
}

module.exports = router;
