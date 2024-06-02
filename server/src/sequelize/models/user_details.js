"use strict";
const { Model } = require("sequelize");
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
        foreignKey: "user_accounts_id", // Foreign key in user_details table
        targetKey: "id", // Primary key in user_accounts table
      });
    }
  }
  user_details.init(
    {
      phone_number: {
        type: DataTypes.STRING(16),
        unique: true,
        validate: {
          notEmpty: {
            args: true,
            msg: "Phone number is required.",
          },
          len: {
            args: [8, 16],
            msg: "Phone number must be between 8 and 16 characters.",
          },
          is: {
            args: /^(?:\+\d{7,15}|\d{10})$/,
            msg: "Phone number format is invalid.",
          },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Username is required.",
          },
          len: {
            args: [6, 16],
            msg: "Username must be between 6 and 16 characters.",
          },
          is: {
            args: /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{6,16}$/,
            msg: "Username must start with a letter and can only contain letters, numbers, and underscores.",
          },
        },
      },
      first_name: {
        type: DataTypes.STRING(20),
        validate: {
          len: {
            args: [3, 20],
            msg: "First name must be between 3 and 20 characters in length.",
          },
          is: {
            args: /^[a-zA-Zа-яА-Я]{3,20}$/i,
            msg: "First name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.",
          },
          notEmpty: {
            msg: "First name cannot be empty.",
          },
        },
      },
      last_name: {
        type: DataTypes.STRING(20),
        validate: {
          len: {
            args: [3, 20],
            msg: "Last name must be between 3 and 20 characters in length.",
          },
          is: {
            args: /^[a-zA-Zа-яА-Я]{3,20}$/i,
            msg: "Last name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.",
          },
          notEmpty: {
            msg: "Last name cannot be empty.",
          },
        },
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Region is required.",
          },
        },
      },
      municipality: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Municipality is required.",
          },
        },
      },
      settlement: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Settlement is required.",
          },
        },
      },
      work: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error("Work must be an array of strings.");
            }
          },
        },
      },
      hobby: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error("Hobby must be an array of strings.");
            }
          },
        },
      },
      interest: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error("Interest must be an array of strings.");
            }
          },
        },
      },
      district: {
        type: DataTypes.STRING,
      },
      block: {
        type: DataTypes.STRING,
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Street is required.",
          },
        },
      },
      street_number: {
        type: DataTypes.STRING,
      },
      location: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Location information is required.",
          },
        },
      },
      user_accounts_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "user_details",
    }
  );
  return user_details;
};
