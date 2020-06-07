const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();


require('../../database/connections');
const { UserModel } = require('../../database/models');

(async () => {
  try {
    await UserModel.create(...[
      {
        username: 'stane',
        password: UserModel.hashPassword('asdlolasd'),
      },
      {
        username: 'velja',
        password: UserModel.hashPassword('asdlolasd'),
      },
      {
        username: 'uglja',
        password: UserModel.hashPassword('asdlolasd'),
      },
    ]);
  } catch (error) {
    console.log('Error occured while seeding users');
    console.error(error.errmsg, `code: ${error.code}`);
    return process.exit(1);
  }
  process.exit(0);
})();
