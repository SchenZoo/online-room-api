const multer = require('multer');
const set = require('lodash.set');
const path = require('path');
const md5 = require('md5');
const mime = require('mime-types');

const { AWS_BUCKET_NAME } = require('../../config');
const { DefaultS3Service } = require('../../services/file_storage');
const { FilterError } = require('../../errors/general');

const DEFAULT_FILE_PROPERTY = 'file';
const DEFAULT_FILE_PATH = 'file';

/**
@param {{
filePath?:string
fileProp?:string,
transformers?: Array<(buffer:Buffer) => Buffer>
mimeValidator?: RegExp
required?: boolean
StorageService?: any
saveInProp?:string
}} options
*/
const fileUploadMiddleware = (options = {}) => {
  const {
    containerName = AWS_BUCKET_NAME,
    filePath = DEFAULT_FILE_PATH,
    fileProp = DEFAULT_FILE_PROPERTY,
    transformers = [],
    mimeValidator,
    required = false,
    StorageService = DefaultS3Service,
    saveInProp = 'file',
  } = options;
  return (req, res, next) => {
    multer().single(fileProp)(req, res, async () => {
      const {
        file: { buffer } = {},
      } = req;
      if (!buffer) {
        if (required) {
          return next(new FilterError('File is required!', 400, true));
        }
        return next();
      }
      if (!req.file.originalname) {
        return next(new FilterError('Uploaded file must have original name', 400, true));
      }
      const fileName = md5(process.hrtime.bigint().toString());
      const ext = path.extname(req.file.originalname);
      const newFileName = `${fileName}${ext}`;

      const mimeType = mime.lookup(newFileName);
      if (!mimeType || (mimeValidator && (mimeValidator instanceof RegExp) && !mimeValidator.test(mimeType))) {
        return next(new FilterError('Invalid mime type', 400, true));
      }

      const transformedBuffer = await transformers.reduce(async (buffer, transformer) => transformer(buffer, mimeType), buffer);

      const data = await StorageService.uploadFile(`${filePath}/${newFileName}`, transformedBuffer, mimeType, containerName);
      set(req, saveInProp, data.Key);
      req.fileData = data;
      next();
    });
  };
};

module.exports = fileUploadMiddleware;
