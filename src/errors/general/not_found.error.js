class NotFoundError extends Error {
  constructor(message, isFatal = false) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 404;
    this.isFatal = isFatal;
  }
}

module.exports = {
  NotFoundError,
};
