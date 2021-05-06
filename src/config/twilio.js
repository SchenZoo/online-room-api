const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_SID,
  TWILIO_API_SECRET,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_API_SID || !TWILIO_API_SECRET) {
  console.error(
    'Twilio env vars are missing!'
  );
  process.exit(1);
}

module.exports = {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_SID,
  TWILIO_API_SECRET,
};
