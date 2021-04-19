const set = require('lodash.set');
const get = require('lodash.get');
/**
 *
 * @param {any} object object to get props from
 * @param {Array} props array of props you want to get
 * @param {boolean} removeUndefined
 */
function pick(object, props = [], removeUndefined = true) {
  if (!object) {
    return object;
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

function shallowPick(object, props = [], removeUndefined = true) {
  if (!object) {
    return object;
  }
  object = object.toObject ? object.toObject() : object;
  const objectWithSentProps = {};
  props.forEach((prop) => {
    if (!removeUndefined || get(object, prop) !== undefined) {
      if (object[prop]) {
        objectWithSentProps[prop] = object[prop];
      }
    }
  });
  return objectWithSentProps;
}

/**
 *
 * @param {any} object object to remove props from
 * @param {Array} unwantedProps  array of props you want to remove
 * @returns New Object with removed props
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
  if (Array.isArray(updateBody)) {
    if (JSON.stringify(mainObject) !== JSON.stringify(updateBody)) {
      return JSON.parse(JSON.stringify(updateBody));
    }
    return mergedObject;
  }
  Object.entries(updateBody).forEach(([updatingProp, updatingPropValue]) => {
    if (updatingPropValue && mergedObject[updatingProp] && typeof updatingPropValue === 'object' && typeof mergedObject[updatingProp] === 'object') {
      mergedObject[updatingProp] = updateObject(mergedObject[updatingProp], updatingPropValue, directly);
    } else {
      mergedObject[updatingProp] = updatingPropValue;
    }
  });
  return mergedObject;
}

function removeUndefinedProps(object) {
  const unwantedProps = [];
  Object.keys(object).forEach((key) => {
    if (!object[key]) {
      unwantedProps.push(key);
    }
  });
  return removeProps(object, unwantedProps);
}

function toPlainObject(object) {
  if (object === undefined) { return object; }
  return JSON.parse(JSON.stringify(object.toObject ? object.toObject() : object));
}

function getObjectPropertyPaths(object, initialPath = '') {
  if (!object || typeof object !== 'object') {
    return (initialPath) ? [initialPath] : [];
  }

  const prefix = initialPath ? `${initialPath}.` : '';
  return Object.entries({ ...object }).reduce((acc, [key, value]) => [...acc, ...getObjectPropertyPaths(value, `${prefix}${key}`)], []);
}

function sortObjectByKey(object) {
  if (!object || typeof object !== 'object' || Array.isArray(object)) { return object; }

  return Object.entries(object)
    .sort(([key1], [key2]) => (`${key1}`).localeCompare(`${key2}`, 'en'))
    .reduce((sortedObject, [key, value]) => ({ ...sortedObject, [key]: sortObjectByKey(value) }), {});
}

module.exports = {
  pick,
  removeProps,
  updateObject,
  removeUndefinedProps,
  toPlainObject,
  shallowPick,
  getObjectPropertyPaths,
  sortObjectByKey,
};
