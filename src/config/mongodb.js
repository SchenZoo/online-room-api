const {
  MONGO_USERNAME, MONGO_PASSWORD, MONGO_DB, MONGO_SOURCE = 'admin', MONGO_SERVER = 'localhost', MONGO_PORT = '27017',
} = process.env;

if (!MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_DB) {
  console.error(
    'MongoDB environment variables are missing!'
  );
  process.exit(1);
}

const mongoDbConnectOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  poolSize: 5,
  user: MONGO_USERNAME,
  pass: MONGO_PASSWORD,
  authSource: MONGO_SOURCE,
  useFindAndModify: false,
  useUnifiedTopology: true,
};
const mongoDBbUrl = `mongodb://${MONGO_SERVER}:${MONGO_PORT}/${MONGO_DB}`;

module.exports = {
  mongoDbConnectOptions,
  mongoDBbUrl,
};
