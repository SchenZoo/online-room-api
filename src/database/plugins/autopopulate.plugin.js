/**
 *
 * @param {Array<String>} populateFields schema fields to be populated
 */
function autopopulateFields(populateFields) {
  const hooks = ['find', 'findOne', 'findOneAndUpdate'];
  return (schema) => {
    if (!populateFields) {
      console.error(`addPreHookPopulateFields: populateFields are ${populateFields}`);
      return;
    }
    if (!Array.isArray(populateFields)) {
      populateFields = [populateFields];
    }

    hooks.forEach((preHookName) => {
      schema.pre(preHookName, function () {
        this.populate(populateFields.filter((pathName) => schema.path(pathName) || schema.virtualpath(pathName)));
      });
    });
  };
}

module.exports = { autopopulateFields };
