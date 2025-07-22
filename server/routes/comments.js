const express = require('express');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getUserComments
} = require('../controllers/commentController');

const { protect } = require('../middleware/auth');
const {
  validateComment,
  validateObjectId,
  validateQuery,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

router.get('/post/:postId', validateObjectId('postId'), validateQuery, handleValidationErrors, getComments);
router.get('/user/:userId', validateObjectId('userId'), validateQuery, handleValidationErrors, getUserComments);

router.post('/', protect, validateComment, handleValidationErrors, createComment);
router.put('/:id', protect, validateObjectId('id'), validateComment, handleValidationErrors, updateComment);
router.delete('/:id', protect, validateObjectId('id'), handleValidationErrors, deleteComment);

router.post('/:id/like', protect, validateObjectId('id'), handleValidationErrors, likeComment);
router.delete('/:id/like', protect, validateObjectId('id'), handleValidationErrors, unlikeComment);

module.exports = router;