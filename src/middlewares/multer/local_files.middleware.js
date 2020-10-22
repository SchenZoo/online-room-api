const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const { Randoms } = require('../../common');
const {
  DEFAULT_FILE_LIMIT_SIZE,
  DEFAULT_FILE_PATH,
  DEFAULT_FILE_LIMIT,
  DEFAULT_FILE_PROPERTY,
} = require('../../constants/multer/defaults');


/**
 * @param {{
  getFilePath?:(fileName:string)=>string,
  multi?:boolean,
  fileLimit?:number,
  fileProp?:string,
  fileSizeLimit?:number,
}} options
*/
const localFilesUploadMiddleware = (options) => {
  const {
    getFilePath = () => null, multi, fileLimit, fileProp, fileSizeLimit,
  } = options;
  const multerInstance = multer({
    // :TODO options for fileFilter
    limits: fileSizeLimit || DEFAULT_FILE_LIMIT_SIZE,
    storage: multer.diskStorage({
      destination(req, file, cb) {
        let filePath = getFilePath('') || DEFAULT_FILE_PATH;
        filePath = `public/${filePath}`;
        const relativePath = `./${filePath}`;
        if (!fs.existsSync(relativePath)) {
          shell.mkdir('-p', relativePath);
        }
        cb(null, relativePath);
      },
      filename(req, file, cb) {
        const fileName = Randoms.getRandomString();
        const ext = path.extname(file.originalname);
        const newFileName = `${fileName}${ext}`;
        cb(null, newFileName);
      },
    }),
  });
  if (multi) {
    return multerInstance.array(fileProp || DEFAULT_FILE_PROPERTY, fileLimit || DEFAULT_FILE_LIMIT);
  }
  return multerInstance.single(fileProp || DEFAULT_FILE_PROPERTY);
};

module.exports = localFilesUploadMiddleware;
