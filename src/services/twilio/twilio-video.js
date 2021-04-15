
const { AccessToken } = require('twilio').jwt;

const { VideoGrant } = AccessToken;


class TwilioVideoService {
  constructor(TWILIO_ACCOUNT_SID, TWILIO_API_SID, TWILIO_API_SECRET) {
    this.TWILIO_ACCOUNT_SID = TWILIO_ACCOUNT_SID;
    this.TWILIO_API_SID = TWILIO_API_SID;
    this.TWILIO_API_SECRET = TWILIO_API_SECRET;
  }

  getVideoToken(roomId, identity, ttl = 14400) {
    const token = new AccessToken(
      this.TWILIO_ACCOUNT_SID,
      this.TWILIO_API_SID,
      this.TWILIO_API_SECRET,
      { ttl }
    );

    token.identity = `${identity}`;

    const grant = new VideoGrant({ room: `${roomId}` });
    token.addGrant(grant);

    return token.toJwt();
  }
}

module.exports = {
  TwilioVideoService,
};
