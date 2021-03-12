// Import Modules
const jwt = require('jsonwebtoken');

// Import Helpers
const response = require('../helpers/response');

exports.isLogin = (req, res, next) => {
  const token = req.header('authorization');
  if (token) {
    jwt.verify(token, process.env.APP_KEY, (error, decode) => {
      if (error) {
        response(res, 400, false, error.message);
      } else {
        req.userData = decode;
        next();
      }
    });
  }
};
