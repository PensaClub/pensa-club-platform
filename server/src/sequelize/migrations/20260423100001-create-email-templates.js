'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_templates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      template_key: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
      },
      header_html: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      footer_html: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      logo_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      primary_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      secondary_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      signature: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
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

    await queryInterface.addIndex('email_templates', ['template_key'], {
      name: 'idx_email_templates_key',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_templates');
  },
};
