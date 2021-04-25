const Hashids = require('hashids/cjs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { HASH_ID_SECRET } = require('../config');

const hashids = new Hashids(HASH_ID_SECRET);

function encodeMongoId(id) {
  return hashids.encodeHex(`${id}`);
}

function decodeMongoId(hash) {
  return hashids.decodeHex(`${hash}`);
}

function hashPassword(password) {
  return bcrypt.hash(password, 8);
}

function checkPassword(passwordPlain, passwordEncrypted) {
  return bcrypt.compare(passwordPlain, passwordEncrypted);
}

async function signJWT(payload, secret) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

function verifyJWT(token, secret) {
  return jwt.verify(token, secret);
}

function hmacSha265Hash(secret, data) {
  return crypto.createHmac('SHA256', secret).update(data).digest('hex');
}

module.exports = {
  encodeMongoId,
  decodeMongoId,
  hashPassword,
  checkPassword,
  signJWT,
  verifyJWT,
  hmacSha265Hash,
};
