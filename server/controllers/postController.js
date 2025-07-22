const Post = require('../models/Post');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { status: 'published' };

  // Filter by tag
  if (req.query.tag) {
    query.tags = { $in: [req.query.tag] };
  }

  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Filter by author
  if (req.query.author) {
    query.author = req.query.author;
  }

  // Sort options
  let sortBy = '-publishedAt';
  if (req.query.sort) {
    sortBy = req.query.sort;
  }

  const posts = await Post.find(query)
    .populate('author', 'name username avatar')
    .populate('commentCount')
    .sort(sortBy)
    .skip(startIndex)
    .limit(limit);

  const total = await Post.countDocuments(query);

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

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name username avatar bio socialLinks')
    .populate('commentCount');

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Increment view count
  post.views += 1;
  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Get post by slug
// @route   GET /api/posts/slug/:slug
// @access  Public
exports.getPostBySlug = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name username avatar bio socialLinks')
    .populate('commentCount');

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Increment view count
  post.views += 1;
  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.author = req.user.id;

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Make sure user is post owner
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this post', 401));
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Make sure user is post owner
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this post', 401));
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if post is already liked
  const alreadyLiked = post.likes.some(like => like.user.toString() === req.user.id);

  if (alreadyLiked) {
    return next(new ErrorResponse('Post already liked', 400));
  }

  // Add like to post
  post.likes.push({ user: req.user.id });
  
  // Add to user's liked posts
  user.likedPosts.push(req.params.id);

  await post.save();
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Post liked successfully',
      likeCount: post.likes.length
    }
  });
});

// @desc    Unlike post
// @route   DELETE /api/posts/:id/like
// @access  Private
exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if post is liked
  const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user.id);

  if (likeIndex === -1) {
    return next(new ErrorResponse('Post not liked', 400));
  }

  // Remove like from post
  post.likes.splice(likeIndex, 1);
  
  // Remove from user's liked posts
  user.likedPosts = user.likedPosts.filter(id => id.toString() !== req.params.id);

  await post.save();
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Post unliked successfully',
      likeCount: post.likes.length
    }
  });
});

// @desc    Get trending posts
// @route   GET /api/posts/trending
// @access  Public
exports.getTrendingPosts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  // Get posts from last 7 days, sorted by likes and views
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const posts = await Post.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $addFields: {
        likeCount: { $size: '$likes' },
        score: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 2] },
            { $multiply: ['$views', 0.1] }
          ]
        }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          {
            $project: {
              name: 1,
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$author'
    }
  ]);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});

// @desc    Get featured posts
// @route   GET /api/posts/featured
// @access  Public
exports.getFeaturedPosts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 5;

  const posts = await Post.find({ 
    status: 'published',
    featured: true 
  })
    .populate('author', 'name username avatar')
    .populate('commentCount')
    .sort('-publishedAt')
    .limit(limit);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});