const { ModelService } = require('./model.service');
const { CompanyModel } = require('../../database/models');


class CompanyService extends ModelService {
  constructor() {
    super(CompanyModel);
  }

  async create(companyData, userData) {
    const { UserService } = require('./user.service');
    const company = await super.create(companyData);

    const user = await UserService.createMain({
      ...userData,
      companyId: company._id,
    });

    const userAuth = await UserService.getUserAuthData(user);

    return {
      company,
      ...userAuth,
    };
  }
}

module.exports = {
  CompanyService: new CompanyService(),
};
