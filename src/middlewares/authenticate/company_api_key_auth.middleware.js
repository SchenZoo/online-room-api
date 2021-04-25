const { AuthenticateError } = require('../../errors/general');
const { ApiKeyService } = require('../../services/app');

module.exports = () => async (req, res, next) => {
  try {
    let apiKey;
    const keyProperty = 'ApiKey';
    try {
      if (req.headers.authorization) {
        const [authName, authInfo] = req.headers.authorization.split(' ');
        if (authName === keyProperty) {
          apiKey = authInfo;
        }
      }

      if (req.query[keyProperty]) {
        apiKey = req.query[keyProperty];
      }

      if (!apiKey) {
        throw new Error('Api key missing!');
      }

      if (req.companyApiKey === apiKey) {
        return next();
      }
    } catch (err) {
      return next(new AuthenticateError(`Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {API_KEY}". For company api key authorization use ${keyProperty} type`, false));
    }

    const apiKeyM = await ApiKeyService.getOne({
      value: apiKey,
    });

    req.companyApiKey = apiKey;
    req.apiKey = apiKeyM;
    req.apiKeyId = `${apiKeyM._id}`;
    req.permissions = apiKeyM.permissions;
    req.companyId = `${apiKeyM.companyId}`;

    return next();
  } catch (exception) {
    return next(new AuthenticateError('Invalid api key'));
  }
};
