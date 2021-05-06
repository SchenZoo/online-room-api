const { AuthenticateError } = require('../../errors/general');
const { CompanyService } = require('../../services/app');
const { INTEGRATION_ID_HEADER } = require('../../config');

module.exports = () => async (req, res, next) => {
  try {
    const integrationId = req.headers[INTEGRATION_ID_HEADER];

    if (!integrationId) {
      if (CompanyService.isOriginWhiteListed(req.get('origin'))) {
        return next();
      }
      return next(new AuthenticateError(`${INTEGRATION_ID_HEADER} header is required when accessing using widget`, false));
    }

    const company = await CompanyService.getCompanyByIntegration(integrationId, req.get('origin'));

    req.integrationId = integrationId;
    req.company = company;
    req.companyId = company && `${company._id}`;

    return next();
  } catch (error) {
    return next(error);
  }
};
