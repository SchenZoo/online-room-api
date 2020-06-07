const { RedisCacheClient } = require('../../services/redis');

/**
 *
 * @param {{Model:any|null,cacheKey:string|null,customKey:string|null}} options
 */
const removeMongoCache = (options = {}) => async (req, res, next) => {
  const { Model, cacheKey, customKey } = options;
  let key = cacheKey;
  try {
    if (!cacheKey && Model) {
      key = Model.modelName;
    }
    if (!key) {
      console.error('Cache key missing', options);
      return next();
    }
    if (['string', 'number'].includes(typeof key)) {
      if (customKey) {
        await RedisCacheClient.hdel(key, customKey);
      } else {
        await RedisCacheClient.del(key);
      }
    }
    if (Array.isArray(key)) {
      await RedisCacheClient.del(...key);
    }
  } catch (error) {
    console.error(`Error clearing cache: ${key}`, error);
  }
  next();
};

module.exports = removeMongoCache;
