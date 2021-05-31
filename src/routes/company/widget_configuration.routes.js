const express = require('express');

const {
  PERMISSIONS,
  asyncMiddleware,
  widgetAuthMiddleware,
  hasCompanyAccessMiddleware,
  hasPermissionMiddleware,
  fileUploadMiddleware,
} = require('../../middlewares');

const { CompanyService } = require('../../services/app');

const router = express.Router();

router.get('/',
  widgetAuthMiddleware(),
  asyncMiddleware(getWidgetConfigurationHandler));

router.patch('/',
  hasCompanyAccessMiddleware(),
  hasPermissionMiddleware(PERMISSIONS.UPADTE_COMPANY_CONFIGURATION),
  fileUploadMiddleware({
    fileProp: 'avatarImageKey',
    mimeValidator: /^image/i,
    saveInProp: 'body.avatarImageKey',
  }),
  asyncMiddleware(updateHandler));

async function getWidgetConfigurationHandler(req, res) {
  const { company } = req;

  return res.json({
    configuration: company && company.configuration,
  });
}

async function updateHandler(req, res) {
  const {
    companyId, body,
  } = req;

  const company = await CompanyService.getOne({
    _id: companyId,
  }, {
    findOptions: {
      projection: 'configuration',
    },
  });

  await CompanyService.updateObject(company, { configuration: body });

  return res.json({
    configuration: company.configuration,
  });
}

module.exports = router;
