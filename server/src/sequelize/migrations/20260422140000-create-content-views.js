'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('content_views', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      content_type: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      content_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      ip_hash: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      referer: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_bot: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('content_views', ['content_type', 'created_at'], {
      name: 'idx_content_views_type_created',
    });
    await queryInterface.addIndex('content_views', ['content_type', 'content_id'], {
      name: 'idx_content_views_type_id',
    });
    await queryInterface.addIndex('content_views', ['ip_hash', 'content_type', 'content_id', 'created_at'], {
      name: 'idx_content_views_dedupe',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('content_views');
  },
};
