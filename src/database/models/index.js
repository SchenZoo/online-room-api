const { MangerModel } = require('./manager.model');
const { CompanyModel } = require('./company.model');
const { UserModel } = require('./user/user.model');
const { ApiKeyModel } = require('./user/api_key.model');
const { WebhookModel } = require('./webhook.model');
const { WebhookLogModel } = require('./webhook_log.model');
const { EventModel } = require('./event/event.model');
const { ChatMessageModel } = require('./event/chat_message.model');

module.exports = {
  MangerModel,
  CompanyModel,
  UserModel,
  ApiKeyModel,
  WebhookModel,
  WebhookLogModel,
  EventModel,
  ChatMessageModel,
};
