/**
 *
 * @param {Array<string>} fields
 */
function addSearchableFields(fields) {
  return (schema) => {
    if (!fields) {
      console.error(`addSearchableFields: fields are ${fields}`);
      return;
    }
    const validSearchablePaths = [];
    fields.forEach((pathName) => {
      const schemaType = schema.path(pathName);
      if (!schemaType) {
        console.warn('addSearchableFields: WARNING', `Path '${pathName}' is invalid`);
        return;
      }
      validSearchablePaths.push(pathName);
      schema.index({ [pathName]: 1 });
    });
    if (!schema.options.searchProps) {
      schema.options.searchProps = validSearchablePaths;
    }
  };
}
module.exports = { addSearchableFields };
