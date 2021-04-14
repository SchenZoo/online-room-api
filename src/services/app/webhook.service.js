const { ModelService } = require('./model.service');
const { WebhookModel } = require('../../database/models');
const { Randoms } = require('../../common');


class WebhookService extends ModelService {
  constructor() {
    super(WebhookModel);
  }

  create(partialDocument) {
    return super.create({
      ...partialDocument,
      secret: Randoms.getRandomString(),
    });
  }
}

module.exports = {
  WebhookService: new WebhookService(),
};
