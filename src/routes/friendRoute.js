// Import modules
const router = require('express').Router();

// Import Controller
const {
  getUserFriends,
  getFriendById,
  addFriend,
  searchFriend,
  deleteFriend,
} = require('../controllers/friendController');

// Middlewares
const { isLogin } = require('../middlewares/auth');

// Routes
router.post('/add', isLogin, addFriend);
router.get('/', isLogin, getUserFriends);
router.get('/:id', isLogin, getFriendById);
router.get('/search', isLogin, searchFriend);
router.delete('/delete', isLogin, deleteFriend);

module.exports = router;
