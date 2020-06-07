const SOCKET_EVENT_NAMES = {
  AUTHORIZE: 'authorize',
  UNAUTHORIZED: 'unauthorized',
  AUTHORIZED: 'authorized',
  DISCONNECT: 'disconnect',
  WEBRTC_SEND_OFFER: 'webrtc-send-offer',
  WEBRTC_RECEIVE_OFFER: 'webrtc-receive-offer',
  WEBRTC_SEND_ANSWER: 'webrtc-send-answer',
  WEBRTC_RECEIVE_ANSWER: 'webrtc-receive-answer',
  WEBRTC_SEND_CANDIDATE: 'webrtc-send-candidate',
  WEBRTC_RECEIVE_CANDIDATE: 'webrtc-receive-candidate',
  ROOM_USER_JOINED: 'room-user-joined',
  ROOM_USER_LEFT: 'room-user-left',
  USER_DISCONNECTED: 'user-disconnected',
};

module.exports = {
  SOCKET_EVENT_NAMES,
};
