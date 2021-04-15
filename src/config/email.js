const {
  SMTP_USERNAME, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT,
} = process.env;

if (!SMTP_USERNAME || !SMTP_PASSWORD || !SMTP_HOST || !SMTP_PORT) {
  console.error('SMTP environment variables are missing!');
  // process.exit(1);
}

const SMTPOptions = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: +SMTP_PORT === 465,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
};

module.exports = {
  SMTPOptions,
};
