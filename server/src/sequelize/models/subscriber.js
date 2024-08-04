'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class subscriber extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  subscriber.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Username is required.',
          },
          len: {
            args: [2, 16],
            msg: 'Username must be between 2 and 16 characters.',
          },
          is: {
            args: /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{2,16}$/,
            msg: 'Username must start with a letter and can only contain letters, numbers, and underscores.',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Email format is incorrect.',
          },
          notEmpty: {
            msg: 'Email is required.',
          },
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'subscriber',
    }
  );
  return subscriber;
};
