'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class friendship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {
        foreignKey: 'friendId',
      });
    }
  }
  friendship.init(
    {
      userId: DataTypes.INTEGER,
      friendId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'friendship',
    }
  );
  return friendship;
};
