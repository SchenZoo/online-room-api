// eslint-disable-next-line no-unused-vars
const { DefaultS3Service, FileStorageService } = require('../../services/file_storage');

/**
 * Expands schema with urlPath field.
 * @param {string} keyPath
 * @param {{
 *  urlPath: string;
 *  fallbackUrl: (Document)=>String | String;
 *  expiry: number;
 *  storageService:FileStorageService
 * }} options Options object
 */
function addSignedUrlPlugin(keyPath, options) {
  const {
    urlPath,
    expiry = 3600 * 24,
    fallbackUrl = null,
    storageService = DefaultS3Service,
  } = options;
  return (schema) => schema
    .virtual(urlPath)
    .get(function () {
      if (!this[keyPath]) {
        if (typeof fallbackUrl === 'function') {
          return fallbackUrl(this);
        }
        return fallbackUrl;
      }
      if (Array.isArray(this[keyPath])) {
        return this[keyPath].map((key) => storageService.getSignedUrl(key, expiry));
      }
      return storageService.getSignedUrl(this[keyPath], expiry);
    });
}
module.exports = {
  addSignedUrlPlugin,
};
