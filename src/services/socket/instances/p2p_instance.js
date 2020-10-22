const { SocketInstance } = require('../socket_instance');
const { authorizeUser } = require('../global_handlers');


const RoomP2PSocketInstance = new SocketInstance('/rooms-p2p');

const { SOCKET_EVENT_NAMES, SOCKET_ROOMS } = RoomP2PSocketInstance;

RoomP2PSocketInstance.initialize(async (socketClient) => {
  try {
    await authorizeUser(socketClient);
    console.log('Connected to p2p', socketClient.userId);
    socketClient.on(
      SOCKET_EVENT_NAMES.WEBRTC_SEND_OFFER,
      ({ offer, offerSender, offerReceiver }) => {
        console.log(`Offer : (${offerSender})->(${offerReceiver})`);
        RoomP2PSocketInstance.sendEventInRoom(
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
        RoomP2PSocketInstance.sendEventInRoom(
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
        RoomP2PSocketInstance.sendEventInRoom(
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
      console.log('User disconnected from P2P socket instance');
    });
  } catch (err) {
    console.log('Socket user not authorized ', err);
  }
});

module.exports = {
  RoomP2PSocketInstance,
};
