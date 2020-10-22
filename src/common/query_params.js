
const { normalizeValue } = require('./normalizations');

const PAGINATION_PROPERTIES = ['skip', 'page', 'limit', 'searchString', 'sort'];

const MONGO_QUERY_SPECIAL_PROPS = ['$or', '$and', '$not', '$nor', '$nin', '$in', '$eq'];

/**
 *
 * @param {any} query
 * @param {{excludePagination: Boolean, excludeProps: String[], includeProps: String[]}} options
 */
function normalizeQueryToMongo(query, options = {}) {
  const normalized = {};
  const { excludePagination = false, excludeProps = [], includeProps = [] } = options;
  if (excludePagination) {
    excludeProps.push(...PAGINATION_PROPERTIES);
  }
  Object.keys(query).forEach((prop) => {
    // If property is included or if it's not excluded
    if (includeProps.includes(prop) || !excludeProps.includes(prop)) {
      const currentProp = normalizeValue(query[prop]);
      if (Array.isArray(currentProp) && !MONGO_QUERY_SPECIAL_PROPS.includes(prop)) {
        normalized[prop] = { $in: currentProp };
      } else {
        normalized[prop] = currentProp;
      }
    }
  });
  return normalized;
}

module.exports = {
  normalizeQueryToMongo,
};
