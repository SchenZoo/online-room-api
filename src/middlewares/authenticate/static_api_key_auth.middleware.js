const { API_KEYS, KEY_OWNERS } = require('../../config/api_keys');
const { AuthenticateError } = require('../../errors/general');

module.exports = (keyOwner = KEY_OWNERS.DEFAULT, keyProperty = 'SApiKey') => async (req, res, next) => {
  try {
    if (!API_KEYS[keyOwner]) {
      console.error(`keyOwner doesnt exist in api keys: ${keyOwner}`);
      throw new Error();
    }
    let apiKey;
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
    if (!apiKey || !API_KEYS[keyOwner].includes(apiKey)) {
      throw new Error();
    }

    req.apiKey = apiKey;
  } catch (exception) {
    return next(new AuthenticateError('Invalid api key'));
  }
  return next();
};
