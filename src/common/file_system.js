const fs = require('fs');

const projectPath = process.cwd();

async function getAllDirFiles(absoluteDirPath = projectPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(absoluteDirPath, (err, files) => {
      if (err) {
        return reject(`Unable to scan directory: ${err}`);
      }
      resolve(files);
    });
  });
}

module.exports = {
  getAllDirFiles,
};
