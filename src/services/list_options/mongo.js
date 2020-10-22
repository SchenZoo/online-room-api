const { ListOptions } = require('./default');
const { QueryParams } = require('../../common');

class MongoListOptions extends ListOptions {
  constructor(query) {
    super(query);

    this.mongoQuery = QueryParams.normalizeQueryToMongo(query, { excludePagination: true });
  }
}

class AuthorizedMongoListOptions extends MongoListOptions {
  constructor(query, user) {
    super(query);

    this.mongoQuery = {
      userId: user._id,
    };
  }
}

module.exports = {
  MongoListOptions,
  AuthorizedMongoListOptions,
};
