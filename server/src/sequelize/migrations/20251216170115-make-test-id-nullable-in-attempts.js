'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE student_test_attempts 
      ALTER COLUMN test_id DROP NOT NULL;
    `);
    
    console.log('✅ student_test_attempts.test_id is now nullable');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE student_test_attempts 
      SET test_id = lecture_test_id 
      WHERE test_id IS NULL AND lecture_test_id IS NOT NULL;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE student_test_attempts 
      ALTER COLUMN test_id SET NOT NULL;
    `);
    
    console.log('✅ student_test_attempts.test_id is now NOT NULL again');
  },
};