const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  managerJwtAuthMiddleware,
  hasPermissionMiddleware,
  fileUploadMiddleware,
} = require('../../middlewares');

const { ObjectTransforms } = require('../../common');

const { CompanyService } = require('../../services/app');


const router = express.Router();

router.post('/', managerJwtAuthMiddleware(), asyncMiddleware(createHandler));

router.get('/current',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.READ_COMPANY),
  asyncMiddleware(getCurrentHandler));

router.patch('/current',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPDATE_COMPANY),
  fileUploadMiddleware({
    fileProp: 'logoKey',
    mimeValidator: /^image/i,
    saveInProp: 'body.logoKey',
  }),
  asyncMiddleware(updateCurrentHandler));

router.get('/', managerJwtAuthMiddleware(), asyncMiddleware(getHandler));

async function createHandler(req, res) {
  const { body: { companyData, userData } } = req;

  const { company, user, token } = await CompanyService.create(companyData, userData);

  return res.json({
    company,
    user,
    token,
  });
}

async function getCurrentHandler(req, res) {
  const { companyId } = req;

  const company = await CompanyService.findOne({ _id: companyId });

  return res.json({
    company,
  });
}

async function getHandler(req, res) {
  const { query } = req;

  return res.json(await CompanyService.getPaginated(query));
}

async function updateCurrentHandler(req, res) {
  const { companyId, body } = req;

  const company = await CompanyService.updateOne({ _id: companyId }, ObjectTransforms.removeProps(body, ['configuration']));

  return res.json({
    company,
  });
}


module.exports = router;
