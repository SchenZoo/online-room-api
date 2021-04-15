const { Encryptions } = require('../../common');
const { MANAGER_JWT_SECRET, USER_JWT_SECRET, EVENT_PARTICIPANT_JWT_SECRET } = require('../../config');

class AuthService {
  async signManagerJwt(managerId) {
    return Encryptions.signJWT({
      _id: managerId,
    }, MANAGER_JWT_SECRET);
  }

  verifyManagerJwt(token) {
    const { _id } = Encryptions.verifyJWT(token, MANAGER_JWT_SECRET);

    return {
      _id,
    };
  }

  async signUserJwt(userId, permissions, impersonatorId = undefined) {
    return Encryptions.signJWT({
      _id: userId,
      permissions,
      impersonatorId,
    }, USER_JWT_SECRET);
  }

  verifyUserJwt(token) {
    const { _id, permissions } = Encryptions.verifyJWT(token, USER_JWT_SECRET);

    return {
      _id,
      permissions,
    };
  }

  async signEventParticipantJwt(eventId, partId, role) {
    return Encryptions.signJWT({
      _id: partId,
      eventId,
      role,
    }, EVENT_PARTICIPANT_JWT_SECRET);
  }

  verifyEventParticipantJwt(token) {
    const { _id, eventId, role } = Encryptions.verifyJWT(token, EVENT_PARTICIPANT_JWT_SECRET);

    return {
      _id,
      eventId,
      role,
    };
  }
}


module.exports = {
  AuthService: new AuthService(),
};
