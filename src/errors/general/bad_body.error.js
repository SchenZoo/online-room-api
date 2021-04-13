class BadBodyError extends Error {
  constructor(message, isFatal = false) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 400;
    this.isFatal = isFatal;
  }
}

module.exports = {
  BadBodyError,
};
