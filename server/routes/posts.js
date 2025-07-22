const express = require('express');
const {
  getPosts,
  getPost,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getTrendingPosts,
  getFeaturedPosts
} = require('../controllers/postController');

const { protect, optionalAuth } = require('../middleware/auth');
const {
  validatePost,
  validateObjectId,
  validateQuery,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

router.get('/trending', getTrendingPosts);
router.get('/featured', getFeaturedPosts);
router.get('/', validateQuery, handleValidationErrors, optionalAuth, getPosts);
router.get('/slug/:slug', optionalAuth, getPostBySlug);
router.get('/:id', validateObjectId('id'), handleValidationErrors, optionalAuth, getPost);

router.post('/', protect, validatePost, handleValidationErrors, createPost);
router.put('/:id', protect, validateObjectId('id'), validatePost, handleValidationErrors, updatePost);
router.delete('/:id', protect, validateObjectId('id'), handleValidationErrors, deletePost);

router.post('/:id/like', protect, validateObjectId('id'), handleValidationErrors, likePost);
router.delete('/:id/like', protect, validateObjectId('id'), handleValidationErrors, unlikePost);

module.exports = router;