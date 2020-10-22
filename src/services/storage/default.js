const set = require('lodash.set');
const get = require('lodash.get');

const MEMORY_STORAGE = {};

class StorageService {
  async get(key) {
    return get(MEMORY_STORAGE, key);
  }

  async set(key, value) {
    set(MEMORY_STORAGE, key, value);
    return value;
  }

  async remove(key) {
    set(MEMORY_STORAGE, key, undefined);
  }

  async getKeys(pattern) {
    const keys = Object.keys(MEMORY_STORAGE);
    if (pattern) {
      return keys.filter((key) => key.includes(pattern));
    }
    return keys;
  }

  async incr(key, value = +1) {
    const keyValue = await this.get(key);
    if (keyValue) {
      await this.set(keyValue + value);
      return keyValue + value;
    }
    await this.set(key, value);
    return value;
  }
}

module.exports = {
  StorageService,
};
