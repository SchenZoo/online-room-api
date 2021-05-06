const { TwilioVideoService } = require('./twilio-video');
const { TWILIO_ACCOUNT_SID, TWILIO_API_SID, TWILIO_API_SECRET } = require('../../config');


module.exports = {
  DefaultVideoService: new TwilioVideoService(TWILIO_ACCOUNT_SID, TWILIO_API_SID, TWILIO_API_SECRET),
};
