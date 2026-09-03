const multer = require('multer');
const path = require('path');

// Files are kept in memory as a Buffer instead of being written to disk -
// the route handler streams each buffer straight to Cloudinary. This is
// required for Vercel: serverless functions have a read-only, ephemeral
// filesystem, so anything written to a local uploads/ folder disappears as
// soon as that function's container gets recycled (this was why uploaded
// item photos were showing as broken images after deploy).
const storage = multer.memoryStorage();

// Only allow image files
function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 } // 5MB per file, max 3 images
});

module.exports = upload;
