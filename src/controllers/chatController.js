// Import modules
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const moment = require('moment');

// Import Model
const { messages, users } = require('../models');

// Import Helpers
const response = require('../helpers/response');

exports.receive = async (req, res) => {
  const { senderId } = req.query;
  if (senderId) {
    try {
      // Get Chat History by senderId
      const sender = await messages.findAll({
        where: {
          [Op.and]: [{ userId: req.userData.id }, { senderId: senderId }],
        },
      });

      const recipient = await messages.findAll({
        where: {
          [Op.and]: [{ userId: senderId }, { senderId: req.userData.id }],
        },
      });

      const results = [...sender, ...recipient];

      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Return a response to the client
      return response(res, 200, true, 'Chat History', results);
    } catch (error) {
      response(res, 500, false, error.message);
      throw new Error(error);
    }
  } else {
    try {
      const results = await messages.findAll({
        attributes: ['userId', 'senderId'],
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
        raw: true,
      });

      const latest = await messages.findAll({
        order: [['createdAt', 'DESC']],
        raw: true,
      });

      const modifiedResults = results.map((item) => ({
        ...item,
        message:
          latest.length === 1
            ? latest.message
            : latest
                .filter((items) => {
                  return (
                    item.senderId === items.userId ||
                    item.senderId === items.senderId
                  );
                })
                .map((item) => item.message)
                .shift(),
        createdAt:
          latest.length === 1
            ? latest[0].createdAt
            : latest
                .filter((items) => {
                  return (
                    item.senderId === items.userId ||
                    item.senderId === items.senderId
                  );
                })
                .map((item) => moment(item.createdAt).format('D MMM'))
                .shift(),
      }));

      // Return a response to the client
      return response(res, 200, true, 'Chat Lists', modifiedResults);
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
      userId: Number(recipient),
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
