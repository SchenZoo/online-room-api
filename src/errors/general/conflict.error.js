class ConflictError extends Error {
  constructor(message, isFatal = false) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 409;
    this.isFatal = isFatal;
  }
}

module.exports = {
  ConflictError,
};
