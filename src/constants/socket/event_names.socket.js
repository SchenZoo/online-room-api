const SOCKET_EVENT_NAMES = {
  AUTH: 'auth',
  AUTH_SUCCESS: 'auth:success',
  AUTH_FAIL: 'auth:fail',
  DISCONNECT: 'disconnect',
  KICKED: 'kicked',

  ONLINE_ACKNOWLEDGE: 'online-acknowledge',
  ONLINE_ACKNOWLEDGE_SUCCESS: 'online-acknowledge:success',

  WEBRTC_PEER_CONNECTED: 'webrtc-peer-connected',
  WEBRTC_PEER_DISCONNECTED: 'webrtc-peer-disconnected',
  WEBRTC_OFFER: 'webrtc-offer',
  WEBRTC_ANSWER: 'webrtc-answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc-ice-candidate',
  WEBRTC_TRACK_OFF: 'webrtc-track-off',

  EVENT_CHANGED: 'event-changed',
  EVENT_DISABLE_MIC_PARTICIPANT: 'event-disable-mic-participant',
  EVENT_DISABLE_MIC_ALL: 'event-disable-mic-all',
  EVENT_DISABLE_CAMERA_PARTICIPANT: 'event-disable-camera-participant',
  EVENT_DISABLE_CAMERA_ALL: 'event-disable-camera-all',
  EVENT_KICK_PARTICIPANT: 'event-kick-participant',
  EVENT_MESSAGE_CREATED: 'event-message-created',
};

module.exports = {
  SOCKET_EVENT_NAMES,
};
