'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_details.belongsTo(models.user_account, {
        foreignKey: 'user_accounts_id', // Foreign key in user_details table
        targetKey: 'id' // Primary key in user_accounts table
      })
    }
  }
  user_details.init({
    phone_number: {
      type: DataTypes.STRING(16),
      unique: true,
      // allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [8, 16],
          msg: 'Phone number is not valid.'
        },
        is: {
          args: /^(?:\+\d{7,15}|\d{10})$/,
          msg: 'Phone number is not valid.'
        },
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 16],
        is: /^[a-zA-Z][a-zA-Z0-9_]*$/
      }
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    municipality: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    settlement: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    work: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    hobby: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    interest: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    block: {
      type: DataTypes.STRING
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    street_number: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    user_accounts_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_details',
  });
  return user_details;
};