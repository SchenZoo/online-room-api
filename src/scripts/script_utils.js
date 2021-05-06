const { initializeEnvironment } = require('../common/environment');
const { FileSystem } = require('../common');

initializeEnvironment();

function initializeDatabase() {
  require('../loaders');
}

module.exports = {
  getAllDirFiles: FileSystem.getAllDirFiles,
  initializeDatabase,
};
