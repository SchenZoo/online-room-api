const {
  PORT = '3000',
  USER_JWT_SECRET,
  MANAGER_JWT_SECRET,
  EVENT_PARTICIPANT_JWT_SECRET,
  WEBRTC_JWT_SECRET,
  HASH_ID_SECRET,
} = process.env;

const server = {
  PORT: +PORT,
  USER_JWT_SECRET,
  MANAGER_JWT_SECRET,
  EVENT_PARTICIPANT_JWT_SECRET,
  WEBRTC_JWT_SECRET,
  HASH_ID_SECRET,
};

const missingVars = Object.entries(server).filter(([, value]) => !value).map(([key]) => key);

if (missingVars.length) {
  console.error(`Missing ${missingVars.join(', ')}`);
  process.exit(1);
}


const WHITELISTED_ORIGINS = [
  'localhost',
  'widget.web-conf.xyz',
];

const INTEGRATION_ID_HEADER = 'x-integrationid';

module.exports = {
  ...server,
  WHITELISTED_ORIGINS,
  INTEGRATION_ID_HEADER,
};
