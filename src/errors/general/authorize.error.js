class AuthorizeError extends Error {
  constructor(message, isFatal = false) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 403;
    this.isFatal = isFatal;
  }
}

module.exports = {
  AuthorizeError,
};
