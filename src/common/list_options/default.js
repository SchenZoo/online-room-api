const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 15;

class ListOptions {
  constructor(query) {
    this.limit = DEFAULT_LIMIT;
    this.skip = 0;

    if (query.limit) {
      // set number of instances to fetch
      this.limit = query.limit > MAX_LIMIT ? MAX_LIMIT : +query.limit;
    }
    if (query.skip) {
      // set number of instances to skip
      this.skip = query.skip < 0 ? 0 : +query.skip;
    }
    if (query.page) {
      // if user send pages insted of skip value
      this.skip = +(query.page - 1) * this.limit;
      if (this.skip < 0) {
        this.skip = 0;
      }
    }
    if (query.searchString) {
      // set name search string
      this.searchString = query.searchString;
    }
    if (query.sortCriteria) {
      this.sortCriteria = query.sortCriteria;
      this.sortOrder = -1;
      if (query.sortOrder === 'asc') {
      // set the sorting order
        this.sortOrder = 1;
      }
    }
  }
}

module.exports = { ListOptions };
