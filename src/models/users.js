'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.messages);
      this.hasMany(models.friendship);
    }
  }
  users.init(
    {
      name: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      picture: {
        type: DataTypes.STRING,
        defaultValue: 'nophoto.png',
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'users',
    }
  );
  return users;
};
