const { AuthService, UserService } = require('../../services/app');
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
      if (req.userJwtToken === token) {
        return next();
      }
    } catch (e) {
      return next(new AuthenticateError('Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN}". For jwt authorization use Bearer type', false));
    }
    const { _id, permissions } = AuthService.verifyUserJwt(token);

    const user = await UserService.getOne({ _id });

    if (!permissions.every((perm) => user.permissions.includes(perm))) {
      return next(new AuthenticateError('Permissions changed!', true, 1010));
    }

    req.userJwtToken = token;
    req.user = user;
    req.permissions = permissions;
    req.userId = _id;
    req.companyId = `${user.companyId}`;

    return next();
  } catch (exception) {
    return next(new AuthenticateError('Invalid token', true));
  }
};
