const { ModelService } = require('./model.service');
const { ApiKeyModel } = require('../../database/models');
const { Randoms } = require('../../common');


class ApiKeyService extends ModelService {
  constructor() {
    super(ApiKeyModel);
  }

  create(partialDocument) {
    return super.create({
      ...partialDocument,
      value: Randoms.getRandomString(),
    });
  }
}

module.exports = {
  ApiKeyService: new ApiKeyService(),
};
