const { staticImageResize, keepAspectRatioImageResize } = require('./buffer_resize');
const { bufferToStream } = require('./buffer_cast');

module.exports = {
  staticImageResize,
  keepAspectRatioImageResize,
  bufferToStream,
};
