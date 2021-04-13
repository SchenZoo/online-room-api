const WEBHOOK_EVENT_TYPES = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ROLE_CREATED: 'USER_ROLE_CREATED',
  USER_ROLE_UPDATED: 'USER_ROLE_UPDATED',
  USER_ROLE_DELETED: 'USER_ROLE_DELETED',
  TRANSACTION_CREATED: 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED: 'TRANSACTION_UPDATED',
  WALLET_UPDATED: 'WALLET_UPDATED',
  EVENT_CREATED: 'EVENT_CREATED',
  EVENT_UPDATED: 'EVENT_UPDATED',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  EVENT_DELETED: 'EVENT_DELETED',
  EVENT_JOINED: 'EVENT_JOINED',
};


module.exports = {
  WEBHOOK_EVENT_TYPES,
};
