const express = require('express');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = asyncHandler(async (req, res, next) => {
  const tags = await Post.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 50 }
  ]);

  res.status(200).json({
    success: true,
    count: tags.length,
    data: tags.map(tag => ({
      name: tag._id,
      count: tag.count
    }))
  });
});

// @desc    Get posts by tag
// @route   GET /api/tags/:tag/posts
// @access  Public
const getPostsByTag = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const posts = await Post.find({
    tags: { $in: [req.params.tag] },
    status: 'published'
  })
    .populate('author', 'name username avatar')
    .populate('commentCount')
    .sort('-publishedAt')
    .skip(startIndex)
    .limit(limit);

  const total = await Post.countDocuments({
    tags: { $in: [req.params.tag] },
    status: 'published'
  });

  res.status(200).json({
    success: true,
    count: posts.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: posts
  });
});

router.get('/', getTags);
router.get('/:tag/posts', getPostsByTag);

module.exports = router;