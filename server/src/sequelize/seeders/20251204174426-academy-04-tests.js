'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const createdBy = users[0]?.id || 1;

    // Тестове към уроци
    await queryInterface.bulkInsert('lesson_tests', [
      {
        id: 1,
        lesson_id: 3, // Включване и изключване
        created_by: createdBy,
        title: 'Тест: Включване и изключване на компютъра',
        description: 'Проверете знанията си за правилното включване и изключване',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 5,
        attempts_count: 134,
        average_score: 82.5,
        pass_rate: 89.5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        lesson_id: 7, // Изпращане на първи имейл
        created_by: createdBy,
        title: 'Тест: Изпращане на имейли',
        description: 'Проверете дали знаете как да изпращате имейли правилно',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 5,
        attempts_count: 198,
        average_score: 85.3,
        pass_rate: 92.1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        lesson_id: 9, // Силни пароли
        created_by: createdBy,
        title: 'Тест: Създаване на сигурни пароли',
        description: 'Проверете знанията си за сигурност на паролите',
        passing_score: 80,
        max_attempts: 2,
        time_limit_minutes: 15,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 6,
        attempts_count: 134,
        average_score: 78.9,
        pass_rate: 85.2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Въпроси към тестовете
    await queryInterface.bulkInsert('test_questions', [
      // Тест 1: Включване и изключване
      {
        id: 1,
        test_id: 1,
        question_text: 'Какво трябва да направите преди да изключите компютъра?',
        question_type: 'single',
        answers: JSON.stringify([
          { id: 1, text: 'Да запазите всички отворени документи', isCorrect: true },
          { id: 2, text: 'Да изключите монитора', isCorrect: false },
          { id: 3, text: 'Да извадите кабела от контакта', isCorrect: false },
          { id: 4, text: 'Нищо специално', isCorrect: false },
        ]),
        explanation: 'Винаги запазвайте работата си преди изключване, за да не загубите данни.',
        points: 1,
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        test_id: 1,
        question_text: 'Кой е правилният начин за изключване на Windows компютър?',
        question_type: 'single',
        answers: JSON.stringify([
          { id: 1, text: 'Start → Shut down', isCorrect: true },
          { id: 2, text: 'Да изключите захранването от ключа', isCorrect: false },
          { id: 3, text: 'Да затворите капака на лаптопа', isCorrect: false },
          { id: 4, text: 'Да извадите батерията', isCorrect: false },
        ]),
        explanation: 'Използвайте Start менюто за правилно изключване.',
        points: 1,
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        test_id: 1,
        question_text: 'Вярно ли е, че компютърът може да се повреди при неправилно изключване?',
        question_type: 'true_false',
        answers: JSON.stringify([
          { id: 1, text: 'Вярно', isCorrect: true },
          { id: 2, text: 'Невярно', isCorrect: false },
        ]),
        explanation: 'Да, неправилното изключване може да доведе до загуба на данни и повреда на файлове.',
        points: 1,
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Тест 2: Изпращане на имейли
      {
        id: 4,
        test_id: 2,
        question_text: 'Какво означава полето "To" при писане на имейл?',
        question_type: 'single',
        answers: JSON.stringify([
          { id: 1, text: 'Получател на имейла', isCorrect: true },
          { id: 2, text: 'Тема на имейла', isCorrect: false },
          { id: 3, text: 'Подател на имейла', isCorrect: false },
          { id: 4, text: 'Прикачен файл', isCorrect: false },
        ]),
        explanation: 'Полето "To" е за имейл адреса на получателя.',
        points: 1,
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        test_id: 2,
        question_text: 'Какво е "Subject" в имейла?',
        question_type: 'single',
        answers: JSON.stringify([
          { id: 1, text: 'Темата на съобщението', isCorrect: true },
          { id: 2, text: 'Името на подателя', isCorrect: false },
          { id: 3, text: 'Датата на изпращане', isCorrect: false },
          { id: 4, text: 'Списък с получатели', isCorrect: false },
        ]),
        explanation: 'Subject е кратко описание на темата на имейла.',
        points: 1,
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Тест 3: Силни пароли
      {
        id: 6,
        test_id: 3,
        question_text: 'Коя от следните пароли е най-сигурна?',
        question_type: 'single',
        answers: JSON.stringify([
          { id: 1, text: 'K9#mP2$xLq!7', isCorrect: true },
          { id: 2, text: '123456', isCorrect: false },
          { id: 3, text: 'password', isCorrect: false },
          { id: 4, text: 'ivan1985', isCorrect: false },
        ]),
        explanation: 'Сигурната парола съдържа главни и малки букви, цифри и специални символи.',
        points: 2,
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        test_id: 3,
        question_text: 'Кои от следните са характеристики на силна парола?',
        question_type: 'multiple',
        answers: JSON.stringify([
          { id: 1, text: 'Съдържа поне 8 символа', isCorrect: true },
          { id: 2, text: 'Включва специални символи', isCorrect: true },
          { id: 3, text: 'Съдържа само малки букви', isCorrect: false },
          { id: 4, text: 'Комбинира букви и цифри', isCorrect: true },
        ]),
        explanation: 'Силната парола трябва да е дълга и да комбинира различни типове символи.',
        points: 2,
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('test_questions', null, {});
    await queryInterface.bulkDelete('lesson_tests', null, {});
  },
};