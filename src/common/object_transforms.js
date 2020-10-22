const set = require('lodash.set');
const get = require('lodash.get');

/**
 *
 * @param {any} object object to get props from
 * @param {Array} props array of props you want to get
 * @param {boolean} removeUndefined
 */
function getProps(object, props = [], removeUndefined = true) {
  if (!object) {
    console.warn('Empty getProps was called');
    return {};
  }
  object = object.toObject ? object.toObject() : object;
  const objectWithSentProps = {};
  props.forEach((prop) => {
    if (!removeUndefined || get(object, prop) !== undefined) {
      set(objectWithSentProps, prop, get(object, prop));
    }
  });
  return objectWithSentProps;
}

/**
 *
 * @param {any} object object to remove props from
 * @param {Array} unwantedProps  array of props you want to remove
 */
function removeProps(object, unwantedProps = []) {
  if (!object) {
    console.warn('Empty removeProps was called');
    return {};
  }
  object = object.toObject ? object.toObject() : object;
  const objectWithoutUnwanted = JSON.parse(JSON.stringify(object));
  unwantedProps.forEach((prop) => {
    if (get(objectWithoutUnwanted, prop) !== undefined) {
      set(objectWithoutUnwanted, prop, undefined);
    }
  });
  return JSON.parse(JSON.stringify(objectWithoutUnwanted));
}

/**
 *
 * @param {any} mainObject main object
 * @param {any} updateBody  object with props to update
 * @param {boolean} directly if updates should be directly on mainObject or to create another one using JSON copy
 */
function updateObject(mainObject = {}, updateBody = {}, directly = false) {
  const mergedObject = directly ? mainObject : JSON.parse(JSON.stringify(mainObject));
  Object.entries(updateBody).forEach(([updatingProp, updatingPropValue]) => {
    if (updatingPropValue && mergedObject[updatingProp] && typeof updatingPropValue === 'object' && typeof mergedObject[updatingProp] === 'object') {
      mergedObject[updatingProp] = updateObject(mergedObject[updatingProp], updatingPropValue);
    } else {
      mergedObject[updatingProp] = updatingPropValue;
    }
  });
  return mergedObject;
}

module.exports = {
  getProps,
  removeProps,
  updateObject,
};
