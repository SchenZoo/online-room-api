const sizeOf = require('image-size');
const sharp = require('sharp');

function isImageMimeType(mimeType) {
  return /image\//.test(mimeType);
}
/**
 * Resizes image to WxH or HxW (W - resizeWidth, H - resizeHeight) depending on resizeSwapWidthHeightBasedOnAspectRatio argument
 * @param {number} resizeWidth
 * @param {number} resizeHeight
 * @param {boolean} resizeSwapWidthHeightBasedOnAspectRatio
 */
function staticImageResize(resizeWidth, resizeHeight, resizeSwapWidthHeightBasedOnAspectRatio = true) {
  if (!resizeHeight || !resizeWidth) {
    console.error('staticImageResize: resizeHeight or resizeWidth not provided');
  }
  return async (buffer, mimeType) => {
    if (!isImageMimeType(mimeType)) {
      return buffer;
    }
    const { width, height } = sizeOf(buffer);
    let newWidth = resizeWidth;
    let newHeight = resizeHeight;
    if (resizeSwapWidthHeightBasedOnAspectRatio && width < height) {
      newWidth = resizeHeight;
      newHeight = resizeWidth;
    }
    return sharp(buffer).resize(Math.round(newWidth), Math.round(newHeight), {
      fit: 'fill',
    }).toBuffer();
  };
}

/**
 * @param {number} maxImageSideSize
 */
function keepAspectRatioImageResize(maxImageSideSize) {
  if (!maxImageSideSize) {
    console.error('keepAspectRatioImageResize: dominantImageSize not provided');
  }
  return async (buffer, mimeType) => {
    if (!isImageMimeType(mimeType)) {
      return buffer;
    }
    const { width, height } = sizeOf(buffer);
    const aspectRatio = width / height;

    let newWidth;
    let newHeight;

    if (aspectRatio >= 1) {
      newWidth = maxImageSideSize;
      newHeight = maxImageSideSize / aspectRatio;
    } else {
      newHeight = maxImageSideSize;
      newWidth = maxImageSideSize * aspectRatio;
    }

    return sharp(buffer).resize(Math.round(newWidth), Math.round(newHeight), {
      fit: 'fill',
    }).toBuffer();
  };
}

module.exports = {
  staticImageResize,
  keepAspectRatioImageResize,
};
