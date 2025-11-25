'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Добавяне на content_type колона (ENUM)
    await queryInterface.addColumn('bot_logs', 'content_type', {
      type: Sequelize.ENUM('article', 'project', 'initiative'),
      allowNull: false,
      defaultValue: 'article',
      comment: 'Тип на съдържанието: article, project, initiative'
    });

    // 2. Правим articleId и articleSlug nullable
    await queryInterface.changeColumn('bot_logs', 'articleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('bot_logs', 'articleSlug', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 3. Добавяне на project колони
    await queryInterface.addColumn('bot_logs', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('bot_logs', 'project_slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 4. Добавяне на initiative колони
    await queryInterface.addColumn('bot_logs', 'initiative_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'initiatives',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('bot_logs', 'initiative_slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 5. Добавяне на индекси
    await queryInterface.addIndex('bot_logs', ['bot', 'content_type'], {
      name: 'idx_bot_content_type'
    });

    await queryInterface.addIndex('bot_logs', ['timestamp'], {
      name: 'idx_timestamp'
    });

    await queryInterface.addIndex('bot_logs', ['articleId'], {
      name: 'idx_article_id'
    });

    await queryInterface.addIndex('bot_logs', ['project_id'], {
      name: 'idx_project_id'
    });

    await queryInterface.addIndex('bot_logs', ['initiative_id'], {
      name: 'idx_initiative_id'
    });

    console.log('✅ Migration: bot_logs table updated successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Премахване на индекси
    await queryInterface.removeIndex('bot_logs', 'idx_bot_content_type');
    await queryInterface.removeIndex('bot_logs', 'idx_timestamp');
    await queryInterface.removeIndex('bot_logs', 'idx_article_id');
    await queryInterface.removeIndex('bot_logs', 'idx_project_id');
    await queryInterface.removeIndex('bot_logs', 'idx_initiative_id');

    // Премахване на колони
    await queryInterface.removeColumn('bot_logs', 'initiative_slug');
    await queryInterface.removeColumn('bot_logs', 'initiative_id');
    await queryInterface.removeColumn('bot_logs', 'project_slug');
    await queryInterface.removeColumn('bot_logs', 'project_id');
    await queryInterface.removeColumn('bot_logs', 'content_type');

    // Връщане на articleId и articleSlug като NOT NULL
    await queryInterface.changeColumn('bot_logs', 'articleId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('bot_logs', 'articleSlug', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    console.log('✅ Rollback: bot_logs table reverted successfully!');
  }
};