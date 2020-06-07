const mongoose = require('mongoose');
const mongoOptions = require('../../config/mongodb');

class MainConnection {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(mongoOptions.mongoDBbUrl, mongoOptions.mongoDbConnectOptions)
      .then(() => {
        console.log('Connected to Mongo');
      })
      .catch((err) => {
        console.error('Database connection error', err);
      });
  }
}
module.exports = new MainConnection();
