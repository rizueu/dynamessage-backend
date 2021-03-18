// Import modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Op = require('sequelize').Op;

// Import Model
const { users } = require('../models');

// Import Helpers
const response = require('../helpers/response');
const upload = require('../helpers/upload');
const { verifMail } = require('../helpers/mailer');

exports.register = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    // Checking if user is already in the database
    const userExist = await users.findOne({
      where: { email },
    });
    if (userExist) {
      return response(res, 400, false, 'Email already exists');
    }

    const usernameUsed = await users.findOne({ where: { username } });
    if (usernameUsed) {
      return response(res, 400, false, 'Username already exists');
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

    // Generate One Time Password
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    // Send Mail
    verifMail(
      newUser.email,
      OTP,
      'Verify your Email Address',
      "Thanks for signing up for Dynamessage! We're excited to have you as an early user. The following is your OTP :"
    );

    return response(res, 201, true, 'Thanks, your registered.', {
      id: newUser.id,
      OTP,
    });
  } catch (error) {
    response(res, 500, false, error.message);
    throw new Error(error);
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

    // Check user's verification
    if (!user.verified) {
      return response(res, 400, false, "Your account haven't active");
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
    response(res, 500, false, error.message);
    throw new Error(error);
  }
};

exports.activate = async (req, res) => {
  try {
    const results = await users.update(
      { verified: true },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    if (results)
      response(
        res,
        200,
        true,
        'Congratulations, your account has been activated!'
      );
  } catch (error) {
    response(res, 500, false, error.message);
    throw new Error(error);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await users.findOne({ where: { id: req.userData.id } });
    if (!user) {
      return response(
        res,
        400,
        false,
        `User with id ${req.userData.id} unavailable`
      );
    } else {
      const data = {
        ...user.dataValues,
        picture: process.env.URL.concat('/profile/', user.picture),
      };
      return response(
        res,
        200,
        true,
        'Successfully to get user with id ' + req.userData.id,
        data
      );
    }
  } catch (error) {
    response(res, 500, false, 'Server Error');
    throw new Error(error);
  }
};

exports.edit = async (req, res) => {
  switch (req.params.param) {
    case 'profile': {
      try {
        // Update Profile
        const results = await users.update(
          { ...req.body },
          { where: { id: req.userData.id } }
        );

        if (!results) {
          return response(res, 400, false, 'Failed to edit user account');
        } else {
          return response(res, 200, true, 'Your account has been updated');
        }
      } catch (error) {
        response(res, 500, false, error.message);
        throw new Error(error);
      }
    }
    case 'photo': {
      const picture = await upload(req, 'profile');

      if (typeof picture === 'object') {
        return response(res, picture.status, picture.success, picture.message);
      }

      try {
        const results = await users.update(
          { picture: picture },
          { where: { id: req.userData.id } }
        );

        if (!results) {
          fs.unlink('./public/uploads/' + picture, (err) => {
            if (err) {
              console.log(err);
            }
          });
          return response(res, 400, false, 'Failed to upload profile');
        } else {
          return response(res, 200, true, 'Success to upload profile');
        }
      } catch (error) {
        response(res, 500, false, 'Server Error');
        throw new Error(error);
      }
    }
    case 'password': {
      const { prevPassword, password } = req.body;
      try {
        const user = users.findOne({
          where: {
            id: req.userData.id,
          },
        });

        if (!(await bcrypt.compare(prevPassword, user.password))) {
          return response(400, false, 'Wrong previous password!');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password
        const results = await users.update(
          {
            password: hashedPassword,
          },
          {
            where: {
              id: req.userData.id,
            },
          }
        );
        if (results) response(res, 200, true, 'Password has been updated');
      } catch (error) {
        response(res, 500, false, error.message);
        throw new Error(error);
      }
    }
  }
};
