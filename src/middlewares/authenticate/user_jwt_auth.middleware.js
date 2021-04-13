const { UserService } = require('../../services/app');
const { Encryptions } = require('../../common');
const { AuthenticateError } = require('../../errors/general');
const { USER_JWT_SECRET } = require('../../config');

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
      // :TODO check if already called
    } catch (e) {
      return next(new AuthenticateError('Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN|API_KEY}". For jwt authorization use Bearer type', false));
    }
    const { _id, permissions } = Encryptions.verifyJWT(token, USER_JWT_SECRET);
    const user = await UserService.findOne({ _id });
    if (user) {
      req.user = user;
      req.permissions = permissions;
      req.userId = `${user._id}`;
      req.companyId = `${user.companyId}`;
      // TODO save token is verified
    } else {
      throw new Error();
    }
  } catch (exception) {
    return next(new AuthenticateError('Invalid token', true));
  }
  return next();
};
