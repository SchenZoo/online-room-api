const {
  DEFAULT_API_KEY,
} = process.env;

if (
  !DEFAULT_API_KEY) {
  console.error('DEFAULT_API_KEY environment variable is missing!');
  process.exit(1);
}

const KEY_OWNERS = {
  DEFAULT: 'DEFAULT',
};

const API_KEYS = {
  [KEY_OWNERS.DEFAULT]: [DEFAULT_API_KEY],
};


const EXTERNAL_REQUEST_API_KEYS = {
};


module.exports = {
  API_KEYS,
  KEY_OWNERS,
  EXTERNAL_REQUEST_API_KEYS,
};
