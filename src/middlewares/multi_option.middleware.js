/**
 *
 * @param {Array<(req?,res?,next?)=>{}|Array<(req?,res?,next?)=>{}>>} middlewareOptions
 * @param {string} failMessage message that should be shown to hide existing error message
 * @param {number} failStatusCode status code that should be shown to hide existing error code
 */
function multiChoiceMiddleware(middlewareOptions, failMessage, failStatusCode) {
  return async (req, res, next) => {
    let middlewaresPassed = false;
    let index = 0;
    let latestError;
    while (!middlewaresPassed && index < middlewareOptions.length) {
      try {
        const currentCheckingMiddleware = middlewareOptions[index];
        // All middlewares in array should resolve to pass
        if (Array.isArray(currentCheckingMiddleware)) {
          // must be serial as middlewares can depend one on another
          for (let nestedMiddlewareIndex = 0; nestedMiddlewareIndex < currentCheckingMiddleware.length; nestedMiddlewareIndex++) {
            const middleware = currentCheckingMiddleware[nestedMiddlewareIndex];
            await promisifyMiddleware(req, res, middleware);
          }
        } else {
          await promisifyMiddleware(req, res, currentCheckingMiddleware);
        }
        middlewaresPassed = true;
      } catch (err) {
        // middleware threw error, just continue finding successfull one
        latestError = err;
        if (err.isFatal) {
          break;
        }
      }
      index++;
    }
    if (middlewaresPassed) {
      return next();
    }
    if (failMessage) {
      latestError = new Error(failMessage);
    }
    if (failStatusCode) {
      latestError.statusCode = failStatusCode;
    }
    next(latestError);
  };
}

async function promisifyMiddleware(req, res, middleware) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise((resolve, reject) => {
    middleware(req, res, (error) => {
      if (!error) {
        return resolve();
      }
      return reject(error);
    });
  });
}

module.exports = multiChoiceMiddleware;
