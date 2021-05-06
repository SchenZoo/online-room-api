const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
} = process.env;

if (
  !AWS_ACCESS_KEY_ID
    || !AWS_SECRET_ACCESS_KEY
    || !AWS_BUCKET_NAME
    || !AWS_BUCKET_REGION) {
  console.error('AWS S3 environment variables are missing!');
}


const AWS_CONFIG = {
  bucketName: AWS_BUCKET_NAME,
  region: AWS_BUCKET_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
};


module.exports = {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_CONFIG,
};
