module.exports = {
  apps: [{
    name: 'Online Room API - DEV',
    script: './index.js',
    ignore_watch: ['node_modules', 'yarn-error.log', 'logs'],
    watch: true,
    error_file: './logs/error.dev.log',
    out_file: './logs/output.dev.log',
  }],

};
