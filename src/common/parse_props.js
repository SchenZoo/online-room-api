/**
 *
 * @param {any} object object to get props from
 * @param {Array} props array of props you want to get
 */
function getProps(object, props) {
  if (!object) {
    console.warn('Empty getProps was called');
    return {};
  }
  object = object.toObject ? object.toObject() : object;
  const objectWithSentProps = {};
  props.forEach((prop) => {
    if (object[prop] !== undefined) {
      objectWithSentProps[prop] = object[prop];
    }
  });
  return objectWithSentProps;
}

/**
 *
 * @param {any} object object to remove props from
 * @param {Array} unwantedProps  array of props you want to remove
 */
function removeProps(object, unwantedProps) {
  if (!object) {
    console.warn('Empty removeProps was called');
    return {};
  }
  object = object.toObject ? object.toObject() : object;
  const objectWithoutUnwanted = {};
  Object.keys(object).forEach((prop) => {
    if (!unwantedProps.includes(prop)) {
      objectWithoutUnwanted[prop] = object[prop];
    }
  });
  return objectWithoutUnwanted;
}

module.exports = {
  getProps,
  removeProps,
};
