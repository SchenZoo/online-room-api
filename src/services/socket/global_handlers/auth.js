const { Encryptions } = require('../../../common');

const {
  SOCKET_EVENT_NAMES,
} = require('../../../constants/socket/event_names.socket');
const { SOCKET_ROOMS } = require('../../../constants/socket/rooms.socket');

/**
 *
 * @param {SocketIO.Socket} socketClient
 */
async function authorizeUser(socketClient) {
  return new Promise((resolve, reject) => {
    socketClient.on(SOCKET_EVENT_NAMES.AUTHORIZE, async (token) => {
      if (token) {
        const { userService } = require('../../app');
        const { _id } = Encryptions.verifyJWT(token, process.env.JWT_SECRET);
        const user = await userService.findOne({ _id });
        socketClient.user = user;
        socketClient.userId = `${user._id}`;
        const authData = { user, token };
        socketClient.emit(SOCKET_EVENT_NAMES.AUTHORIZED, authData);
        socketClient.join(SOCKET_ROOMS.USER_ROOM(_id));
        return resolve(user);
      }
      socketClient.emit(SOCKET_EVENT_NAMES.UNAUTHORIZED);
      socketClient.disconnect();
      reject();
    });
  });
}

module.exports = {
  authorizeUser,
};
