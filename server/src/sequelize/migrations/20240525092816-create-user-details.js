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
      region: {
        type: DataTypes.STRING
      },
      municipality: {
        type: DataTypes.STRING
      },
      settlement: {
        type: DataTypes.STRING
      },
      work: {
        type: DataTypes.STRING
      },
      hobby: {
        type: DataTypes.STRING
      },
      interest: {
        type: DataTypes.STRING
      },
      district: {
        type: DataTypes.STRING
      },
      block: {
        type: DataTypes.STRING
      },
      street: {
        type: DataTypes.STRING
      },
      street_number: {
        type: DataTypes.STRING
      },
      location: {
        type: DataTypes.JSONB,
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