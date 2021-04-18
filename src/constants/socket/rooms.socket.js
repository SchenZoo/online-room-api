const SOCKET_ROOM_NAMES = {
  EVENT_ROOM: (eventId) => `event-${eventId}`,
  EVENT_ADMINS_ROOM: (eventId) => `event-${eventId}-admins`,
  EVENT_USER_ROOM: (eventId, userId) => `event-${eventId}-user-${userId}`,

  SOCKET_SERVICE_USER_ROOM: (userId) => `socket-user-${userId}`,
};

module.exports = {
  SOCKET_ROOM_NAMES,
};
