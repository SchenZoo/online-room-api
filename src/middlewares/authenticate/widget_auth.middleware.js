const { AuthenticateError } = require('../../errors/general');
const { CompanyService } = require('../../services/app');

module.exports = () => async (req, res, next) => {
  try {
    const integrationId = req.headers['x-integrationid'];

    if (!integrationId) {
      return next(new AuthenticateError('X-IntegrationID header is required when accessing using widget', false));
    }

    const company = await CompanyService.getCompanyByIntegration(integrationId, req.get('origin'));

    req.integrationId = integrationId;
    req.company = company;
    req.companyId = `${company._id}`;

    return next();
  } catch (error) {
    return next(error);
  }
};
