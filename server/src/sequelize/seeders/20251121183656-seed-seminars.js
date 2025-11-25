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

    await queryInterface.bulkInsert('seminars', [
      // COURSE 1
      { course_id: course1Id, title: 'Практически семинар - Работа с файлове', description: 'Копиране, преместване, изтриване', scheduled_date: new Date('2024-11-19'), duration_minutes: 120, max_credits: 20, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course1Id, title: 'Q&A сесия - Основи на компютъра', description: 'Отговори на въпроси', scheduled_date: new Date('2024-11-26'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },

      // COURSE 2
      { course_id: course2Id, title: 'Практика - Създаване на Facebook страница', description: 'Групов проект', scheduled_date: new Date('2024-11-18'), duration_minutes: 120, max_credits: 20, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course2Id, title: 'Безопасност в социалните мрежи', description: 'Казуси и решения', scheduled_date: new Date('2024-11-23'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },

      // COURSE 3
      { course_id: course3Id, title: 'Симулация на онлайн плащане', description: 'Практически упражнения', scheduled_date: new Date('2024-11-24'), duration_minutes: 120, max_credits: 20, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },

      // COURSE 4
      { course_id: course4Id, title: 'Анализ на реални фишинг атаки', description: 'Казуси от практиката', scheduled_date: new Date('2024-11-29'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course4Id, title: 'Настройване на защита на устройства', description: 'Антивирус, firewall, backup', scheduled_date: new Date('2024-12-02'), duration_minutes: 120, max_credits: 20, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
    ]);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('seminars', null, {});
  },
};