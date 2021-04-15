const SOCKET_EVENT_NAMES = {
  AUTH: 'auth',
  AUTH_SUCCESS: 'auth:success',
  AUTH_FAIL: 'auth:fail',
  DISCONNECT: 'disconnect',

  WEBRTC_SEND_OFFER: 'webrtc-send-offer',
  WEBRTC_RECEIVE_OFFER: 'webrtc-receive-offer',
  WEBRTC_SEND_ANSWER: 'webrtc-send-answer',
  WEBRTC_RECEIVE_ANSWER: 'webrtc-receive-answer',
  WEBRTC_SEND_CANDIDATE: 'webrtc-send-candidate',
  WEBRTC_RECEIVE_CANDIDATE: 'webrtc-receive-candidate',

  EVENT_MUTE_PARTICIPANT: 'event-mute-participant',
  EVENT_KICK_PARTICIPANT: 'event-kick-participant',
};

module.exports = {
  SOCKET_EVENT_NAMES,
};
