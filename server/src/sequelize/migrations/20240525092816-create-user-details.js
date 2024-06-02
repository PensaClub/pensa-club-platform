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
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Phone number cannot be empty.",
          },
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
            msg: "Street cannot be empty.",
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
            msg: "Location cannot be empty.",
          },
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
