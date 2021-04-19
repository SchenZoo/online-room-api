const { AuthService, EventService } = require('../../services/app');
const { AuthenticateError } = require('../../errors/general');

module.exports = () => async (req, res, next) => {
  try {
    let token;
    try {
      const [authName, authInfo] = req.headers.authorization.split(' ');
      if (authName === 'PBearer') {
        token = authInfo;
      }
      if (!token) {
        throw new Error();
      }
      if (req.eventPartJwtToken === token) {
        return next();
      }
    } catch (e) {
      return next(new AuthenticateError('Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN}". For event participant jwt type use PBearer type', false));
    }
    const { _id, eventId, role } = AuthService.verifyEventParticipantJwt(token);

    const event = await EventService.getOne({ _id: eventId, 'participants._id': _id }, {
      findOptions: { projection: '-participants.token' },
    });

    const participant = event.participants.find((part) => part._id);

    if (!participant) {
      throw new Error();
    }

    req.eventPartJwtToken = token;
    req.eventId = eventId;
    req.event = event;
    req.companyId = `${event.companyId}`;
    req.eventPartId = _id;
    req.eventPartRole = role;
    req.eventParticipant = participant;

    return next();
  } catch (exception) {
    return next(new AuthenticateError('Invalid token', true));
  }
};
