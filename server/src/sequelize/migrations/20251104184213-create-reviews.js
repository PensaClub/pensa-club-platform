// server/src/sequelize/migrations/YYYYMMDDHHMMSS-create-reviews.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      review_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Тип на review: academy, mentor или course'
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID на ментор или курс (NULL за academy reviews)'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'participant или mentor'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user_accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user_accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('reviews', ['user_id']);
    await queryInterface.addIndex('reviews', ['review_type']);
    await queryInterface.addIndex('reviews', ['target_id']);
    await queryInterface.addIndex('reviews', ['status']);
    await queryInterface.addIndex('reviews', ['review_type', 'target_id']);
    await queryInterface.addIndex('reviews', ['user_id', 'review_type', 'target_id'], {
      name: 'idx_user_review_uniqueness'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reviews');
  }
};