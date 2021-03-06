const mongoose = require('mongoose');
const { ModelService } = require('./model.service');
const { CompanyModel } = require('../../database/models');
const { WHITELISTED_ORIGINS } = require('../../config');
const { Encryptions } = require('../../common');
const { AuthorizeError } = require('../../errors/general');

class CompanyService extends ModelService {
  constructor() {
    super(CompanyModel);
  }

  async create(companyData = {}, userData = {}) {
    const { UserService } = require('./user.service');

    const companyId = new mongoose.Types.ObjectId();

    const company = await super.create({
      ...companyData,
      _id: companyId,
      configuration: {
        ...companyData.configuration,
        integrationId: Encryptions.encodeMongoId(companyId),
      },
    });
    let user = null;
    try {
      user = await UserService.createMain({
        ...userData,
        companyId: company._id,
      });
    } catch (err) {
      await company.remove();
      throw err;
    }

    const userAuth = await UserService.getUserAuthData(user);

    return {
      company,
      ...userAuth,
    };
  }

  async getCompanyByIntegration(integrationId, origin) {
    const company = await this.getOne({
      'configuration.integrationId': integrationId,
    }, {
      findOptions: {
        projection: 'configuration',
      },
    });
    const { configuration } = company;

    const allOriginsAllowed = this.isCompanyAllowingAnyOrigin(company);

    const parsedOrigin = (origin || '').toLowerCase().replace(/^https?:\/\//, '');
    const parsedWidgetUrl = (configuration.widgetUrl).replace(/^https?:\/\//, '').replace(/\/.*/, '');

    if (!allOriginsAllowed && parsedOrigin !== parsedWidgetUrl) {
      throw new AuthorizeError('Origin not authorized.', true);
    }

    return company;
  }

  getCompanyIdByIntegrationId(integrationId) {
    return Encryptions.decodeMongoId(integrationId);
  }

  isOriginWhiteListed(origin = '') {
    const parsedOrigin = (origin).toLowerCase().replace(/^https?:\/\//, '').replace(/:[0-9]{4,5}$/, '');
    return WHITELISTED_ORIGINS.includes(parsedOrigin);
  }

  isCompanyAllowingAnyOrigin(company) {
    return company && company.configuration && !company.configuration.widgetUrl;
  }
}

module.exports = {
  CompanyService: new CompanyService(),
};
