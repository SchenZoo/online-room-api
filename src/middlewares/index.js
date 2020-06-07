
module.exports = {
  asyncMiddleware: require('./async.middleware'),
  basicAuthMiddleware: require('./authenticate/base_auth.middleware'),
  jwtAuthMiddleware: require('./authenticate/jwt_auth.middleware'),
  apiKeyAuthMiddleware: require('./authenticate/api_key_auth.middleware'),
  multiChoiceMiddleware: require('./multi_choice.middleware'),
  propertyFilterMiddleware: require('./request_property_filter.middleware'),
  cacheClearMiddleware: require('./cache/clear_cache.middleware'),
  ...require('./multer'),
};
