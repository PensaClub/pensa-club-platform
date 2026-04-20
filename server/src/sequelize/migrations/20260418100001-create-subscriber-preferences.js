'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriber_preferences', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      subscriber_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'subscribers', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addConstraint('subscriber_preferences', {
      fields: ['subscriber_id', 'category'],
      type: 'unique',
      name: 'subscriber_preferences_subscriber_category_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscriber_preferences');
  },
};
