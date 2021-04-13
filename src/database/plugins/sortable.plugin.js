/**
 *
 * @param {Array<string>} fields
 */
function addSortableFields(fields) {
  return (schema) => {
    if (!fields) {
      console.error(`addSortableFields: fields are ${fields}`);
      return;
    }
    const validSortablePaths = [];
    fields.forEach((pathName) => {
      const schemaType = schema.path(pathName);
      if (!schemaType) {
        console.warn('addSortableFields: WARNING:', `Path '${pathName} is invalid'`);
        return;
      }
      validSortablePaths.push(pathName);
      schema.index({ [pathName]: 1 });
    });
    if (!schema.options.sortProps) {
      schema.options.sortProps = validSortablePaths;
    }
  };
}
module.exports = { addSortableFields };
