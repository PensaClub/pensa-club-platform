'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('user_ads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ad_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: 'Ad id is required.',
          },
          notEmpty: {
            msg: 'Ad id cannot be empty.',
          },
        },
      },
      summary: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
          len: {
            args: [4, 32],
            msg: 'Summary must be between 4 and 32 characters in length.',
          },
        },
      },
      category: {
        type: DataTypes.ENUM,
        values: ['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'],
        allowNull: true,
        defaultValue: null,
        validate: {
          isIn: {
            args: [['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration']],
            msg: 'Category must be one of the following: recommend, donate, sell, work, courses, health, initiatives_projects, tours, games or arbitration.',
          },
        },
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
          customValidator(value) {
            if (value.length < 10) {
              throw new Error('Description must be at least 10 characters long.');
            } else if (value.length > 1000) {
              throw new Error('Maximum description length limit of 1000 characters is reached.');
            }
          },
        },
      },
       ad_region: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Region is required.',
          },
        },
      },
      ad_subregion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Subregion is required.',
          },
        },
      },
      ad_town: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Town is required.',
          },
        },
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Street is required.',
          },
        },
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING(16)),
        allowNull: false,
        defaultValue: [],
        validate: {
          customValidator(value) {
            if (!Array.isArray(value)) {
              throw new Error('Tags must be an array.');
            }
            if (value.length > 5) {
              throw new Error('Tags array must contain between 0 to 5 elements.');
            }
            value.forEach((tag) => {
              if (typeof tag !== 'string' || tag.length > 16) {
                throw new Error('Each tag must be a string of max length 16.');
              }
            });
          },
        },
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isValidArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('Images must be an array.');
            }
            if (value.length > 4) {
              throw new Error('Cannot have more than 4 images per ad.');
            }
            if (value.length <= 0) {
              throw new Error('Each ad should contain at least 1 image.');
            }
            value.forEach((image) => {
              if (!image.imageURL || !image.firebaseImagePath) {
                throw new Error('Each image must have a url and a path.');
              }
            });
          },
        },
      },
      creation_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expiration_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: () => new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'approved', 'denied']],
            message: 'Invalid status type. Status must be approved, denied or pending.'
          },
        },
      },
      admin_comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      extra_fields: {
        type: DataTypes.JSONB,
        allowNull: true,
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
    await queryInterface.dropTable('user_ads');
  },
};
