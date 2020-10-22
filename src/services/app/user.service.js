const { ModelService } = require('./model.service');
const { UserModel } = require('../../database/models');
const { Encryptions } = require('../../common');
const { NotFoundError, BadBodyError } = require('../../errors/general');


class UserService extends ModelService {
  constructor() {
    super(UserModel);
  }

  /**
   *
   * @param {any} partialDocument
   * @param {'create'|'update'} operationType
   */
  async partialDocumentTransformation(partialDocument) {
    if (partialDocument.password) {
      partialDocument.password = await this.hashPassword(partialDocument.password);
    }
    return partialDocument;
  }


  async loginUsingCredentials(username, password) {
    const user = await this.findOne({ username }).select('+password');
    if (!user) {
      throw new NotFoundError('User not found!');
    }
    const passwordMatches = await this.checkPassword(password, user.password);
    if (!passwordMatches) {
      throw new BadBodyError('Invalid username/password!');
    }
    {
      const payload = { _id: user._id };
      const token = Encryptions.signJWT(payload, process.env.JWT_SECRET);
      const { password, ...userRest } = user.toObject();
      return {
        token,
        user: userRest,
      };
    }
  }


  async loginUsingRoomToken(token) {
    const { roomService } = require('.');
    const { room, participant } = await roomService.findParticipantByToken(token);
    const user = await this.findOne({ _id: participant.user._id });
    if (!user) {
      throw new NotFoundError('User not found!');
    }
    const jwtToken = this.signJWT(user._id);
    return {
      participant,
      token: jwtToken,
      roomId: room._id,
      isHost: `${room.host.user._id}` === `${user._id}`,
    };
  }

  async hashPassword(password) {
    return Encryptions.hashPassword(password);
  }

  async checkPassword(passwordPlain, passwordEncrypted) {
    return Encryptions.checkPassword(passwordPlain, passwordEncrypted);
  }

  signJWT(userId) {
    return Encryptions.signJWT({
      _id: userId,
    }, process.env.JWT_SECRET);
  }
}


module.exports = {
  UserService,
};
