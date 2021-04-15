const { AuthService, ManagerService } = require('../../services/app');
const { AuthenticateError } = require('../../errors/general');

module.exports = () => async (req, res, next) => {
  try {
    let token;
    try {
      const [authName, authInfo] = req.headers.authorization.split(' ');
      if (authName === 'MBearer') {
        token = authInfo;
      }
      if (!token) {
        throw new Error();
      }
      if (req.managerJwtToken === token) {
        return next();
      }
    } catch (e) {
      return next(new AuthenticateError('Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN}". For manager jwt authorization use MBearer type', false));
    }
    const { _id } = AuthService.verifyManagerJwt(token);

    const manager = await ManagerService.getOne({ _id });

    req.managerJwtToken = token;
    req.manager = manager;
    req.managerId = _id;

    return next();
  } catch (exception) {
    return next(new AuthenticateError('Invalid token', true));
  }
};
