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

    await queryInterface.bulkInsert('lectures', [
      // COURSE 1: Digital Basics
      { course_id: course1Id, title: 'Какво е компютър?', description: 'Основни компоненти и терминология', scheduled_date: new Date('2024-11-05'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course1Id, title: 'Работа с мишка и клавиатура', description: 'Практически упражнения', scheduled_date: new Date('2024-11-07'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course1Id, title: 'Интернет браузър - основи', description: 'Chrome, Firefox, Edge', scheduled_date: new Date('2024-11-10'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course1Id, title: 'Търсене в Google', description: 'Как ефективно да търсим информация', scheduled_date: new Date('2024-11-12'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course1Id, title: 'Създаване на имейл акаунт', description: 'Gmail, Yahoo, Abv.bg', scheduled_date: new Date('2024-11-15'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course1Id, title: 'Изпращане и получаване на имейли', description: 'Практика с прикачени файлове', scheduled_date: new Date('2024-11-17'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },

      // COURSE 2: Social Media
      { course_id: course2Id, title: 'Какво са социалните мрежи?', description: 'Преглед на популярни платформи', scheduled_date: new Date('2024-11-06'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course2Id, title: 'Създаване на Facebook профил', description: 'Стъпка по стъпка', scheduled_date: new Date('2024-11-08'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course2Id, title: 'Споделяне на снимки и статус', description: 'Как да публикуваме съдържание', scheduled_date: new Date('2024-11-11'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course2Id, title: 'Настройки за поверителност', description: 'Как да защитим профила си', scheduled_date: new Date('2024-11-13'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course2Id, title: 'Viber - инсталация и настройка', description: 'Мобилно приложение', scheduled_date: new Date('2024-11-16'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },

      // COURSE 3: Online Banking
      { course_id: course3Id, title: 'Въведение в онлайн банкиране', description: 'Видове услуги и безопасност', scheduled_date: new Date('2024-11-09'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course3Id, title: 'Регистрация в банков портал', description: 'Създаване на потребител', scheduled_date: new Date('2024-11-14'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course3Id, title: 'Преглед на сметка и операции', description: 'Как да четем извлечение', scheduled_date: new Date('2024-11-18'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course3Id, title: 'Плащане на сметки онлайн', description: 'Практически примери', scheduled_date: new Date('2024-11-21'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },

      // COURSE 4: Cyber Security
      { course_id: course4Id, title: 'Какво е киберсигурност?', description: 'Основни заплахи и рискове', scheduled_date: new Date('2024-11-20'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course4Id, title: 'Разпознаване на фишинг атаки', description: 'Примери и практика', scheduled_date: new Date('2024-11-22'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course4Id, title: 'Силни пароли и мениджъри', description: 'Как да създаваме и пазим пароли', scheduled_date: new Date('2024-11-25'), duration_minutes: 90, max_credits: 15, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { course_id: course4Id, title: 'Двуфакторна автентикация', description: 'Защо е важна и как работи', scheduled_date: new Date('2024-11-27'), duration_minutes: 60, max_credits: 10, status: 'completed', created_by: adminId, created_at: new Date(), updated_at: new Date() },
    ]);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lectures', null, {});
  },
};