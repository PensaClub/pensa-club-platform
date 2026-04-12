'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('drive_folder_passwords', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      folder_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Google Drive folder ID',
      },
      folder_name: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Folder name for display purposes',
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('drive_folder_passwords');
  },
};
