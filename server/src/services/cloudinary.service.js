const { Readable } = require('stream');
const { cloudinary, cloudinaryConfigured } = require('../config');
const { logger } = require('../config/logger');
const { ApiError } = require('../utils');

function uploadBuffer(file, folder = 'bynemsteddy/products') {
  logger.info({
    operation: 'cloudinary.uploadBuffer',
    folder,
    mimeType: file.mimetype,
    bytes: file.size,
  }, 'Service invoked');
  if (!cloudinaryConfigured) throw new ApiError(503, 'Image upload is not configured');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }, { width: 1600, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          logger.error({
            operation: 'cloudinary.uploadBuffer',
            folder,
            providerStatus: error.http_code,
            providerMessage: error.message,
          }, 'Service failed');
          return reject(new ApiError(502, 'Cloudinary upload failed'));
        }
        logger.info({
          operation: 'cloudinary.uploadBuffer',
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        }, 'Service completed');
        resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

async function uploadMany(files, folder) {
  logger.info({ operation: 'cloudinary.uploadMany', folder, fileCount: files.length }, 'Service invoked');
  const images = await Promise.all(files.map((file) => uploadBuffer(file, folder)));
  logger.info({ operation: 'cloudinary.uploadMany', folder, imageCount: images.length }, 'Service completed');
  return images;
}

module.exports = { uploadBuffer, uploadMany };
