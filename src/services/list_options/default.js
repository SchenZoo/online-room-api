const { Normalizations: { normalizeValue } } = require('../../common');


const LIMIT_MAX = 50;
const LIMIT_DEFAULT = 20;

class ListOptions {
  constructor(query) {
    this.limit = LIMIT_DEFAULT;
    this.skip = 0;

    const {
      limit, skip, page, searchString, sort,
    } = query;

    if (limit) {
      this.limit = limit > LIMIT_MAX ? LIMIT_MAX : +query.limit;
    }
    if (skip) {
      this.skip = skip < 0 ? 0 : +query.skip;
    }
    if (page) {
      this.skip = +(page - 1) * this.limit;
      if (this.skip < 0) {
        this.skip = 0;
      }
    }
    if (searchString) {
      this.searchString = searchString;
    }

    if (sort) {
      this.sort = normalizeValue(sort);
    }
  }
}

module.exports = { ListOptions };
