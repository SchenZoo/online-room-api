const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
  managerJwtAuthMiddleware,
} = require('../middlewares');
const { CompanyService } = require('../services/app');


const router = express.Router();

router.post('/', asyncMiddleware(createHandler));
router.get('/current',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.READ_COMPANY),
  asyncMiddleware(getCurrentHandler));
router.get('/', managerJwtAuthMiddleware(), asyncMiddleware(getHandler));


async function createHandler(req, res) {
  const { companyData, userData } = req.body;

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
  return res.json(await CompanyService.getPaginated(req.query));
}

module.exports = router;
