// Import modules
const Op = require('sequelize').Op;

// Import Model
const { users, friendship } = require('../models');

// Import Helpers
const response = require('../helpers/response');

exports.searchFriend = async (req, res) => {
  const { q } = req.query;
  try {
    // Search friends
    const user = await users.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: '%' + q + '%' } },
          { username: { [Op.like]: '%' + q + '%' } },
        ],
      },
    });

    if (!user) {
      return response(res, 400, false, 'Sorry user not found!');
    }

    // concat link of picture
    const data = user.map((element) => {
      return {
        ...element.dataValues,
        picture: process.env.URL.concat('/profile/', element.picture),
      };
    });

    return response(res, 200, true, `Found ${user.length} of friends.`, data);
  } catch (error) {
    response(res, 500, false, error.message);
    throw new Error(error);
  }
};

exports.addFriend = async (req, res) => {
  const { username } = req.query;
  try {
    // Check user into users table
    const friend = await users.findOne({ where: { username } });
    if (!friend) {
      return response(
        res,
        400,
        false,
        `Cannot find a user with username ${username}.`
      );
    }

    // Check friendId
    if (Number(friend.id) === Number(req.userData.id)) {
      return response(
        res,
        400,
        false,
        "Sorry, you can't make a friends with yourself :3"
      );
    }

    // Make a friends
    const newFriend = new friendships({
      userId: req.userData.id,
      friendId: friend.id,
    });
    await newFriend.save();

    return response(res, 200, true, `Now you are friends with ${friend} :)`);
  } catch (error) {
    response(res, 500, false, error.message);
    throw new Error(error);
  }
};

exports.deleteFriend = async (req, res) => {
  const { id } = req.query;
  try {
    // Check friends
    const friendExist = await friendship.findOne({
      where: { id },
    });

    if (!friendExist) {
      return response(res, 200, true, 'Sorry, cannot delete friends!');
    }

    const results = await friendship.destroy({
      where: { id },
    });
    return response(res, 200, true, 'Successfuly delete friends!');
  } catch (error) {
    response(res, 500, false, error.message);
    throw new Error(error);
  }
};

exports.getUserFriends = async (req, res) => {
  const {
    limit = 5,
    page = 1,
    search = '',
    order = 'id',
    sort = 'ASC',
  } = req.query;

  // Pagination
  const dataLimit = Number(limit) * Number(page);
  const offset = (Number(page) - 1) * Number(limit);

  // Limit cannot be minus
  if (limit < 1) {
    return response(res, 400, false, 'Bad Request');
  }

  try {
    const results = await friendship.findAll({
      attribute: ['friendId', 'createdAt'],
      limit: Number(limit),
      offset: offset,
      order: [[order, sort]],
      where: {
        userId: req.userData.id,
      },
      include: [
        {
          model: users,
          foreignKey: 'friendId',
          where: {
            [Op.or]: [
              { name: { [Op.like]: '%' + search + '%' } },
              { username: { [Op.like]: '%' + search + '%' } },
            ],
          },
          attributes: ['name', 'picture'],
        },
      ],
    });
    const nextResults = await friendship.findAll({
      attribute: ['friendId', 'createdAt'],
      limit: Number(limit),
      offset: offset + dataLimit,
      order: [[order, sort]],
      where: {
        userId: req.userData.id,
      },
      include: [
        {
          model: users,
          foreignKey: 'friendId',
          where: {
            [Op.or]: [
              { name: { [Op.like]: '%' + search + '%' } },
              { username: { [Op.like]: '%' + search + '%' } },
            ],
          },
          attributes: ['name', 'picture'],
        },
      ],
    });
    const queryKey = Object.keys(req.query);
    const queryValue = Object.values(req.query);
    const query = queryKey
      .map((item, index) => {
        if (item === 'page') {
          if (offset - limit >= 0) {
            return item + '=' + (Number(queryValue[index]) - 1);
          } else if (nextResults.length > 0) {
            return item + '=' + (Number(queryValue[index]) + 1);
          } else {
            return item + '=' + Number(queryValue[index]);
          }
        } else {
          return item + '=' + Number(queryValue[index]);
        }
      })
      .join('&');
    const nextPageLink =
      nextResults.length > 0 ? `${process.env.URL}/friends?${query}` : null;
    const prevPageLink =
      offset - limit >= 0 ? `${process.env.URL}/friends?${query}` : null;
    return response(
      res,
      200,
      true,
      'This is all of your friends.',
      results,
      prevPageLink,
      nextPageLink,
      page ? page : 1
    );
  } catch (error) {
    response(res, 500, false, error.message);
    throw new Error(error);
  }
};
