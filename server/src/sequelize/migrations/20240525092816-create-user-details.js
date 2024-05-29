'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('user_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      phone_number: {
        type: DataTypes.STRING(16),
        unique: true,
        allowNull: false,
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
      user_accounts_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id'
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('user_details');
  }
};