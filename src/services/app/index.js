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
const { EventReviewService } = require('./event_review.service');
const { TrackingEventStatsService } = require('./tracking_event_stats.service');

const { EventSocketService } = require('./socket/event.socket_service');

// const date1 = new Date();
// const date2 = new Date();
// date2.setMinutes(date2.getMinutes() + 50);

// TrackingEventService.trackParticipantLeft({
//   companyId: '607ee822dc66f71d25afafee',
//   _id: '607ee88ddc66f71d25afaff5',
// }, '607ee895dc66f71d25afaff7', date1, date2);

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
  EventReviewService,
  TrackingEventStatsService,
};
