// server/sequelize/migrations/XXXXXX-add-is-mentor-to-user-accounts.js

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add is_mentor column
    await queryInterface.addColumn('user_accounts', 'is_mentor', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // 2. Update existing mentors to have is_mentor = true
    // Find all users with role = 'mentor' and set is_mentor = true
    await queryInterface.sequelize.query(`
      UPDATE user_accounts 
      SET is_mentor = true 
      WHERE role = 'mentor'
    `);

    // 3. Add index for better query performance
    await queryInterface.addIndex('user_accounts', ['is_mentor'], {
      name: 'idx_user_accounts_is_mentor'
    });

  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('user_accounts', 'idx_user_accounts_is_mentor');
    
    // Remove column
    await queryInterface.removeColumn('user_accounts', 'is_mentor');
    
  }
};