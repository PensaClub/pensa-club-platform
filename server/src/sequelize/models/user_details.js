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
        as: "account",
      });
    }
  }
  user_details.init(
    {
      phone_number: {
        type: DataTypes.STRING(16),
        allowNull: true,
        defaultValue: null,
        validate: {
          len: {
            args: [8, 16],
            msg: "Phone number has invalid number of characters.",
          },
          is: {
            args: /^(?:\+\d{7,15}|\d{10})$/,
            msg: "Phone number must be a valid format.",
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
        allowNull: true,
        defaultValue: null,
        validate: {
          customValidator(value) {
            if (value && value.length > 0) {
              if (value.length < 3 || value.length > 20) {
                throw new Error("First name must be between 3 and 20 characters in length.");
              }
              if (!/^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                throw new Error("First name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.");
              }
            }
          },
        },
      },
      last_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        validate: {
          customValidator(value) {
            if (value && value.length > 0) {
              if (value.length < 3 || value.length > 20) {
                throw new Error("Last name must be between 3 and 20 characters in length.");
              }
              if (!/^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                throw new Error("Last name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.");
              }
            }
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
      work_options: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error("Work options must be an array of strings.");
            }
          },
        },
      },
      skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error("Skills must be an array of strings.");
            }
          },
        },
      },
      interest_options: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error("Interest options must be an array of strings.");
            }
          },
        },
      },
      district: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      block: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
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
        allowNull: true,
        defaultValue: null,
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
      gender: {
        type: DataTypes.ENUM,
        values: ["male", "female", "other"],
        allowNull: true,
        defaultValue: null,
        validate: {
          isIn: {
            args: [["male", "female", "other"]],
            msg: "Gender must be 'male', 'female', or 'other'.",
          },
        },
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        defaultValue: null,
        allowNull: true,
        validate: {
          isDate: true,
          isNotInFuture(value) {
            if (new Date(value) > new Date()) {
              throw new Error("Date cannot be in the future.");
            }
          },
        },
      },
      imageURL: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        validate: {
          isUrl: true,
        },
      },
      firebase_image_path: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
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
