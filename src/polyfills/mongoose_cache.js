const mongoose = require('mongoose');
const Redis = require('ioredis');

const { REDIS_CACHE_CONFIG } = require('../config/redis');

const client = new Redis(REDIS_CACHE_CONFIG);

const { exec } = mongoose.Query.prototype;

mongoose.Query.prototype.cache = function (options) {
  if ((typeof options === 'boolean' && options) || options === undefined) {
    this.cacheKey = this.model.modelName;
    this.useCache = true;
    return this;
  }
  if (typeof options === 'object') {
    const { cacheKey } = options;
    this.useCache = true;
    this.cacheKey = cacheKey || this.model.modelName;
  }

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache || !this.cacheKey) {
    return exec.apply(this, arguments);
  }

  const { lean, ...restMongooseOptions } = this._mongooseOptions;

  const key = JSON.stringify(
    {
      query: { ...this.getQuery() },
      mongooseOptions: restMongooseOptions,
      modelName: this.model.modelName,
    }
  );

  const cacheValue = await client.hget(this.cacheKey, key);

  if (cacheValue) {
    const cacheValueParsed = JSON.parse(cacheValue);
    if (lean) {
      return cacheValueParsed;
    }
    return Array.isArray(cacheValueParsed)
      ? cacheValueParsed.map((value) => new this.model(value))
      : new this.model(cacheValueParsed);
  }
  const result = await exec.apply(this, arguments);
  client.hset(this.cacheKey, key, JSON.stringify(result));
  return result;
};
