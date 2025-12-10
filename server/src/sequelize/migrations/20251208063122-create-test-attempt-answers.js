'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_attempt_answers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'student_test_attempts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_questions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      answer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'test_answers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      text_answer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      points_earned: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      answered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes
    await queryInterface.addIndex('test_attempt_answers', ['attempt_id']);
    await queryInterface.addIndex('test_attempt_answers', ['question_id']);
    await queryInterface.addIndex('test_attempt_answers', ['answer_id']);
    
    // Unique constraint - един отговор на въпрос за опит
    await queryInterface.addIndex('test_attempt_answers', ['attempt_id', 'question_id'], {
      unique: true,
      name: 'unique_attempt_question',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('test_attempt_answers');
  },
};