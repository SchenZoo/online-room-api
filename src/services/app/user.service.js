const { ModelService } = require('./model.service');
const { UserModel } = require('../../database/models');
const { Encryptions } = require('../../common');
const { BadBodyError, ConflictError, NotFoundError } = require('../../errors/general');
const { USER_PERMISSIONS, MANAGER_LOGGING_IN_PERMISSIONS } = require('../../constants/company/user/permissions');
const { AuthService } = require('./auth.service');

class UserService extends ModelService {
  constructor() {
    super(UserModel);
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

  /**
   *
   * @param {any} partialDocument
   * @param {'create'|'update'} operationType
   */
  async postSaveDocTransform(document) {
    if (document.password) {
      document.password = undefined;
    }
    return document;
  }

  async create(partialDocument) {
    const existingUser = await this.findOne({
      companyId: partialDocument.companyId,
      username: partialDocument.username,
    });

    if (existingUser) {
      throw new ConflictError('User with this username already exists', true);
    }

    partialDocument.isMain = false;

    const document = await super.create(partialDocument);

    document.password = undefined;

    return document;
  }

  async createMain(partialDocument) {
    const mainUser = await this.findOne({ companyId: partialDocument.companyId, isMain: true });

    if (mainUser) {
      throw new ConflictError('Main user already exists', true);
    }

    partialDocument.isMain = true;
    partialDocument.permissions = Object.values(USER_PERMISSIONS);

    return super.create(partialDocument);
  }


  async loginUsingCredentials(username, password) {
    const user = await this.findOne({ username }).select('+password +permissions');
    if (!user) {
      throw new BadBodyError('Invalid username/password!');
    }
    const passwordMatches = await this.checkPassword(password, user.password);
    if (!passwordMatches) {
      throw new BadBodyError('Invalid username/password!');
    }
    return this.getUserAuthData(user);
  }

  async getUserAuthData(user, limitedPermissions, impersonatorId = undefined) {
    if (!user.permissions) {
      console.error('Calling getUserAuthData without loaded permissions');
      throw new BadBodyError('User has no permissions!');
    }

    const requestedPermissions = limitedPermissions && Array.isArray(limitedPermissions)
      ? user.permissions.filter((perm) => limitedPermissions.includes(perm))
      : user.permissions;

    const token = await AuthService.signUserJwt(user._id, requestedPermissions, impersonatorId);

    const { password, permissions, ...userRest } = user.toObject();
    return {
      token,
      user: userRest,
    };
  }

  async loginUsingManager(id, managerId) {
    if (!managerId) {
      throw new BadBodyError('Invalid managerId', true);
    }

    const user = await this.findOne({ companyId: id, isMain: true }, '+permissions');

    if (!user) {
      throw new NotFoundError('Company user not found!', true);
    }

    return this.getUserAuthData(user, MANAGER_LOGGING_IN_PERMISSIONS, managerId);
  }

  async hashPassword(password) {
    return Encryptions.hashPassword(password);
  }

  async checkPassword(passwordPlain, passwordEncrypted) {
    return Encryptions.checkPassword(passwordPlain, passwordEncrypted);
  }
}


module.exports = {
  UserService: new UserService(),
};
