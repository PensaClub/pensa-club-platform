'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seminar_monthly_reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      generated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      seminars_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      attendees_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint('seminar_monthly_reports', {
      fields: ['month', 'year'],
      type: 'unique',
      name: 'seminar_monthly_reports_month_year_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seminar_monthly_reports');
  },
};
