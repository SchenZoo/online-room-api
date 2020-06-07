const jwt = require('jsonwebtoken');
const { UserModel } = require('../../database/models');
const { AuthenticateError } = require('../../errors/general');

module.exports = () => async (req, res, next) => {
  try {
    let token;
    try {
      const [authName, authInfo] = req.headers.authorization.split(' ');
      if (authName === 'Bearer') {
        token = authInfo;
      }
      if (!token) {
        throw new Error();
      }
    } catch (e) {
      return next(new AuthenticateError('Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN|API_KEY}". For jwt authorization use Bearer type'));
    }
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(_id);
    if (user) {
      req.user = user;
    } else {
      throw new Error();
    }
  } catch (exception) {
    return next(new AuthenticateError('Invalid token'));
  }
  return next();
};
