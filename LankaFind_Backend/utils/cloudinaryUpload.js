const cloudinary = require('../config/cloudinary');

// Streams a Buffer (from multer's memoryStorage) straight up to Cloudinary,
// without ever touching the local disk. This is what makes uploads survive
// on Vercel, where the filesystem is read-only/ephemeral.
function uploadBufferToCloudinary(buffer, folder = 'lankafind') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = uploadBufferToCloudinary;
