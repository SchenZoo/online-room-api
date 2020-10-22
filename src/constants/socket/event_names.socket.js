const SOCKET_EVENT_NAMES = {
  AUTHORIZE: 'authorize',
  UNAUTHORIZED: 'unauthorized',
  AUTHORIZED: 'authorized',
  DISCONNECT: 'disconnect',
  KICKED: 'kicked',

  WEBRTC_SEND_OFFER: 'webrtc-send-offer',
  WEBRTC_RECEIVE_OFFER: 'webrtc-receive-offer',
  WEBRTC_SEND_ANSWER: 'webrtc-send-answer',
  WEBRTC_RECEIVE_ANSWER: 'webrtc-receive-answer',
  WEBRTC_SEND_CANDIDATE: 'webrtc-send-candidate',
  WEBRTC_RECEIVE_CANDIDATE: 'webrtc-receive-candidate',

  ROOM_PARTICIPANT_CHANGED: 'room-participant-changed',
  ROOM_HOST_CHANGED: 'room-host-changed',
  ROOM_OVERTAKING_CHANGED: 'room-overtaking-changed',

  ROOM_PARTICIPANT_JOIN: 'room-participant-join',

  ROOM_PARTICIPANT_JOINED: 'room-participant-joined',
  ROOM_PARTICIPANT_LEFT: 'room-participant-left',

  ROOM_MESSAGE_CREATED: 'room-messagee-created',
  WHITEBOARD_CHANGED: 'whiteboard-changed',
};

module.exports = {
  SOCKET_EVENT_NAMES,
};
