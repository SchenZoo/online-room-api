const { StorageService } = require('./default');
const { RedisMemoryClient } = require('../redis');

class RedisStorageService extends StorageService {
  async get(key) {
    return RedisMemoryClient.get(key);
  }

  async set(key, value) {
    await RedisMemoryClient.set(key, value);
  }

  async remove(key) {
    await RedisMemoryClient.del(key);
  }

  async getKeys(pattern) {
    return RedisMemoryClient.keys(pattern);
  }

  async incr(key, value = +1) {
    return RedisMemoryClient.incrby(key, value);
  }
}

module.exports = {
  RedisStorageService,
};
