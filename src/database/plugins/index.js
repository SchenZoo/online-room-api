const { autopopulateFields } = require('./autopopulate.plugin');
const { addForbiddenFields } = require('./projection.plugin');
const { addRelationFields } = require('./relation.plugin');
const { addSearchableFields } = require('./searchable.plugin');
const { addSignedUrlPlugin } = require('./signed_url.plugin');
const { addSortableFields } = require('./sortable.plugin');


module.exports = {
  autopopulateFields,
  addForbiddenFields,
  addRelationFields,
  addSearchableFields,
  addSignedUrlPlugin,
  addSortableFields,
};
