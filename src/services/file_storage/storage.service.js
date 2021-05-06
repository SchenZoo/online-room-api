const AWS = require('aws-sdk');

const {
  AWS_BUCKET_NAME,
} = require('../../config');

class FileStorageService {
  constructor(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_REGION) {
    const creds = new AWS.Credentials(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY);
    this.s3 = new AWS.S3({ apiVersion: '2006-03-01', credentials: creds, region: AWS_BUCKET_REGION });
  }

  getSignedUrl(key, expireAfterSeconds = 24 * 3600, bucketName = AWS_BUCKET_NAME) {
    return this.s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: key,
      Expires: expireAfterSeconds,
    });
  }

  async uploadFile(key, body, mimeType, bucketName = AWS_BUCKET_NAME) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: mimeType,
    };
    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async removeFiles(fileKeys, bucketName = AWS_BUCKET_NAME) {
    if (!Array.isArray(fileKeys)) {
      fileKeys = [fileKeys];
    }
    return new Promise((resolve) => {
      this.s3.deleteObjects({
        Bucket: bucketName,
        Delete: {
          Objects: fileKeys.map((key) => ({ Key: key })),
        },
      })
        .send(() => {
          resolve();
        });
    });
  }
}

module.exports = {
  FileStorageService,
};
