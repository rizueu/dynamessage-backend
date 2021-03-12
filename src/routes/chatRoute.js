// Import modules
const router = require('express').Router();

// Import Controller
const { receive, send } = require('../controllers/chatController');

// Middlewares
const { isLogin } = require('../middlewares/auth');

// Routes
router.get('/', isLogin, receive);
router.post('/', isLogin, send);

module.exports = router;
