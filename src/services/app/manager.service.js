const { ModelService } = require('./model.service');
const { MangerModel } = require('../../database/models');
const { Encryptions } = require('../../common');
const { NotFoundError, BadBodyError } = require('../../errors/general');
const { MANAGER_JWT_SECRET } = require('../../config');


class ManagerService extends ModelService {
  constructor() {
    super(MangerModel);
  }

  /**
   *
   * @param {any} partialDocument
   * @param {'create'|'update'} operationType
   */
  async preSaveDocTransform(partialDocument) {
    if (partialDocument.password) {
      partialDocument.password = await this.hashPassword(partialDocument.password);
    }
    return partialDocument;
  }


  async loginUsingCredentials(username, password) {
    const manager = await this.findOne({ username }).select('+password');
    if (!manager) {
      throw new NotFoundError('User not found!');
    }
    const passwordMatches = await this.checkPassword(password, manager.password);
    if (!passwordMatches) {
      throw new BadBodyError('Invalid username/password!');
    }
    {
      const token = await this.signJWT(manager._id);
      const { password, ...managerRest } = manager.toObject();
      return {
        token,
        manager: managerRest,
      };
    }
  }

  async hashPassword(password) {
    return Encryptions.hashPassword(password);
  }

  async checkPassword(passwordPlain, passwordEncrypted) {
    return Encryptions.checkPassword(passwordPlain, passwordEncrypted);
  }

  async signJWT(managerId) {
    return Encryptions.signJWT({
      _id: managerId,
    }, MANAGER_JWT_SECRET);
  }
}


module.exports = {
  ManagerService: new ManagerService(),
};
