const Redis = require('ioredis');
const { REDIS_MEMORY_CONFIG, REDIS_QUEUE_CONFIG } = require('../../config/redis');

const RedisMemoryClient = new Redis(REDIS_MEMORY_CONFIG);
const RedisSubClient = new Redis(REDIS_QUEUE_CONFIG);
const RedisPubClient = new Redis(REDIS_QUEUE_CONFIG);

module.exports = {
  RedisMemoryClient,
  RedisPubClient,
  RedisSubClient,
};
