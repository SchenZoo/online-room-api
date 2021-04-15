const { AuthorizeError } = require('../../errors/general');

module.exports = (role) => (req, res, next) => {
  const { eventPartRole } = req;

  if (!role) {
    console.error('Calling hasEventParticipantRole without role argument');
    return next(new AuthorizeError('Roles not loaded', true));
  }

  if (!eventPartRole) {
    console.error('Calling hasEventParticipantRole without loading eventPartRole');
    return next(new AuthorizeError('Roles not loaded', true));
  }

  if (eventPartRole !== role) {
    return next(new AuthorizeError('You dont have requested role to access this resource', true));
  }

  return next();
};
