const { StorageService } = require('./default');
const { RedisStorageService } = require('./redis_storage');

module.exports = {
  RedisStorageService: new RedisStorageService(),
  MemoryStorageService: new StorageService(),
};
