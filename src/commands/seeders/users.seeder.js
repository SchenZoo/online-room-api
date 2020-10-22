const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();


require('../../database/connections');
const { userService } = require('../../services/app');

(async () => {
  try {
    const hashedPassword = userService.hashPassword('asdlolasd');
    await userService.create(...[
      {
        name: 'Aleksandar Stankovic',
        username: 'stane',
        password: hashedPassword,
      },
      {
        name: 'Veljko Stamenkovic',
        username: 'velja',
        password: hashedPassword,
      },
      {
        name: 'Ugljesa Stanisic',
        username: 'uglja',
        password: hashedPassword,
      },
    ]);
  } catch (error) {
    console.log('Error occured while seeding users');
    console.error(error.errmsg, `code: ${error.code}`);
    return process.exit(1);
  }
  process.exit(0);
})();
