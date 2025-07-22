const User = require('../models/User');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const users = await User.find()
    .select('-password')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit)
    .populate('postsCount');

  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('followers', 'name username avatar')
    .populate('following', 'name username avatar')
    .populate('postsCount');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
exports.getUserByUsername = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .select('-password')
    .populate('followers', 'name username avatar')
    .populate('following', 'name username avatar')
    .populate('postsCount');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (req.params.id === req.user.id) {
    return next(new ErrorResponse('You cannot follow yourself', 400));
  }

  // Check if already following
  if (currentUser.following.includes(req.params.id)) {
    return next(new ErrorResponse('You are already following this user', 400));
  }

  // Add to following and followers
  currentUser.following.push(req.params.id);
  userToFollow.followers.push(req.user.id);

  await currentUser.save();
  await userToFollow.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'User followed successfully'
    }
  });
});

// @desc    Unfollow user
// @route   DELETE /api/users/:id/follow
// @access  Private
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToUnfollow) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if not following
  if (!currentUser.following.includes(req.params.id)) {
    return next(new ErrorResponse('You are not following this user', 400));
  }

  // Remove from following and followers
  currentUser.following = currentUser.following.filter(
    id => id.toString() !== req.params.id
  );
  userToUnfollow.followers = userToUnfollow.followers.filter(
    id => id.toString() !== req.user.id
  );

  await currentUser.save();
  await userToUnfollow.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'User unfollowed successfully'
    }
  });
});

// @desc    Get user's posts
// @route   GET /api/users/:id/posts
// @access  Public
exports.getUserPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const posts = await Post.find({ 
    author: req.params.id,
    status: 'published'
  })
    .populate('author', 'name username avatar')
    .sort('-publishedAt')
    .skip(startIndex)
    .limit(limit);

  const total = await Post.countDocuments({ 
    author: req.params.id,
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

// @desc    Get user's bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'bookmarks',
      populate: {
        path: 'author',
        select: 'name username avatar'
      }
    });

  res.status(200).json({
    success: true,
    count: user.bookmarks.length,
    data: user.bookmarks
  });
});

// @desc    Add bookmark
// @route   POST /api/users/bookmarks/:postId
// @access  Private
exports.addBookmark = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  if (user.bookmarks.includes(req.params.postId)) {
    return next(new ErrorResponse('Post already bookmarked', 400));
  }

  user.bookmarks.push(req.params.postId);
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Post bookmarked successfully'
    }
  });
});

// @desc    Remove bookmark
// @route   DELETE /api/users/bookmarks/:postId
// @access  Private
exports.removeBookmark = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user.bookmarks.includes(req.params.postId)) {
    return next(new ErrorResponse('Post not bookmarked', 400));
  }

  user.bookmarks = user.bookmarks.filter(
    id => id.toString() !== req.params.postId
  );
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Bookmark removed successfully'
    }
  });
});

// @desc    Get liked posts
// @route   GET /api/users/liked
// @access  Private
exports.getLikedPosts = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'likedPosts',
      populate: {
        path: 'author',
        select: 'name username avatar'
      }
    });

  res.status(200).json({
    success: true,
    count: user.likedPosts.length,
    data: user.likedPosts
  });
});