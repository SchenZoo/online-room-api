
const axios = require('axios');
const query = require('querystring');
const { ModelService } = require('./model.service');
const { WebhookModel } = require('../../database/models/webhook.model');
const { Randoms, Encryptions, ObjectTransforms } = require('../../common');
const { WebhookLogService } = require('./webhook_log.service');


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

  async removeOne(query) {
    const document = await super.removeOne(query);

    await WebhookLogService.removeMany({
      webhookId: document._id,
    });

    return document;
  }

  async sendCompanyWebhooks(companyId, eventType, payload) {
    const webhooks = await this.findAll({
      companyId,
      eventTypes: eventType,
    });

    return Promise.all(webhooks.map(async (webhook) => {
      const {
        body,
        responseCode,
        responseData,
        signature,
      } = await this.sendWebhook(webhook.requestUrl, {
        eventType,
        webhookId: webhook._id,
        payload,
      }, {
        requestMethod: webhook.requestMethod,
        headers: webhook.headers || {},
        signatureSecret: webhook.secret,
      });

      return WebhookLogService.create({
        requestData: body,
        responseData,
        responseCode,
        signature,
        webhookId: webhook._id,
        companyId,
      });
    }));
  }

  /**
     *
     * @param {string} requestUrl
     * @param {any} body
     * @param {{
      *   requestMethod?: "POST"|"GET",
      *   headers?: Record<string,string|number>,
      *   signatureSecret?: string,
      *   signatureHeaderKey?: string
      * }} options
      */
  async sendWebhook(requestUrl, body, options = {}) {
    const {
      requestMethod = 'POST',
      headers = {},
      signatureSecret,
      signatureHeaderKey = 'X-Signature',
    } = options;

    const sortedBody = ObjectTransforms.sortObjectByKey(body);

    let signature = '';

    if (signatureSecret) {
      signature = Encryptions.hmacSha265Hash(signatureSecret, JSON.stringify(sortedBody));
      headers[signatureHeaderKey] = signature;
    }

    let responseData;
    let responseCode;
    try {
      let response;
      switch (requestMethod) {
        case 'GET': {
          const queryString = query.stringify(sortedBody);
          response = await axios.get(`${requestUrl}?${queryString}`, { headers });
          break;
        }
        case 'POST':
        default:
          response = await axios.post(requestUrl, sortedBody, { headers });
          break;
      }
      const { data, status } = response;
      responseData = data;
      responseCode = status;
    } catch (err) {
      const { response } = err;
      responseData = response.data;
      responseCode = response.status;
    }

    return {
      body: sortedBody,
      signature,
      responseData,
      responseCode,
    };
  }
}

module.exports = {
  WebhookService: new WebhookService(),
};
