class OnlineUser {
  constructor(id, missedAcks = 0, connectedAt = new Date(), disconnectedAt = null) {
    this.id = id;
    this.missedAcks = missedAcks;
    this.connectedAt = connectedAt;
    this.disconnectedAt = disconnectedAt;
  }
}


class OnlineTrackingService {
  /**
     *
     * @param {(user:OnlineUser)=>any} connectUser
     * @param {(user:OnlineUser)=>any} disconnectUser
     * @param {(userId:string)=>any} pingUser
     * @param {{
     *    pingInterval?: number,
     *    responseTimeout?: number,
     *    maxPingTries?: number
     * }} options
     */
  constructor(connectUser, disconnectUser, pingUser, options = {}) {
    const { pingInterval = 10000, responseTimeout = 5000, maxPingTries = 5 } = options;
    this.pingInterval = pingInterval;
    this.responseTimeout = responseTimeout;
    this.maxPingTries = maxPingTries;
    this.pingUser = pingUser;
    this.connectUser = connectUser;
    this.disconnectUser = disconnectUser;
    this._onlineUsers = {};
    this._notAcknowledgedUserIds = [];
    this._finishedPinging = true;
    setInterval(() => this._pingActiveUsers(),
      pingInterval);
  }

  /**
   *
   * @param {string} identifier
   *
   * @returns {OnlineUser}
   */
  getUser(identifier) {
    return this._onlineUsers[identifier];
  }

  /**
   * @returns {Array<string>}
   */
  getOnlineUserIds() {
    return Object.keys(this._onlineUsers);
  }

  /**
   * @returns {Array<OnlineUser>}
   */
  getOnlineUsers() {
    return Object.values(this._onlineUsers);
  }


  /**
   *
   * @param {string} identifier
   */
  onConnect(identifier) {
    let user = this.getUser(identifier);
    if (!user) {
      user = this._addNewUser(identifier);
    }
    this.onUserAcknowledge(identifier);
    this.connectUser(user);
  }

  /**
   *
   * @param {string} identifier
   */
  onUserAcknowledge(identifier) {
    this._notAcknowledgedUserIds = this._notAcknowledgedUserIds.filter((userId) => identifier !== userId);
    const user = this.getUser(identifier);
    if (user) {
      user.missedAcks = 0;
      user.disconnectedAt = null;
    }
  }

  /**
   *
   * @param {string} identifier
   */
  forceUserDisconnect(identifier) {
    const user = this.getUser(identifier);

    delete this._onlineUsers[identifier];

    if (user) {
      if (!user.disconnectedAt) {
        user.disconnectedAt = new Date();
      }

      this.disconnectUser(user);
    }
  }

  _pingActiveUsers() {
    if (!this._finishedPinging) {
      return;
    }
    const userIds = this.getOnlineUserIds();

    userIds.forEach((userId) => {
      this.pingUser(userId);
    });

    this._notAcknowledgedUserIds = userIds;

    setTimeout(() => this._trackNotRespondingUsers(),
      this.responseTimeout);
  }

  _trackNotRespondingUsers() {
    this._notAcknowledgedUserIds.forEach((userId) => {
      const user = this.getUser(userId);
      if (user) {
        if (!user.missedAcks) {
          user.disconnectedAt = new Date();
        }
        user.missedAcks++;
        if (user.missedAcks >= this.maxPingTries) {
          this.forceUserDisconnect(userId);
        }
      }
    });

    this._finishedPinging = true;
  }


  /**
   *
   * @param {string} identifier
   *
   * @returns {OnlineUser | undefined}
   */
  _addNewUser(identifier) {
    const user = new OnlineUser(
      identifier
    );

    this._onlineUsers[identifier] = user;

    return user;
  }
}

module.exports = {
  OnlineTrackingService,
  OnlineUser,
};
