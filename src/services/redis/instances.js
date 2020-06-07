const Redis = require('ioredis');
const { REDIS_CACHE_CONFIG, REDIS_QUEUE_CONFIG } = require('../../config/redis');

const RedisCacheClient = new Redis(REDIS_CACHE_CONFIG);
const RedisSubClient = new Redis(REDIS_QUEUE_CONFIG);
const RedisPubClient = new Redis(REDIS_QUEUE_CONFIG);

module.exports = {
  RedisCacheClient, RedisSubClient, RedisPubClient,
};
