const mongoose = require('mongoose');
const { mongoDbConnectOptions, mongoDBbUrl } = require('../config');

async function load() {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(mongoDBbUrl, mongoDbConnectOptions)
      .then(() => {
        console.log('Connected to Mongo');
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}


module.exports = load;
