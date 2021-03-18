// Import modules
const router = require('express').Router();
const { Op } = require('sequelize');

// Import Models
const { users } = require('../models');

// Import Helpers
const response = require('../helpers/response');

// Import Middlewares
const { isLogin } = require('../middlewares/auth');

// Routes
router.get('/', isLogin, async (req, res) => {
  const { search = '' } = req.query;
  try {
    const contacts = await users.findAll({
      attributes: { exclude: ['password', 'verified'] },
      where: {
        [Op.or]: [
          { name: { [Op.like]: '%' + search + '%' } },
          { username: { [Op.like]: '%' + search + '%' } },
        ],
        [Op.not]: [{ id: req.userData.id }],
      },
      raw: true,
    });
    return response(res, 200, true, 'All Users on Server', contacts);
  } catch (error) {
    response(res, 500, false, 'Server Error');
    throw new Error(error);
  }
});

module.exports = router;
