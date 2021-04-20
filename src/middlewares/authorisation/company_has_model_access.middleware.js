// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const get = require('lodash.get');
const { AuthorizeError, NotFoundError } = require('../../errors/general');

/**
 * @description Checks if requester(company) has access to specific model, it has access if model has same companyId
 *
 * @param {mongoose.Model} Model Model to search for company
 * @param {string} modelIdPropertyPath Property where modelId is stored in request object
 * @param {string} requestSaveInProperty Property where model will be stored in request object if it isnt already sent
 * @param {mongoose.QueryFindBaseOptions} findOptions Additional options when querying document
 *
 */
function companyHasModelAccessMiddleware(Model, modelIdPropertyPath, requestSaveInProperty = 'data', findOptions = {}) {
  return async (req, res, next) => {
    const { companyId } = req;
    const modelId = get(req, modelIdPropertyPath);

    try {
      if (!modelId) {
        throw new AuthorizeError(`modelId couldnt be find on given request path "${modelId}"`);
      }
      if (!companyId) {
        throw new AuthorizeError('req.companyId must be initialized before calling companyHasModelAccessMiddleware');
      }
      let modelInstance = null;
      // If property is already saved just check if it fits
      if (req[requestSaveInProperty]) {
        modelInstance = req[requestSaveInProperty];
      } else {
        modelInstance = await Model.findById(modelId, undefined, findOptions);
      }
      if (!modelInstance) {
        throw new NotFoundError(`Model instance not found, Searching path was ${modelIdPropertyPath}`, true);
      }

      if (`${modelInstance.companyId}` !== `${companyId}`) {
        throw new AuthorizeError(`${modelIdPropertyPath} doesnt belog to given company ${companyId}`, true);
      }
      req[requestSaveInProperty] = modelInstance;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = companyHasModelAccessMiddleware;
