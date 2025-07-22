const express = require('express');
const {
  getUsers,
  getUser,
  getUserByUsername,
  followUser,
  unfollowUser,
  getUserPosts,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getLikedPosts
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { validateObjectId, validateQuery, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/', validateQuery, handleValidationErrors, getUsers);
router.get('/bookmarks', protect, getBookmarks);
router.get('/liked', protect, getLikedPosts);
router.get('/username/:username', getUserByUsername);
router.get('/:id', validateObjectId('id'), handleValidationErrors, getUser);
router.get('/:id/posts', validateObjectId('id'), validateQuery, handleValidationErrors, getUserPosts);

router.post('/:id/follow', protect, validateObjectId('id'), handleValidationErrors, followUser);
router.delete('/:id/follow', protect, validateObjectId('id'), handleValidationErrors, unfollowUser);

router.post('/bookmarks/:postId', protect, validateObjectId('postId'), handleValidationErrors, addBookmark);
router.delete('/bookmarks/:postId', protect, validateObjectId('postId'), handleValidationErrors, removeBookmark);

module.exports = router;