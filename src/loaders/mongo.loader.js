const mongoose = require('mongoose');
const { mongoDbConnectOptions, mongoDBbUrl } = require('../config');

mongoose
  .connect(mongoDBbUrl, mongoDbConnectOptions)
  .then(() => {
    console.log('Connected to Mongo');
  })
  .catch((err) => {
    console.error('Database connection error', err);
  });
