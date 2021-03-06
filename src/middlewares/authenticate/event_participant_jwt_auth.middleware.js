const { AuthService, EventService, CompanyService } = require('../../services/app');
const { AuthenticateError } = require('../../errors/general');
const { INTEGRATION_ID_HEADER } = require('../../config');

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
    const { _id, eventId } = AuthService.verifyEventParticipantJwt(token);

    const event = await EventService.getOne({ _id: eventId, 'participants._id': _id }, {
      findOptions: { projection: '-participants.token' },
    });

    const participant = event.participants.find((part) => part._id);

    if (!participant) {
      throw new Error();
    }

    const integrationId = req.headers[INTEGRATION_ID_HEADER];

    if (integrationId || !CompanyService.isOriginWhiteListed(req.get('origin'))) {
      const companyId = CompanyService.getCompanyIdByIntegrationId(integrationId);

      if (companyId !== `${event.companyId}`) {
        return next(new AuthenticateError('Invalid integrationId', true));
      }
    }


    req.eventPartJwtToken = token;
    req.eventId = eventId;
    req.event = event;
    req.companyId = `${event.companyId}`;
    req.eventPartId = _id;
    req.eventPartRole = participant.role;
    req.eventParticipant = participant;

    return next();
  } catch (exception) {
    return next(new AuthenticateError('Invalid token', true));
  }
};
