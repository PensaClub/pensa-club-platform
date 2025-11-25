'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const courses = await queryInterface.sequelize.query(
      `SELECT id FROM courses ORDER BY id;`
    );
    
    const course1Id = courses[0][0]?.id;
    const course2Id = courses[0][1]?.id;
    const course3Id = courses[0][2]?.id;
    const course4Id = courses[0][3]?.id;

    const adminUser = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' ORDER BY id LIMIT 1;`
    );
    const adminId = adminUser[0][0]?.id || 1;

    await queryInterface.bulkInsert('presentations', [
      { course_id: course1Id, title: 'Финален проект - Моят първи имейл', description: 'Създайте имейл и изпратете съобщение', due_date: new Date('2024-12-01'), max_credits: 30, submission_type: 'text', status: 'active', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course2Id, title: 'Финален проект - Facebook профил и пост', description: 'Споделете снимка с описание', due_date: new Date('2024-11-30'), max_credits: 30, submission_type: 'text', status: 'active', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course3Id, title: 'Практически тест - Онлайн превод', description: 'Направете симулиран превод', due_date: new Date('2024-11-28'), max_credits: 25, submission_type: 'text', status: 'active', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course4Id, title: 'Анализ на заплаха', description: 'Опишете как бихте се защитили от конкретна атака', due_date: new Date('2024-12-05'), max_credits: 35, submission_type: 'text', status: 'active', created_by: adminId, created_at: new Date(), updated_at: new Date() },
    ]);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('presentations', null, {});
  },
};