const { ModelService } = require('./model.service');
const { WebhookLogModel } = require('../../database/models');


class WebhookLogService extends ModelService {
  constructor() {
    super(WebhookLogModel);
  }
}

module.exports = {
  WebhookLogService: new WebhookLogService(),
};
