const { AuthorizeError } = require('../../errors/general');

module.exports = (requestedPermission) => (req, res, next) => {
  const { permissions } = req;

  if (!requestedPermission) {
    console.error('Calling hasPermissions without requestedPermission argument');
    return next(new AuthorizeError('Permissions not loaded', true));
  }

  if (!permissions) {
    console.error('Calling hasPermissions without loading permissions array');
    return next(new AuthorizeError('Permissions not loaded', true));
  }

  if (!Array.isArray(permissions)) {
    console.error('Calling hasPermissions with permissions not being array', permissions);
    return next(new AuthorizeError('Permissions not loaded', true));
  }

  if (!permissions.includes(requestedPermission)) {
    return next(new AuthorizeError('You dont have requested permissions to access this resource', true));
  }

  return next();
};
