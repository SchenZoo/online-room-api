const fs = require('fs');

const { s3DefaultClient } = require('../services/aws_s3');
const { AWS_BUCKET_NAME } = require('../config/aws_s3');


/**
 *
 * @param {(req,res,next)=>{}} requestHandler
 * @param {{s3BucketName?:string,isLocal?:boolean}|undefined} fileOptions
 */
const asyncMiddleware = (requestHandler, fileOptions) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => {
    if (!fileOptions || typeof fileOptions !== 'object') {
      return next(err);
    }
    const { isLocal, s3BucketName } = fileOptions;
    const { files, file } = req;
    const forDelete = [];
    let fileProp = 'key';
    if (isLocal) {
      fileProp = 'path';
    }
    if (file && file[fileProp]) {
      forDelete.push(file[fileProp]);
    }
    if (files) {
      if (Array.isArray(files)) {
        files.forEach((file) => {
          if (file[fileProp]) {
            forDelete.push(file[fileProp]);
          }
        });
      } else if (typeof files === 'object') {
        Object.values(files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (file[fileProp]) {
              forDelete.push(file[fileProp]);
            }
          });
        });
      }
    }
    if (isLocal) {
      forDelete.forEach((file) => {
        fs.unlink(file, () => {});
      });
    } else {
      s3DefaultClient.deleteObjects({
        Bucket: s3BucketName || AWS_BUCKET_NAME,
        Delete: {
          Objects: forDelete.map((key) => ({ Key: key })),
        },
      });
    }

    next(err);
  });
};

module.exports = asyncMiddleware;
