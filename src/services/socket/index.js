const { RoomP2PSocketInstance } = require('./instances/p2p_instance');
const { RoomSocketInstace } = require('./instances/room_instance');
const { SocketProxy } = require('./socket_proxy');

module.exports = {
  RoomP2PSocketInstance,
  RoomSocketInstace,
  SocketProxy,
};
