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
          notEmpty: {
            msg: 'Phone number cannot be empty.'
          },
          len: {
            args: [8, 16],
            msg: 'Phone number has invalid number of characters.'
          },
          is: {
            args: /^(?:\+\d{7,15}|\d{10})$/,
            msg: 'Phone number must be a valid format.'
          },
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Username cannot be empty.'
          },
          len: {
            args: [6, 16],
            msg: 'Username must be between 6 and 16 characters.'
          },
          is: {
            args: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            msg: 'Username must start with a letter and can only contain letters, numbers, and underscores.'
          }
        }
      },
      first_name: {
        type: DataTypes.STRING(20),
        validate: {
          len: {
            args: [1, 20],
            msg: 'First name must be between 1 and 20 characters in length.',
          },
          is: {
            args: /^[a-zA-Z]+$/i,
            msg: 'First name can only contain letters.',
          },
          notEmpty: {
            msg: 'First name cannot be empty.'
          }
        },
      },
      last_name: {
        type: DataTypes.STRING(30),
        validate: {
          len: {
            args: [1, 30],
            msg: 'Last name must be between 1 and 30 characters in length.',
          },
          is: {
            args: /^[a-zA-Z]+$/i,
            msg: 'Last name can only contain letters.',
          },
          notEmpty: {
            msg: 'Last name cannot be empty.'
          }
        },
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Region cannot be empty.'
          }
        }
      },
      municipality: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Municipality cannot be empty.'
          }
        }
      },
      settlement: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Settlement cannot be empty.'
          }
        }
      },
      work: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Work cannot be empty.'
          }
        }
      },
      hobby: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Hobby cannot be empty.'
          }
        }
      },
      interest: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Interest cannot be empty.'
          }
        }
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'District cannot be empty.'
          }
        }
      },
      block: {
        type: DataTypes.STRING
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Street cannot be empty.'
          }
        }
      },
      street_number: {
        type: DataTypes.STRING,
      },
      location: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Location cannot be empty.'
          }
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
