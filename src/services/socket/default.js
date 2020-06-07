const { SocketInstance } = require('./socket_instance');
const { authorizeUser } = require('./global_handlers');
const { RoomModel } = require('../../database/models');

const {
  SOCKET_EVENT_NAMES,
} = require('../../constants/socket/event_names.socket');
const { SOCKET_ROOMS } = require('../../constants/socket/rooms.socket');

const DefaultSocketInstance = new SocketInstance('/');

DefaultSocketInstance.initialize(async (socketClient) => {
  try {
    await authorizeUser(socketClient);
    const { user } = socketClient;
    const userId = `${user._id}`;
    socketClient.on(
      SOCKET_EVENT_NAMES.WEBRTC_SEND_OFFER,
      ({ offer, offerSender, offerReceiver }) => {
        console.log(`Offer : (${offerSender})->(${offerReceiver})`);
        DefaultSocketInstance.sendEventInRoom(
          SOCKET_ROOMS.USER_ROOM(offerReceiver),
          SOCKET_EVENT_NAMES.WEBRTC_RECEIVE_OFFER,
          {
            offer,
            offerSender,
            offerReceiver,
          }
        );
      }
    );
    socketClient.on(
      SOCKET_EVENT_NAMES.WEBRTC_SEND_ANSWER,
      ({ answer, answerSender, answerReceiver }) => {
        console.log(`Answer : (${answerSender})->(${answerReceiver})`);
        DefaultSocketInstance.sendEventInRoom(
          SOCKET_ROOMS.USER_ROOM(answerReceiver),
          SOCKET_EVENT_NAMES.WEBRTC_RECEIVE_ANSWER,
          {
            answer,
            answerSender,
            answerReceiver,
          }
        );
      }
    );

    socketClient.on(
      SOCKET_EVENT_NAMES.WEBRTC_SEND_CANDIDATE,
      ({ candidate, candidateSender, candidateReceiver }) => {
        console.log(`Candidate : (${candidateSender})->(${candidateReceiver})`);
        DefaultSocketInstance.sendEventInRoom(
          SOCKET_ROOMS.USER_ROOM(candidateReceiver),
          SOCKET_EVENT_NAMES.WEBRTC_RECEIVE_CANDIDATE,
          {
            candidate,
            candidateSender,
            candidateReceiver,
          }
        );
      }
    );

    socketClient.on('disconnect', async () => {
      DefaultSocketInstance.sendEvent(
        SOCKET_EVENT_NAMES.USER_DISCONNECTED,
        userId
      );
      await RoomModel.updateMany(
        { users: { $elemMatch: { _id: userId } } },
        { $pull: { users: { _id: userId } } }
      );
    });
  } catch (err) {
    console.log('Socket user not authorized ', err);
  }
});

module.exports = {
  DefaultSocketInstance,
};
