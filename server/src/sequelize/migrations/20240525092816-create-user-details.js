"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("user_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
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
            msg: "Username cannot be empty.",
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
            msg: "Region cannot be empty.",
          },
        },
      },
      municipality: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Municipality cannot be empty.",
          },
        },
      },
      settlement: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Settlement cannot be empty.",
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
            msg: "Street cannot be empty.",
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
            msg: "Location cannot be empty.",
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
      user_accounts_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user_accounts",
          key: "id",
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
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable("user_details");
  },
};
