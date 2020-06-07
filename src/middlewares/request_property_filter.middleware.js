const get = require('lodash.get');

/**
 *
 * @param {string} requestPropertyName name of the property in request object
 * @param {any|any[]} propertyValue wanted property value
 * @param {{multiValues:boolean,failStatus:number,message:string}} options multiValues = if sending array with multiple options, failStatus = status if filtering fail, message = message if filtering fail
 */
function requestPropertyFilterMiddleware(requestPropertyName, propertyValue, options = {}) {
  return (req, res, next) => {
    const { multiValues = false, failStatus = 400, message = "Model property doesn't match wanted values" } = options;
    const property = get(req, requestPropertyName);
    if (multiValues) {
      if (!Array.isArray(propertyValue)) {
        console.error('requestPropertyFilterMiddleware when using multiValues, propertyValue must be array');
        return next();
      }
      if (propertyValue.some((possibleProperty) => checkIfObjectsEqual(possibleProperty, property))) {
        return next();
      }
    } else if (checkIfObjectsEqual(propertyValue, property)) {
      return next();
    }
    return res.status(failStatus).json({
      message,
    });
  };
}

function checkIfObjectsEqual(object1, object2) {
  return JSON.stringify(object1) === JSON.stringify(object2);
}


module.exports = requestPropertyFilterMiddleware;
