/**
 *
 * @param {Array<string>} fields
 */
function addRelationFields(fields) {
  return (schema) => {
    if (!fields) {
      console.error(`addRelationFields: fields are ${fields}`);
      return;
    }
    const validRelationFields = [];
    fields.forEach((pathName) => {
      const schemaType = schema.path(pathName) || schema.virtualpath(pathName);
      if (!schemaType) {
        console.warn('addRelationFields: WARNING', `Path '${pathName}' is invalid`);
        return;
      }
      validRelationFields.push(pathName);
    });
    if (!schema.options.relationProps) {
      schema.options.relationProps = validRelationFields;
    }
  };
}
module.exports = { addRelationFields };
