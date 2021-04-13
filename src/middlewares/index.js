const { PERMISSIONS } = require('../constants/company/user/permissions');


module.exports = {
  asyncMiddleware: require('./async.middleware'),
  managerJwtAuthMiddleware: require('./authenticate/manager_jwt_auth.middleware'),
  userJwtAuthMiddleware: require('./authenticate/user_jwt_auth.middleware'),
  staticApiKeyAuthMiddleware: require('./authenticate/static_api_key_auth.middleware'),
  multiOptionMiddleware: require('./multi_option.middleware'),
  propertyFilterMiddleware: require('./request_property_filter.middleware'),
  mapRequestPropMiddleware: require('./mappers/map_request_body.middleware'),
  hasCompanyAccessMiddleware: require('./authorisation/has_company_access.middleware'),
  hasPermissionMiddleware: require('./authorisation/has_permission.middleware'),
  ...require('./multer'),
  PERMISSIONS,
};
