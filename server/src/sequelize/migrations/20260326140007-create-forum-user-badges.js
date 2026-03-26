'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [tables] = await queryInterface.sequelize.query(
      "SELECT tablename FROM pg_tables WHERE tablename = 'forum_user_badges'"
    );
    if (tables.length > 0) return;

    await queryInterface.createTable('forum_user_badges', {
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
      badge: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      awarded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addConstraint('forum_user_badges', {
      fields: ['user_id', 'badge'],
      type: 'unique',
      name: 'forum_user_badges_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forum_user_badges');
  },
};
