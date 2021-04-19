const { AuthService } = require('./auth.service');
const { ManagerService } = require('./manager.service');
const { CompanyService } = require('./company.service');
const { UserService } = require('./user.service');
const { EventService } = require('./event.service');
const { ApiKeyService } = require('./api_key.service');
const { WebhookService } = require('./webhook.service');
const { WebhookLogService } = require('./webhook_log.service');
const { TrackingEventService } = require('./tracking_event.service');
const { EventChatService } = require('./event_chat.service');

const { EventSocketService } = require('./socket/event.socket_service');

module.exports = {
  AuthService,
  ManagerService,
  CompanyService,
  UserService,
  EventService,
  ApiKeyService,
  WebhookService,
  WebhookLogService,
  EventSocketService,
  TrackingEventService,
  EventChatService,
};
