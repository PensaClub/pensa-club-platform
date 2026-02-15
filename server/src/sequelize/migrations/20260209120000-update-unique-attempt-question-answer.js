'use strict';

module.exports = {
  async up(queryInterface) {
    // Махни стария constraint (attempt_id + question_id)
    await queryInterface.removeIndex('test_attempt_answers', 'unique_attempt_question');

    // Добави нов: (attempt_id + question_id + answer_id) — позволява множество отговори за multiple_choice
    await queryInterface.addIndex('test_attempt_answers', ['attempt_id', 'question_id', 'answer_id'], {
      unique: true,
      name: 'unique_attempt_question_answer',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('test_attempt_answers', 'unique_attempt_question_answer');
    await queryInterface.addIndex('test_attempt_answers', ['attempt_id', 'question_id'], {
      unique: true,
      name: 'unique_attempt_question',
    });
  },
};