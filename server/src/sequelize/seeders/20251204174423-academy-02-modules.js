'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('course_modules', [
      // Курс 1: Основи на компютъра
      {
        id: 1,
        course_id: 1,
        title: 'Въведение в компютрите',
        description: 'Запознайте се с основните понятия и компоненти на компютъра',
        sort_order: 1,
        status: 'published',
        is_published: true,
        lessons_count: 3,
        total_duration_minutes: 45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        course_id: 1,
        title: 'Мишка и клавиатура',
        description: 'Научете се да използвате основните входни устройства',
        sort_order: 2,
        status: 'published',
        is_published: true,
        lessons_count: 4,
        total_duration_minutes: 60,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        course_id: 1,
        title: 'Файлове и папки',
        description: 'Организирайте вашите документи и снимки',
        sort_order: 3,
        status: 'published',
        is_published: true,
        lessons_count: 5,
        total_duration_minutes: 75,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Курс 2: Електронна поща
      {
        id: 4,
        course_id: 2,
        title: 'Започване с Gmail',
        description: 'Създаване на акаунт и първи стъпки',
        sort_order: 1,
        status: 'published',
        is_published: true,
        lessons_count: 3,
        total_duration_minutes: 40,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        course_id: 2,
        title: 'Работа с имейли',
        description: 'Изпращане, получаване и организиране на имейли',
        sort_order: 2,
        status: 'published',
        is_published: true,
        lessons_count: 5,
        total_duration_minutes: 70,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Курс 3: Интернет сигурност
      {
        id: 6,
        course_id: 3,
        title: 'Основи на сигурността',
        description: 'Защо сигурността е важна и основни принципи',
        sort_order: 1,
        status: 'published',
        is_published: true,
        lessons_count: 2,
        total_duration_minutes: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        course_id: 3,
        title: 'Практическа защита',
        description: 'Конкретни стъпки за защита онлайн',
        sort_order: 2,
        status: 'published',
        is_published: true,
        lessons_count: 4,
        total_duration_minutes: 55,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('course_modules', null, {});
  },
};