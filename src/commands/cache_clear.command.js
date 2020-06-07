const { initializeEnvironment } = require('../common/environment');

initializeEnvironment();
const { RedisCacheClient } = require('../services/redis');

RedisCacheClient.flushdb().then(() => {
  console.log('Successfully cleared cache!');
  process.exit();
})
  .catch((err) => {
    console.error('Failed clearing cache!!');
    console.error(err);
    process.exit(1);
  });
