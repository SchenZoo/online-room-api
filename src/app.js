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
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
      error,
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(422).json({
      errors: error.errors,
      message: error.message,
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid value (${error.value}) sent for ${error.kind} type field.`,
    });
  }

  if (error.code === 11000) {
    const fieldGroup = error.message.match(/index: (.*)_1 dup key/);
    const field = fieldGroup ? fieldGroup[1] : 'unknown_field';
    return res.status(409).json({
      message:
        `Document with "${field}" already exists`,
      error: {
        name: 'ConflictError',
        statusCode: 409,
        isFatal: true,
      },
    });
  }

  console.log('Global handler: ', error);

  return res.status(500).json({
    message: error.message,
    error,
  });
});

module.exports = app;
