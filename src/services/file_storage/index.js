const { FileStorageService } = require('./storage.service');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_REGION } = require('../../config');

module.exports = {
  DefaultS3Service: new FileStorageService(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_REGION),
};
