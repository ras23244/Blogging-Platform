const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ErrorResponse('Please upload an image file', 400), false);
    }
  }
});

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // TODO: Implement actual image upload to cloud storage (Cloudinary, AWS S3, etc.)
  // For now, we'll simulate a successful upload
  const imageUrl = `https://example.com/uploads/${Date.now()}-${req.file.originalname}`;

  res.status(200).json({
    success: true,
    data: {
      url: imageUrl,
      filename: req.file.originalname,
      size: req.file.size
    }
  });
});

router.post('/image', protect, upload.single('image'), uploadImage);

module.exports = router;