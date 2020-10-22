const {
  REDIS_HOST, REDIS_PORT = '6379', REDIS_PASSWORD, REDIS_DB = '0', REDIS_MEMORY_DB = '1', REDIS_QUEUE_DB = '2',
} = process.env;

if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
  console.error('Redis environment variables are missing!');
  process.exit(1);
}

const REDIS_DEFAULT_CONFIG = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_DB,
  password: REDIS_PASSWORD,
};

const REDIS_MEMORY_CONFIG = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_MEMORY_DB,
  password: REDIS_PASSWORD,
};

const REDIS_QUEUE_CONFIG = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_QUEUE_DB,
  password: REDIS_PASSWORD,
};

module.exports = {
  REDIS_DEFAULT_CONFIG,
  REDIS_MEMORY_CONFIG,
  REDIS_QUEUE_CONFIG,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_DB,
};
