const multiOptionMiddleware = require('../multi_option.middleware');
const userJwtAuth = require('../authenticate/user_jwt_auth.middleware');
const companyApiKeyAuth = require('../authenticate/company_api_key_auth.middleware');

module.exports = () => multiOptionMiddleware(
  [
    [
      userJwtAuth(),
    ],
    [
      companyApiKeyAuth(),
    ],
  ],
  undefined,
  403
);
