const { API_KEYS, KEY_OWNERS } = require('../../config/api_keys');
const { AuthenticateError } = require('../../errors/general');

module.exports = (keyOwner = KEY_OWNERS.DEFAULT, keyProperty = 'SApiKey') => async (req, res, next) => {
  let apiKey;
  try {
    if (!API_KEYS[keyOwner]) {
      console.error(`keyOwner doesnt exist in api keys: ${keyOwner}`);
      throw new Error();
    }

    if (req.headers.authorization) {
      try {
        const [authName, authInfo] = req.headers.authorization.split(' ');
        if (authName === keyProperty) {
          apiKey = authInfo;
        }
      } catch (err) {}
    }

    if (req.query[keyProperty]) {
      apiKey = req.query[keyProperty];
    }

    if (!apiKey) {
      throw new Error();
    }

    if (req.staticApiKey === apiKey) {
      return next();
    }
  } catch (e) {
    return next(new AuthenticateError(`Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN|API_KEY}". For statis api key use ${keyProperty} type`, false));
  }

  if (API_KEYS[keyOwner].includes(apiKey)) {
    req.staticApiKey = apiKey;
    return next();
  }

  return next(new AuthenticateError('Invalid api key', true));
};
