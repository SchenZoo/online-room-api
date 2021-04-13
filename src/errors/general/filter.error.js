class FilterError extends Error {
  constructor(message, statusCode = 400, isFatal = false) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = statusCode;
    this.isFatal = isFatal;
  }
}

module.exports = {
  FilterError,
};
