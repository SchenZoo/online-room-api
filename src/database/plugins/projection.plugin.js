/**
 * Adds forbidden fields to schema options as 'forbiddenProps'
 * @param {Array<string> | string} fields
 * @param {{exclude?: boolean}} options exclude = true, excludes fields from forbidden list (all other fields that are not in 'fields' are forbidden)
 */
function addForbiddenFields(fields, options = {}) {
  const { exclude } = options;
  return (schema) => {
    if (!fields) {
      console.error(`addForbiddenFields: fields are ${fields}`);
      return;
    }
    const validForbiddenPaths = [];
    const schemaPaths = Object.keys(schema.paths);
    if (typeof fields === 'string') {
      fields = fields.split(' ');
    }
    fields.forEach((pathName) => {
      const schemaType = schema.path(pathName) || schema.virtualpath(pathName);
      if (!schemaType) {
        console.warn('addForbiddenFields: WARNING:', `Path '${pathName} is invalid'`);
        return;
      }
      if (!exclude) {
        validForbiddenPaths.push(pathName);
      } else {
        schemaPaths.splice(schemaPaths.indexOf(pathName), 1);
      }
    });
    if (!schema.options.forbiddenProps) {
      schema.options.forbiddenProps = (exclude) ? schemaPaths : validForbiddenPaths;
    }
  };
}
module.exports = { addForbiddenFields };
