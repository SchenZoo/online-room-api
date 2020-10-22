const get = require('lodash.get');
const set = require('lodash.set');

const { ObjectTransforms } = require('../../common');

/**
 *
 * @param {string[]} propList list of properties
 * @param {'removeSentProps'|'keepSentProps'} mode keepSentProps will keep only sent props, removeSentProps will remove only sent props
 * @param {string} requestPropertyPath path to property to modify in request
 * @param {boolean} removeUndefined dont add if property is undefined
 */
function mapRequestPropMiddleware(propList = [], mode = 'removeSentProps', requestPropertyPath = 'body', removeUndefined = true) {
  return (req, res, next) => {
    const modifingProp = get(req, requestPropertyPath);
    switch (mode) {
      case 'keepSentProps': {
        set(req, requestPropertyPath, ObjectTransforms.getProps(modifingProp, propList, removeUndefined));
        break;
      }
      case 'removeSentProps': {
        set(req, requestPropertyPath, ObjectTransforms.removeProps(modifingProp, propList));
        break;
      }
    }
    next();
  };
}

module.exports = mapRequestPropMiddleware;
