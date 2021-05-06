const mongoLoader = require('./mongo.loader');
const adminUserLoader = require('./admin-user.loader');
const clearOnlineUsersLoader = require('./clear-online.loader');

async function load() {
  await mongoLoader();
  await adminUserLoader();
  await clearOnlineUsersLoader();
  console.log('Application loaded');
}

module.exports = load;
