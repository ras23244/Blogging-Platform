const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ErrorResponse('Please upload an image file', 400), false);
    }
  }
});

const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'image' },
    (error, result) => {
      if (error) return next(new ErrorResponse('Cloudinary upload failed', 500));
      res.status(200).json({
        success: true,
        data: {
          url: result.secure_url,
          filename: req.file.originalname,
          size: req.file.size
        }
      });
    }
  );
  stream.end(req.file.buffer);
});

router.post('/image', protect, upload.single('image'), uploadImage);

module.exports = router;
