'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('seminar_media', 'uploaded_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'user_accounts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.changeColumn('seminar_attendance_lists', 'uploaded_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'user_accounts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('seminar_media', 'uploaded_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'user_accounts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.changeColumn('seminar_attendance_lists', 'uploaded_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'user_accounts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
