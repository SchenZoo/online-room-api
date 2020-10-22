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

function signJWT(payload, secret) {
  return jwt.sign(payload, secret);
}

function verifyJWT(payload, secret) {
  return jwt.verify(payload, secret);
}


module.exports = {
  encodeMongoId,
  decodeMongoId,
  hashPassword,
  checkPassword,
  signJWT,
  verifyJWT,
};
