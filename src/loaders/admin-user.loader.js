const { ManagerService } = require('../services/app');


async function load() {
  const admin = await ManagerService.findOne();
  if (!admin) {
    await ManagerService.create({
      username: 'stane',
      password: 'asdlolasd',
      name: 'Aleksandar Stankovic',
    });
    console.log('Created initial admin');
  }
}

module.exports = load;
