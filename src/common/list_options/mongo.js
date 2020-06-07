const { ListOptions } = require('./default');
const { normalizeQueryToMongo } = require('../query_params/normalize_to_mongo');

class MongoListOptions extends ListOptions {
  constructor(query) {
    super(query);

    this.mongoQuery = normalizeQueryToMongo(query, { excludePagination: true });
  }
}

module.exports = {
  MongoListOptions,
};
