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
      validate: {
        notEmpty: {
          args: true,
          msg: 'Phone number is required.'
        },
        len: {
          args: [8, 16],
          msg: 'Phone number must be between 8 and 16 characters.'
        },
        is: {
          args: /^(?:\+\d{7,15}|\d{10})$/,
          msg: 'Phone number format is invalid.'
        },
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Username is required.'
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
          msg: 'Region is required.'
        }
      }
    },
    municipality: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Municipality is required.'
        }
      }
    },
    settlement: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Settlement is required.'
        }
      }
    },
    work: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Work information is required.'
        }
      }
    },
    hobby: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Hobby information is required.'
        }
      }
    },
    interest: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Interest information is required.'
        }
      }
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'District is required.'
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
          msg: 'Street is required.'
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
          msg: 'Location information is required.'
        }
      }
    },
    user_accounts_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_details',
  });
  return user_details;
};