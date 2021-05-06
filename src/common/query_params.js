const { normalizeValue } = require('./normalizations');
const { escapeRegExp } = require('./reg_exp');

const PAGINATION_PROPERTIES = ['$skip', '$page', '$limit', '$searchString', '$sort'];
const MONGO_QUERY_SPECIAL_PROPS = ['$or', '$and', '$not', '$nor', '$nin', '$in', '$eq', '$exists'];
const MONGO_QUERY_CUSTOM_PROPS = ['$projection', '$relations'];
/**
 *
 * @param {*} query
 * @param {{excludePagination: Boolean, excludeProps: String[], includeProps: String[]}} options
 */
function transformQueryToMongoQuery(query, options = {}) {
  const normalized = {};
  const { excludePagination = false, excludeProps = [], includeProps = [] } = options;
  if (excludePagination) {
    excludeProps.push(...PAGINATION_PROPERTIES, ...MONGO_QUERY_CUSTOM_PROPS);
  }
  excludeProps.push(...excludeNonexistingParams(query));
  Object.keys(query).forEach((prop) => {
    // If property is included or if it's not excluded
    if (includeProps.includes(prop) || !excludeProps.includes(prop)) {
      const currentProp = normalizeValue(query[prop]);
      if (currentProp !== undefined) {
        if (Array.isArray(currentProp) && !MONGO_QUERY_SPECIAL_PROPS.includes(prop)) {
          normalized[prop] = { $in: currentProp };
        } else {
          normalized[prop] = currentProp;
        }
      }
    }
  });
  return normalized;
}
function normalizeSearchOptions(query) {
  const { $searchString } = query;
  const normalizedSearchOptions = {};
  if ($searchString) {
    // set name search string
    normalizedSearchOptions.searchString = $searchString.trim();
  }
  return normalizedSearchOptions;
}
function normalizeSortOptions(query) {
  const {
    $sort,
  } = query;
  const normalizedSortOptions = {};
  if ($sort) {
    try {
      normalizedSortOptions.sort = JSON.parse($sort);
    } catch (error) {
      normalizedSortOptions.sort = {};
      $sort.split(' ').forEach((field) => {
        if (field.startsWith('-')) {
          normalizedSortOptions.sort[field.slice(1)] = -1;
        } else {
          normalizedSortOptions.sort[field] = 1;
        }
      });
    }
  }
  return normalizedSortOptions;
}
/**
 *
 * @param {*} query
 * @param {{
 * MAX_LIMIT?: number;
 * DEFAULT_LIMIT?: number;
 * }} options
 */
function normalizePageOptions(query, options = {}) {
  const { $limit, $skip, $page } = query;
  const { MAX_LIMIT = 200, DEFAULT_LIMIT = 15 } = options;
  const normalizedPageOptions = {};
  normalizedPageOptions.limit = DEFAULT_LIMIT;
  normalizedPageOptions.skip = 0;
  if ($limit) {
    // set number of instances to fetch
    normalizedPageOptions.limit = $limit > MAX_LIMIT ? MAX_LIMIT : +$limit;
  }
  if ($skip) {
    // set number of instances to skip
    normalizedPageOptions.skip = $skip < 0 ? 0 : +$skip;
  }
  if ($page) {
    // if user send pages insted of skip value
    normalizedPageOptions.skip = +($page - 1) * normalizedPageOptions.limit;
    if (normalizedPageOptions.skip < 0) {
      normalizedPageOptions.skip = 0;
    }
  }
  return normalizedPageOptions;
}
function normalizeCustomQueryOptions(query) {
  const { $projection, $relations } = query;
  const normalizedProjectionOptions = {};
  if ($projection) {
    const normalizedProjection = normalizeValue($projection);
    if (typeof normalizedProjection === 'string') {
      normalizedProjectionOptions.projection = normalizedProjection.split(' ').filter((field) => field !== '');
    }
    if (normalizedProjection instanceof Array) {
      normalizedProjectionOptions.projection = normalizedProjection.map((field) => field.trim());
    }
  }
  if ($relations) {
    const normalizedRelations = normalizeValue($relations);
    if (typeof normalizedRelations === 'string') {
      normalizedProjectionOptions.relations = [normalizedRelations];
    }
    if (normalizedRelations instanceof Array) {
      normalizedProjectionOptions.relations = normalizedRelations;
    }
  }
  return normalizedProjectionOptions;
}
/**
 *
 * @param {*} query
 * @param {{
 * pageOpts?:  { MAX_LIMIT?: number, DEFAULT_LIMIT?: number}
 * transformOpts?:  { excludePagination?: boolean, excludeProps?: Array<String>, includeProps?: Array<String> }
 * }} options
 */
function normalizeQueryOptions(query, options = {}) {
  const {
    pageOpts = {},
    transformOpts,
  } = options;
  const normalizedQuery = {
    ...normalizePageOptions(query, pageOpts),
    ...normalizeSearchOptions(query),
    ...normalizeSortOptions(query),
    ...normalizeCustomQueryOptions(query),
    mongoQuery: transformQueryToMongoQuery(query, transformOpts),
  };
  return normalizedQuery;
}
/**
 * Makes search query using regex, works only with searchable fields.
 * @param {String} searchString
 * @param {Array<String>} searchableFields
 * @returns  searchStringQuery If searchString and serachableFields provided, otherwise returns query
 */
function searchStringToMongoQuery(searchString, searchableFields, query = {}) {
  const searchStringQuery = {};
  if (searchString && searchableFields) {
    const regex = new RegExp(escapeRegExp(searchString)
      .split(' ')
      .map((regexp) => `(.*${regexp}.*)`)
      .join('|'), 'i');
    const searchStringQueries = searchableFields.map((searchField) => (
      {
        [searchField]: { $regex: regex },
      }
    ));
    searchStringQuery.$and = [{ ...query }, { $or: searchStringQueries }];
    return searchStringQuery;
  }
  return query;
}
function excludeNonexistingParams(query) {
  if (!query) {
    return [];
  }
  // eslint-disable-next-line max-len
  return Object.keys(query).filter((param) => (!(MONGO_QUERY_CUSTOM_PROPS.includes(param) || MONGO_QUERY_SPECIAL_PROPS.includes(param) || PAGINATION_PROPERTIES.includes(param)) && param.startsWith('$')));
}
module.exports = {
  transformQueryToMongoQuery,
  normalizeQueryOptions,
  searchStringToMongoQuery,
};
