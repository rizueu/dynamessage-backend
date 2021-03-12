// Import modules
const router = require('express').Router();
const upload = require('express-fileupload');

// Import Controller
const {
  register,
  login,
  activate,
  edit,
  getUser,
} = require('../controllers/authController');

// Middlewares
const { isLogin } = require('../middlewares/auth');
router.use(upload({ createParentPath: true }));

// Routes
router.get('/user', isLogin, getUser);
router.post('/register', register);
router.post('/login', login);
router.patch('/activate', activate);
router.patch('/edit/:param', isLogin, edit);

module.exports = router;
