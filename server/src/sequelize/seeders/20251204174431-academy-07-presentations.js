'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const createdBy = users[0]?.id || 1;

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await queryInterface.bulkInsert('presentations', [
      {
        id: 1,
        title: 'Как да разпознаем фалшиви новини',
        description: `Интерактивна презентация за медийна грамотност.

Ще научите:
- Какво са фалшивите новини
- 5 признака на фалшива новина
- Как да проверяваме източниците
- Полезни инструменти за проверка

Препоръчително време: ~20 минути`,
        course_id: null,
        due_date: nextMonth,
        max_credits: 8,
        submission_type: 'slides',
        status: 'active',
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: 'Електронно правителство - егов.бг',
        description: `Ръководство за използване на електронни услуги.

Теми:
- Какво е егов.бг
- Как да се регистрирате
- Издаване на удостоверения онлайн
- Проверка на здравен статус
- Данъчни услуги

Препоръчително време: ~30 минути`,
        course_id: null,
        due_date: nextMonth,
        max_credits: 10,
        submission_type: 'slides',
        status: 'active',
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        title: 'Безопасно онлайн пазаруване',
        description: `Научете как да пазарувате онлайн безопасно.

Включва:
- Надеждни сайтове за пазаруване
- Как да разпознаем измама
- Безопасно плащане
- Какво да правим при проблем
- Връщане на стоки

Препоръчително време: ~25 минути`,
        course_id: 3, // Интернет сигурност
        due_date: nextMonth,
        max_credits: 8,
        submission_type: 'slides',
        status: 'active',
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        title: 'Viber - пълно ръководство',
        description: `Всичко за Viber в една презентация.

Съдържание:
- Инсталиране и настройка
- Изпращане на съобщения
- Гласови и видео разговори
- Групи и общности
- Стикери и GIF-ове
- Настройки за поверителност

Препоръчително време: ~35 минути`,
        course_id: 4, // Viber и WhatsApp
        due_date: nextMonth,
        max_credits: 10,
        submission_type: 'slides',
        status: 'active',
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        title: 'Google Photos - организирайте снимките си',
        description: `Научете да използвате Google Photos.

Теми:
- Какво е Google Photos
- Автоматично архивиране
- Търсене в снимките
- Създаване на албуми
- Споделяне с близки
- Освобождаване на памет

Препоръчително време: ~20 минути`,
        course_id: 5, // Смартфон за начинаещи
        due_date: nextMonth,
        max_credits: 7,
        submission_type: 'slides',
        status: 'active',
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('presentations', null, {});
  },
};