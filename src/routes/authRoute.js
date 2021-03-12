// Import modules
const router = require('express').Router();
const upload = require('express-fileupload');

// Import Controller
const { register, login } = require('../controllers/authController');

// Middlewares
const { isLogin } = require('../middlewares/auth');
router.use(upload({ createParentPath: true }));

router.post('/register', register);
router.post('/login', login);

module.exports = router;
