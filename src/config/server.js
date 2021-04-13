const {
  PORT = '3000',
  USER_JWT_SECRET,
  MANAGER_JWT_SECRET,
} = process.env;

if (!USER_JWT_SECRET || !MANAGER_JWT_SECRET) {
  console.error('Missing USER_JWT_SECRET or MANAGER_JWT_SECRET');
  process.exit(1);
}

module.exports = {
  PORT: +PORT,
  USER_JWT_SECRET,
  MANAGER_JWT_SECRET,
};
