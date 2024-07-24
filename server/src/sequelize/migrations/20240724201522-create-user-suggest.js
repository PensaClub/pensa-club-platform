'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('user_suggest', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      phone_number: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Phone number is required.",
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
      name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        validate: {
          customValidator(value) {
            if (value && value.length > 0) {
              if (value.length < 3 || value.length > 20) {
                throw new Error("Name must be between 3 and 20 characters in length.");
              }
              if (!/^[a-zA-Zа-яА-Я0-9_\s]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                throw new Error("Name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.");
              }
            }
          },
        },
      },
      refferer_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        validate: {
          customValidator(value) {
            if (value && value.length > 0) {
              if (value.length < 3 || value.length > 20) {
                throw new Error("Name must be between 3 and 20 characters in length.");
              }
              if (!/^[a-zA-Zа-яА-Я0-9_\s]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                throw new Error("Name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.");
              }
            }
          },
        },
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },

      resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('user_suggest');
  }
};
