// Import modules
const { Op } = require('sequelize');

// Import Model
const { messages, users } = require('../models');

// Import Helpers
const response = require('../helpers/response');

exports.receive = async (req, res) => {
  const { senderId } = req.query;
  if (senderId) {
    try {
      // Get Chat History by senderId
      const results = await messages.findAll({
        where: {
          [Op.and]: [{ receiverId: req.userData.id }, { senderId: senderId }],
        },
      });

      // Return a response to the client
      return response(res, 200, true, 'Chat History', results);
    } catch (error) {
      response(res, 500, false, error.message);
      throw new Error(error);
    }
  } else {
    try {
      const results = await messages.findAll({
        attributes: ['senderId', 'message', 'createdAt'],
        order: [['createdAt', 'ASC']],
        where: {
          userId: req.userData.id,
        },
        include: [
          {
            model: users,
            foreignKey: 'senderId',
            attributes: ['name', 'picture'],
          },
        ],
        group: ['senderId'],
      });

      // Return a response to the client
      return response(res, 200, true, 'Chat Lists', results);
    } catch (error) {
      response(res, 500, false, error.message);
      throw new Error(error);
    }
  }
};

exports.send = async (req, res) => {
  try {
    // Check recipient
    const { id } = req.userData;
    const { recipient } = req.query;
    if (id === Number(recipient)) {
      return response(res, 400, false, "Sorry, you can't text yourself :3");
    }

    // Send message
    const chat = {
      receiverId: Number(recipient),
      senderId: id,
      message: req.body.message,
    };
    const message = new messages(chat);
    await message.save();
    req.socket.emit(req.userData.id, chat);

    // Return a response to the client
    return response(res, 200, true, 'Chat Sended!');
  } catch (error) {
    response(res, 500, false, error.message);
    throw new Error(error);
  }
};
