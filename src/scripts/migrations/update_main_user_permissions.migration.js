const { UserModel } = require('../../database/models');
const { USER_PERMISSIONS } = require('../../constants/company/user/permissions');

module.exports.execute = async () => {
  const response = await UserModel.updateMany({
    isMain: true,
  }, {
    $set: {
      permissions: Object.values(USER_PERMISSIONS),
    },
  });
  console.log(response);
  console.log('Finished updating main users.');
};
