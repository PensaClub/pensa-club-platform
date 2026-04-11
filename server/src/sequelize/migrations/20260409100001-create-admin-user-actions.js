'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admin_user_actions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      action_type: {
        type: Sequelize.ENUM(
          'lookup_user',
          'invite_user',
          'send_reset_link',
          'reset_completed',
          'reset_failed'
        ),
        allowNull: false,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      target_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      target_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('admin_user_actions', ['admin_id'], {
      name: 'admin_user_actions_admin_id_idx',
    });
    await queryInterface.addIndex('admin_user_actions', ['target_email'], {
      name: 'admin_user_actions_target_email_idx',
    });
    await queryInterface.addIndex('admin_user_actions', ['action_type'], {
      name: 'admin_user_actions_action_type_idx',
    });
    await queryInterface.addIndex('admin_user_actions', ['created_at'], {
      name: 'admin_user_actions_created_at_idx',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('admin_user_actions');
  },
};
