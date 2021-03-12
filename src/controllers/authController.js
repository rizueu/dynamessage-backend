// Import modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Op = require('sequelize').Op;

// Import Model
const { users } = require('../models');

// Import Helpers
const response = require('../helpers/response');

exports.register = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    // Checking if user is already in the database
    const emailExist = await users.findOne({
      where: { email },
    });
    if (emailExist) {
      return response(res, 400, false, 'Email already exists');
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new users({
      name,
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return response(res, 201, true, 'Thanks, your registered.');
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};

exports.login = async (req, res) => {
  const { id, password } = req.body;

  try {
    // Checking the email and compare hashed password in database
    const user = await users.findOne({
      where: { [Op.or]: [{ email: id }, { username: id }] },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response(res, 400, false, 'The credentials entered are wrong.');
    }

    // Create and assign a token
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.APP_KEY
    );
    return response(res, 200, true, 'Login successfuly', {
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};
