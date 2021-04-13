const Hashids = require('hashids/cjs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashids = new Hashids(process.env.HASH_ID_SECRET);

function encodeMongoId(id) {
  return hashids.encodeHex(`${id}`);
}

function decodeMongoId(hash) {
  return hashids.decodeHex(hash);
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


module.exports = {
  encodeMongoId,
  decodeMongoId,
  hashPassword,
  checkPassword,
  signJWT,
  verifyJWT,
};
