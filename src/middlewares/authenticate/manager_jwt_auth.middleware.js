const { ManagerService } = require('../../services/app');
const { Encryptions } = require('../../common');
const { AuthenticateError } = require('../../errors/general');
const { MANAGER_JWT_SECRET } = require('../../config');

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
    } catch (e) {
      return next(new AuthenticateError('Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN|API_KEY}". For manager jwt authorization use MBearer type', false));
    }
    const { _id } = Encryptions.verifyJWT(token, MANAGER_JWT_SECRET);
    const manager = await ManagerService.findOne({ _id });
    if (manager) {
      req.manager = manager;
      req.managerId = `${manager._id}`;
    } else {
      throw new Error();
    }
  } catch (exception) {
    return next(new AuthenticateError('Invalid token', true));
  }
  return next();
};
