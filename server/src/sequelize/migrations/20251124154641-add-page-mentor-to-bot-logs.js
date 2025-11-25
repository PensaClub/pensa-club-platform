'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Обновяване на ENUM - добавяме 'page' и 'mentor'
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_bot_logs_content_type" ADD VALUE IF NOT EXISTS 'page';`,
        { transaction }
      );
      
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_bot_logs_content_type" ADD VALUE IF NOT EXISTS 'mentor';`,
        { transaction }
      );

      // 2. Добавяне на page_slug колона
      await queryInterface.addColumn(
        'bot_logs',
        'page_slug',
        {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Slug на статична страница (напр. "academy", "about")'
        },
        { transaction }
      );

      // 3. Добавяне на mentor_id колона
      await queryInterface.addColumn(
        'bot_logs',
        'mentor_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'mentors',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        { transaction }
      );

      // 4. Добавяне на индекси за по-бързо търсене
      await queryInterface.addIndex(
        'bot_logs',
        ['page_slug'],
        {
          name: 'idx_page_slug',
          transaction
        }
      );

      await queryInterface.addIndex(
        'bot_logs',
        ['mentor_id'],
        {
          name: 'idx_mentor_id',
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Премахване на индекси
      await queryInterface.removeIndex('bot_logs', 'idx_mentor_id', { transaction });
      await queryInterface.removeIndex('bot_logs', 'idx_page_slug', { transaction });

      // 2. Премахване на колони
      await queryInterface.removeColumn('bot_logs', 'mentor_id', { transaction });
      await queryInterface.removeColumn('bot_logs', 'page_slug', { transaction });

      // ЗАБЕЛЕЖКА: PostgreSQL НЕ поддържа REMOVE VALUE от ENUM
      // За да премахнете 'page' и 'mentor' от ENUM, трябва ръчно да пресъздадете типа

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};