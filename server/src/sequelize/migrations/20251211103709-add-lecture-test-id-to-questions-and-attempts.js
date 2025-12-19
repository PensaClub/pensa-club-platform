'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // === TEST_QUESTIONS ===
    const [qCols] = await queryInterface.sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'test_questions' AND column_name = 'lecture_test_id'
    `);
    
    if (qCols.length === 0) {
      await queryInterface.addColumn('test_questions', 'lecture_test_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'lecture_tests', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      console.log('✅ Added lecture_test_id to test_questions');
    } else {
      console.log('⏭️ lecture_test_id already exists in test_questions');
    }

    // === STUDENT_TEST_ATTEMPTS ===
    const [aCols] = await queryInterface.sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'student_test_attempts' AND column_name = 'lecture_test_id'
    `);
    
    if (aCols.length === 0) {
      await queryInterface.addColumn('student_test_attempts', 'lecture_test_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'lecture_tests', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      console.log('✅ Added lecture_test_id to student_test_attempts');
    } else {
      console.log('⏭️ lecture_test_id already exists in student_test_attempts');
    }

    // === INDEXES ===
    try {
      const [qIdx] = await queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes WHERE tablename = 'test_questions' AND indexname LIKE '%lecture_test_id%'
      `);
      if (qIdx.length === 0) {
        await queryInterface.addIndex('test_questions', ['lecture_test_id']);
      }
      
      const [aIdx] = await queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes WHERE tablename = 'student_test_attempts' AND indexname LIKE '%lecture_test_id%'
      `);
      if (aIdx.length === 0) {
        await queryInterface.addIndex('student_test_attempts', ['lecture_test_id']);
      }
    } catch (e) {
      console.log('⏭️ Indexes already exist or could not be created');
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('test_questions', 'lecture_test_id');
    } catch (e) {}
    try {
      await queryInterface.removeColumn('student_test_attempts', 'lecture_test_id');
    } catch (e) {}
  },
};