const localFilesUploadMiddleware = require('./local_files.middleware');
const s3fileUploadMiddleware = require('./s3_files.middleware');

module.exports = {
  s3fileUploadMiddleware,
  localFilesUploadMiddleware,
};
