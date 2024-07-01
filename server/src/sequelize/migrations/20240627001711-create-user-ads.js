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
        values: ['Donation', 'Sale', 'Service', 'Entertainment', 'Training', 'Event'],
        validate: {
          isIn: {
            args: [['Donation', 'Sale', 'Service', 'Entertainment', 'Training', 'Event']],
            msg: 'Category must be one of the following: donation, sale, service, entertainment, training or event.',
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
      ad_town: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ad_address: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isValidArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('Images must be an array.');
            }
            if (value.length > 5) {
              throw new Error('Cannot have more than 5 images per ad.');
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
      approved: {
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
    await queryInterface.dropTable('user_ads');
  },
};
