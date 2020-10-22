const SOCKET_ROOMS = {
  USER_ROOM: (userId) => `user-${userId}`,
  TEACHING_ROOM: (roomId) => `teaching-room-${roomId}`,
};

module.exports = {
  SOCKET_ROOMS,
};
