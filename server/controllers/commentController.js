const Comment = require('../models/Comment');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Get top-level comments (no parent)
  const comments = await Comment.find({ 
    post: req.params.postId,
    parentComment: null
  })
    .populate('author', 'name username avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name username avatar'
      }
    })
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const total = await Comment.countDocuments({ 
    post: req.params.postId,
    parentComment: null
  });

  res.status(200).json({
    success: true,
    count: comments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: comments
  });
});

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = asyncHandler(async (req, res, next) => {
  const { content, post, parentComment } = req.body;

  // Check if post exists
  const postExists = await Post.findById(post);
  if (!postExists) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // If it's a reply, check if parent comment exists
  if (parentComment) {
    const parentExists = await Comment.findById(parentComment);
    if (!parentExists) {
      return next(new ErrorResponse('Parent comment not found', 404));
    }
  }

  const comment = await Comment.create({
    content,
    post,
    parentComment,
    author: req.user.id
  });

  await comment.populate('author', 'name username avatar');

  res.status(201).json({
    success: true,
    data: comment
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Make sure user is comment owner
  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this comment', 401));
  }

  comment.content = req.body.content;
  comment.isEdited = true;
  comment.editedAt = new Date();

  await comment.save();
  await comment.populate('author', 'name username avatar');

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Make sure user is comment owner
  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this comment', 401));
  }

  // Delete all replies to this comment
  await Comment.deleteMany({ parentComment: req.params.id });

  // Delete the comment
  await comment.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Check if comment is already liked
  const alreadyLiked = comment.likes.some(like => like.user.toString() === req.user.id);

  if (alreadyLiked) {
    return next(new ErrorResponse('Comment already liked', 400));
  }

  comment.likes.push({ user: req.user.id });
  await comment.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Comment liked successfully',
      likeCount: comment.likes.length
    }
  });
});

// @desc    Unlike comment
// @route   DELETE /api/comments/:id/like
// @access  Private
exports.unlikeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Check if comment is liked
  const likeIndex = comment.likes.findIndex(like => like.user.toString() === req.user.id);

  if (likeIndex === -1) {
    return next(new ErrorResponse('Comment not liked', 400));
  }

  comment.likes.splice(likeIndex, 1);
  await comment.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Comment unliked successfully',
      likeCount: comment.likes.length
    }
  });
});

// @desc    Get user's comments
// @route   GET /api/comments/user/:userId
// @access  Public
exports.getUserComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const comments = await Comment.find({ author: req.params.userId })
    .populate('author', 'name username avatar')
    .populate('post', 'title slug')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const total = await Comment.countDocuments({ author: req.params.userId });

  res.status(200).json({
    success: true,
    count: comments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: comments
  });
});