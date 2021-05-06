const dotenv = require('dotenv');
const fs = require('fs');

const { NODE_ENV } = process.env;

function initializeEnvironment() {
  const envVars = getEnvVariables(NODE_ENV);
  Object.keys(envVars).forEach((key) => {
    process.env[key] = envVars[key];
  });
}

function getEnvVariables(env) {
  const envFilesByPriorityAsc = ['.env', '.env.local'];
  if (env) {
    envFilesByPriorityAsc.push(`.env.${env}`);
    envFilesByPriorityAsc.push(`.env.${env}.local`);
  }
  const envVars = {};
  envFilesByPriorityAsc.forEach((envFilePath) => {
    if (fs.existsSync(envFilePath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
      Object.keys(envConfig).forEach((key) => {
        envVars[key] = envConfig[key];
      });
    }
  });
  return envVars;
}

module.exports = {
  initializeEnvironment,
  getEnvVariables,
};
