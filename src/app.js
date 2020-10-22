const cors = require('cors');
const compression = require('compression');

const express = require('express');
const helmet = require('helmet');

const apiRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);


app.use('/public', express.static('public'));
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(405).json({
    message: 'Endpoint doesn"t exist!',
  });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.log(error);
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      error,
    });
  }
  return res.status(500).json({
    message: error.message,
    error,
  });
});

module.exports = app;
