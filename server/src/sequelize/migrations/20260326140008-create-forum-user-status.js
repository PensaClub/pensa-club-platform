'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [tables] = await queryInterface.sequelize.query(
      "SELECT tablename FROM pg_tables WHERE tablename IN ('forum_user_statuses', 'forum_punishment_logs')"
    );
    if (tables.length >= 2) return;

    // User status (role, ban, rules)
    await queryInterface.createTable('forum_user_statuses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('user', 'vip'),
        allowNull: false,
        defaultValue: 'user',
      },
      is_banned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ban_type: {
        type: Sequelize.ENUM('mute', 'restricted', 'temp_ban', 'perm_ban'),
        allowNull: true,
      },
      ban_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ban_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      banned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
      },
      warning_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rules_accepted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      vip_granted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      vip_granted_by: {
        type: Sequelize.ENUM('auto', 'admin'),
        allowNull: true,
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

    // Punishment log
    await queryInterface.createTable('forum_punishment_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      action: {
        type: Sequelize.ENUM('warning', 'mute', 'restrict', 'temp_ban', 'perm_ban', 'unban', 'vip_grant', 'vip_revoke'),
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      related_post_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'forum_posts', key: 'id' },
        onDelete: 'SET NULL',
      },
      related_comment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'forum_comments', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('forum_punishment_logs', ['user_id']);
    await queryInterface.addIndex('forum_user_statuses', ['is_banned']);
    await queryInterface.addIndex('forum_user_statuses', ['role']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forum_punishment_logs');
    await queryInterface.dropTable('forum_user_statuses');
  },
};
