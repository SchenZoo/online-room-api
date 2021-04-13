const { AuthenticateError } = require('../../errors/general');

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
        throw new Error();
      }
    } catch (err) {
      return next(new AuthenticateError(`Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN|API_KEY}". For company api key authorization use ${keyProperty} type`, false));
    }

    // :TODO find api key and company
    // :TODO api key permissions

    req.apiKey = apiKey;
  } catch (exception) {
    return next(new AuthenticateError('Invalid api key'));
  }
  return next();
};
