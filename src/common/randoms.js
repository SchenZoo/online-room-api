const md5 = require('md5');


function getRandomString() {
  return md5(process.hrtime.bigint().toString());
}


module.exports = {
  getRandomString,
};
