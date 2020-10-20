module.exports = {
  apps: [{
    name: 'Online Room API',
    script: './index.js',
    watch: false,
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    merge_logs: true,
    kill_timeout: 5000,
  }],

};
