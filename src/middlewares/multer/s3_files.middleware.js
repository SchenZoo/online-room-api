const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { Randoms } = require('../../common');
const { AWS_BUCKET_NAME } = require('../../config/aws_s3');
const { s3DefaultClient } = require('../../services/aws_s3');
const {
  DEFAULT_CACHE_SECONDS,
  DEFAULT_FILE_LIMIT_SIZE,
  DEFAULT_FILE_PATH,
  DEFAULT_FILE_LIMIT,
  DEFAULT_FILE_PROPERTY,
} = require('../../constants/multer/defaults');


/**
 * @param {{
    bucketName?:string,
    getFilePath?:(fileName:string)=>string,
    multi?:boolean,
    fileLimit?:number,
    fileProp?:string,
    fileSizeLimit?:number,
  }} options
 */
const s3fileUploadMiddleware = (options = {}) => {
  const {
    bucketName, getFilePath = () => null, multi, fileLimit, fileProp, fileSizeLimit,
  } = options;
  const multerInstance = multer({
    limits: fileSizeLimit || DEFAULT_FILE_LIMIT_SIZE,
    storage: multerS3({
      s3: s3DefaultClient,
      bucket: bucketName || AWS_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      cacheControl: `max-age=${DEFAULT_CACHE_SECONDS}`,
      key(req, file, cb) {
        const fileName = Randoms.getRandomString();
        const ext = path.extname(file.originalname);
        const newFileName = `${fileName}${ext}`;
        const fullPath = getFilePath(newFileName) || `${DEFAULT_FILE_PATH}/${newFileName}`;
        cb(null, fullPath);
      },
    }),
  });
  if (multi) {
    return multerInstance.array(fileProp || DEFAULT_FILE_PROPERTY, fileLimit || DEFAULT_FILE_LIMIT);
  }
  return multerInstance.single(fileProp || DEFAULT_FILE_PROPERTY);
};

module.exports = s3fileUploadMiddleware;
