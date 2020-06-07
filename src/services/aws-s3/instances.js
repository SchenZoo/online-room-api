const S3 = require('aws-sdk/clients/s3');
const { AWS_CONFIG } = require('../../config/aws-s3');

const s3DefaultClient = new S3(AWS_CONFIG);

module.exports = {
  s3DefaultClient,
};
