class AuthenticateError extends Error {
  constructor(message, isFatal = false, code) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 401;
    this.isFatal = isFatal;
    this.code = code;
  }
}

module.exports = {
  AuthenticateError,
};
