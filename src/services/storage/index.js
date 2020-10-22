const { StorageService } = require('./default');
const { RedisStorageService } = require('./redis_storage');

module.exports = {
  StorageService,
  storageInstance: new RedisStorageService(),
  memoryStorage: new StorageService(),
};
