'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('showcase_slides', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'custom',
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category_label: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      link_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      button_text: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Разгледай още',
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      duration_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 6,
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
    await queryInterface.dropTable('showcase_slides');
  },
};
