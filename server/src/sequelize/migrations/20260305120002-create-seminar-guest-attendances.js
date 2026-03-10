'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seminar_guest_attendances', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      seminar_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'seminars', key: 'id' },
        onDelete: 'CASCADE',
      },
      guest_first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      guest_last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      guest_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      participation_level: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'passive',
      },
      marked_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seminar_guest_attendances');
  }
};