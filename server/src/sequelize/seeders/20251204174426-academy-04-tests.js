// server/src/sequelize/seeders/20251204174426-academy-04-tests.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM lesson_tests;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (parseInt(existing[0].count) > 0) {
      console.log('✅ Tests already seeded, skipping...');
      return;
    }

    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const createdBy = users[0]?.id || 1;

    // ===============================
    // 10 ТЕСТА за всички уроци с has_test: true
    // Lessons: 3, 7, 9, 11, 12, 17, 19, 21, 23, 27
    // ===============================
    await queryInterface.bulkInsert('lesson_tests', [
      {
        id: 1,
        lesson_id: 3,
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
        questions_count: 4,
        attempts_count: 134,
        average_score: 82.5,
        pass_rate: 89.5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        lesson_id: 7,
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
        questions_count: 4,
        attempts_count: 198,
        average_score: 85.3,
        pass_rate: 92.1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        lesson_id: 9,
        created_by: createdBy,
        title: 'Тест: Организиране на пощата',
        description: 'Проверете знанията си за етикети, папки и търсене в Gmail',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 4,
        attempts_count: 156,
        average_score: 80.2,
        pass_rate: 88.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        lesson_id: 11,
        created_by: createdBy,
        title: 'Тест: Видове онлайн заплахи',
        description: 'Проверете дали разпознавате вируси, фишинг и измами',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 12,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 4,
        attempts_count: 145,
        average_score: 76.8,
        pass_rate: 84.5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        lesson_id: 12,
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
        questions_count: 4,
        attempts_count: 134,
        average_score: 78.9,
        pass_rate: 85.2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        lesson_id: 17,
        created_by: createdBy,
        title: 'Тест: Гласови и видео разговори',
        description: 'Проверете знанията си за обаждания през Viber и WhatsApp',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 4,
        attempts_count: 167,
        average_score: 88.1,
        pass_rate: 93.4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        lesson_id: 19,
        created_by: createdBy,
        title: 'Тест: Настройки за поверителност',
        description: 'Проверете знанията си за защита на личната информация',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 4,
        attempts_count: 123,
        average_score: 81.5,
        pass_rate: 87.8,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 8,
        lesson_id: 21,
        created_by: createdBy,
        title: 'Тест: Навигация в Android',
        description: 'Проверете знанията си за работа с Android телефон',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 4,
        attempts_count: 234,
        average_score: 84.7,
        pass_rate: 91.2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 9,
        lesson_id: 23,
        created_by: createdBy,
        title: 'Тест: Полезни приложения',
        description: 'Проверете знанията си за популярни мобилни приложения',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 4,
        attempts_count: 189,
        average_score: 86.3,
        pass_rate: 90.5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 10,
        lesson_id: 27,
        created_by: createdBy,
        title: 'Тест: Браузър и търсене',
        description: 'Проверете знанията си за Chrome и Google търсене',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 10,
        shuffle_questions: true,
        shuffle_answers: true,
        show_correct_answers: true,
        max_credits: 5,
        status: 'active',
        is_published: true,
        questions_count: 4,
        attempts_count: 178,
        average_score: 83.9,
        pass_rate: 89.3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ===============================
    // ВЪПРОСИ - 4 на тест = 40 въпроса
    // ===============================
    await queryInterface.bulkInsert('test_questions', [
      // ==========================================
      // ТЕСТ 1: Включване и изключване (lesson 3)
      // ==========================================
      { id: 1, test_id: 1, question_text: 'Какво трябва да направите преди да изключите компютъра?', question_type: 'single', explanation: 'Винаги запазвайте работата си преди изключване.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2, test_id: 1, question_text: 'Кой е правилният начин за изключване на Windows компютър?', question_type: 'single', explanation: 'Използвайте Start менюто за правилно изключване.', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3, test_id: 1, question_text: 'Вярно ли е, че компютърът може да се повреди при неправилно изключване?', question_type: 'true_false', explanation: 'Да, неправилното изключване може да доведе до загуба на данни.', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 4, test_id: 1, question_text: 'Какво означава "Sleep" режим?', question_type: 'single', explanation: 'Sleep режимът пести енергия, но запазва работата ви в паметта.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 2: Изпращане на имейли (lesson 7)
      // ==========================================
      { id: 5, test_id: 2, question_text: 'Какво означава полето "To" при писане на имейл?', question_type: 'single', explanation: 'Полето "To" е за имейл адреса на получателя.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 6, test_id: 2, question_text: 'Какво е "Subject" в имейла?', question_type: 'single', explanation: 'Subject е кратко описание на темата на имейла.', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 7, test_id: 2, question_text: 'Какво означава "CC" в имейл?', question_type: 'single', explanation: 'CC (Carbon Copy) изпраща копие на други хора.', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 8, test_id: 2, question_text: 'Вярно ли е, че можете да изпратите имейл до няколко човека едновременно?', question_type: 'true_false', explanation: 'Да, можете да добавите няколко адреса в полето To или CC.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 3: Организиране на пощата (lesson 9)
      // ==========================================
      { id: 9, test_id: 3, question_text: 'За какво служат етикетите (labels) в Gmail?', question_type: 'single', explanation: 'Етикетите помагат да организирате имейлите по категории.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 10, test_id: 3, question_text: 'Как можете да намерите стар имейл в Gmail?', question_type: 'single', explanation: 'Използвайте полето за търсене в горната част.', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 11, test_id: 3, question_text: 'Какво се случва когато архивирате имейл?', question_type: 'single', explanation: 'Имейлът се премества от Inbox, но не се изтрива.', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 12, test_id: 3, question_text: 'Вярно ли е, че изтритите имейли отиват в кошчето за 30 дни?', question_type: 'true_false', explanation: 'Да, имейлите остават в Trash 30 дни преди окончателно изтриване.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 4: Видове онлайн заплахи (lesson 11)
      // ==========================================
      { id: 13, test_id: 4, question_text: 'Какво е "фишинг" (phishing)?', question_type: 'single', explanation: 'Фишингът е опит за кражба на лични данни чрез измамни съобщения.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 14, test_id: 4, question_text: 'Кое от следните е признак на фишинг имейл?', question_type: 'multiple', explanation: 'Фишинг имейлите често имат грешки и подозрителни линкове.', points: 2, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 15, test_id: 4, question_text: 'Какво е компютърен вирус?', question_type: 'single', explanation: 'Вирусът е зловреден софтуер, който може да повреди компютъра.', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 16, test_id: 4, question_text: 'Вярно ли е, че антивирусната програма ви защитава напълно?', question_type: 'true_false', explanation: 'Не, антивирусът помага, но не е 100% защита.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 5: Създаване на сигурни пароли (lesson 12)
      // ==========================================
      { id: 17, test_id: 5, question_text: 'Коя от следните пароли е най-сигурна?', question_type: 'single', explanation: 'Сигурната парола съдържа букви, цифри и специални символи.', points: 2, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 18, test_id: 5, question_text: 'Кои са характеристики на силна парола?', question_type: 'multiple', explanation: 'Силната парола е дълга и комбинира различни типове символи.', points: 2, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 19, test_id: 5, question_text: 'Колко символа минимум трябва да има сигурна парола?', question_type: 'single', explanation: 'Препоръчват се поне 8 символа за сигурна парола.', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 20, test_id: 5, question_text: 'Вярно ли е, че трябва да използвате различни пароли за различни сайтове?', question_type: 'true_false', explanation: 'Да, това предпазва другите ви акаунти ако една парола бъде открита.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 6: Гласови и видео разговори (lesson 17)
      // ==========================================
      { id: 21, test_id: 6, question_text: 'Какво е необходимо за видео разговор?', question_type: 'multiple', explanation: 'За видео разговор трябва камера, микрофон и интернет.', points: 2, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 22, test_id: 6, question_text: 'Безплатни ли са обажданията през Viber?', question_type: 'single', explanation: 'Обажданията Viber към Viber са безплатни през интернет.', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 23, test_id: 6, question_text: 'Какво да направите ако не ви чуват по време на разговор?', question_type: 'single', explanation: 'Проверете дали микрофонът не е изключен (muted).', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 24, test_id: 6, question_text: 'Вярно ли е, че видео разговорите харчат повече интернет от гласовите?', question_type: 'true_false', explanation: 'Да, видеото изисква повече данни от само аудио.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 7: Настройки за поверителност (lesson 19)
      // ==========================================
      { id: 25, test_id: 7, question_text: 'Какво контролира настройката "Last seen"?', question_type: 'single', explanation: 'Показва кога за последно сте били онлайн.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 26, test_id: 7, question_text: 'Кой може да вижда профилната ви снимка по подразбиране?', question_type: 'single', explanation: 'По подразбиране всички могат да я видят.', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 27, test_id: 7, question_text: 'Какво е двуфакторна автентикация?', question_type: 'single', explanation: 'Допълнителна защита с код освен паролата.', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 28, test_id: 7, question_text: 'Вярно ли е, че можете да блокирате нежелани контакти?', question_type: 'true_false', explanation: 'Да, всички месинджъри имат опция за блокиране.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 8: Навигация в Android (lesson 21)
      // ==========================================
      { id: 29, test_id: 8, question_text: 'Какво е началният екран (Home screen)?', question_type: 'single', explanation: 'Основният екран, който виждате когато отключите телефона.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 30, test_id: 8, question_text: 'Как се връщате на началния екран?', question_type: 'single', explanation: 'Натиснете бутона Home (кръгче или жест нагоре).', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 31, test_id: 8, question_text: 'Какво показва лентата за известия?', question_type: 'multiple', explanation: 'Показва нови съобщения, обаждания и системна информация.', points: 2, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 32, test_id: 8, question_text: 'Вярно ли е, че можете да преместите иконите на началния екран?', question_type: 'true_false', explanation: 'Да, задръжте иконата и я плъзнете.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 9: Полезни приложения (lesson 23)
      // ==========================================
      { id: 33, test_id: 9, question_text: 'За какво служи Google Maps?', question_type: 'single', explanation: 'За навигация и намиране на места.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 34, test_id: 9, question_text: 'Кое приложение е за видео разговори?', question_type: 'multiple', explanation: 'Viber, WhatsApp, Skype и други поддържат видео.', points: 2, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 35, test_id: 9, question_text: 'Какво е YouTube?', question_type: 'single', explanation: 'Платформа за гледане и споделяне на видеа.', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 36, test_id: 9, question_text: 'Вярно ли е, че всички приложения в Play Store са безплатни?', question_type: 'true_false', explanation: 'Не, има и платени приложения.', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 10: Браузър и търсене (lesson 27)
      // ==========================================
      { id: 37, test_id: 10, question_text: 'Какво е браузър?', question_type: 'single', explanation: 'Програма за разглеждане на уебсайтове.', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 38, test_id: 10, question_text: 'Как търсите информация в Google?', question_type: 'single', explanation: 'Напишете ключови думи в полето за търсене.', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 39, test_id: 10, question_text: 'Какво означава иконата със звездичка в браузъра?', question_type: 'single', explanation: 'Добавяне на страница към отметки (bookmarks).', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 40, test_id: 10, question_text: 'Вярно ли е, че можете да отворите няколко уебсайта едновременно?', question_type: 'true_false', explanation: 'Да, използвайте различни табове (раздели).', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // ===============================
    // ОТГОВОРИ - 4 на въпрос = 160 отговора
    // ===============================
    await queryInterface.bulkInsert('test_answers', [
      // ==========================================
      // ТЕСТ 1: Включване и изключване
      // ==========================================
      // Въпрос 1
      { id: 1, question_id: 1, answer_text: 'Да запазите всички отворени документи', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 2, question_id: 1, answer_text: 'Да изключите монитора', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 3, question_id: 1, answer_text: 'Да извадите кабела от контакта', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 4, question_id: 1, answer_text: 'Нищо специално', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 2
      { id: 5, question_id: 2, answer_text: 'Start → Shut down', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 6, question_id: 2, answer_text: 'Да изключите захранването от ключа', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 7, question_id: 2, answer_text: 'Да затворите капака на лаптопа', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 8, question_id: 2, answer_text: 'Да извадите батерията', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 3 (true/false)
      { id: 9, question_id: 3, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 10, question_id: 3, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      // Въпрос 4
      { id: 11, question_id: 4, answer_text: 'Компютърът пести енергия, но запазва работата в паметта', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 12, question_id: 4, answer_text: 'Компютърът се изключва напълно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 13, question_id: 4, answer_text: 'Компютърът рестартира', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 14, question_id: 4, answer_text: 'Компютърът изтрива всички файлове', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 2: Изпращане на имейли
      // ==========================================
      // Въпрос 5
      { id: 15, question_id: 5, answer_text: 'Получател на имейла', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 16, question_id: 5, answer_text: 'Тема на имейла', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 17, question_id: 5, answer_text: 'Подател на имейла', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 18, question_id: 5, answer_text: 'Прикачен файл', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 6
      { id: 19, question_id: 6, answer_text: 'Темата на съобщението', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 20, question_id: 6, answer_text: 'Името на подателя', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 21, question_id: 6, answer_text: 'Датата на изпращане', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 22, question_id: 6, answer_text: 'Списък с получатели', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 7
      { id: 23, question_id: 7, answer_text: 'Копие до други получатели', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 24, question_id: 7, answer_text: 'Скрито копие', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 25, question_id: 7, answer_text: 'Отговор на имейл', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 26, question_id: 7, answer_text: 'Препращане на имейл', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 8 (true/false)
      { id: 27, question_id: 8, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 28, question_id: 8, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 3: Организиране на пощата
      // ==========================================
      // Въпрос 9
      { id: 29, question_id: 9, answer_text: 'За организиране на имейли по категории', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 30, question_id: 9, answer_text: 'За изтриване на имейли', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 31, question_id: 9, answer_text: 'За блокиране на спам', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 32, question_id: 9, answer_text: 'За промяна на паролата', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 10
      { id: 33, question_id: 10, answer_text: 'Чрез полето за търсене в горната част', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 34, question_id: 10, answer_text: 'Като изтриете всички нови имейли', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 35, question_id: 10, answer_text: 'Като рестартирате браузъра', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 36, question_id: 10, answer_text: 'Не може да се търсят стари имейли', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 11
      { id: 37, question_id: 11, answer_text: 'Премества се от Inbox, но не се изтрива', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 38, question_id: 11, answer_text: 'Изтрива се завинаги', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 39, question_id: 11, answer_text: 'Изпраща се на всички контакти', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 40, question_id: 11, answer_text: 'Маркира се като спам', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 12 (true/false)
      { id: 41, question_id: 12, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 42, question_id: 12, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 4: Видове онлайн заплахи
      // ==========================================
      // Въпрос 13
      { id: 43, question_id: 13, answer_text: 'Опит за кражба на лични данни чрез измамни съобщения', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 44, question_id: 13, answer_text: 'Вид компютърен вирус', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 45, question_id: 13, answer_text: 'Програма за защита', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 46, question_id: 13, answer_text: 'Начин за ускоряване на компютъра', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 14 (multiple)
      { id: 47, question_id: 14, answer_text: 'Граматически грешки в текста', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 48, question_id: 14, answer_text: 'Подозрителен линк', is_correct: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 49, question_id: 14, answer_text: 'Искане за лични данни', is_correct: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 50, question_id: 14, answer_text: 'Професионален дизайн', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 15
      { id: 51, question_id: 15, answer_text: 'Зловреден софтуер, който може да повреди компютъра', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 52, question_id: 15, answer_text: 'Полезна програма за почистване', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 53, question_id: 15, answer_text: 'Тип интернет връзка', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 54, question_id: 15, answer_text: 'Медицински термин', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 16 (true/false)
      { id: 55, question_id: 16, answer_text: 'Вярно', is_correct: false, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 56, question_id: 16, answer_text: 'Невярно', is_correct: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 5: Създаване на сигурни пароли
      // ==========================================
      // Въпрос 17
      { id: 57, question_id: 17, answer_text: 'K9#mP2$xLq!7', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 58, question_id: 17, answer_text: '123456', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 59, question_id: 17, answer_text: 'password', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 60, question_id: 17, answer_text: 'ivan1985', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 18 (multiple)
      { id: 61, question_id: 18, answer_text: 'Съдържа поне 8 символа', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 62, question_id: 18, answer_text: 'Включва специални символи', is_correct: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 63, question_id: 18, answer_text: 'Съдържа само малки букви', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 64, question_id: 18, answer_text: 'Комбинира букви и цифри', is_correct: true, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 19
      { id: 65, question_id: 19, answer_text: 'Поне 8 символа', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 66, question_id: 19, answer_text: '4 символа', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 67, question_id: 19, answer_text: '2 символа', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 68, question_id: 19, answer_text: 'Няма значение', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 20 (true/false)
      { id: 69, question_id: 20, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 70, question_id: 20, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 6: Гласови и видео разговори
      // ==========================================
      // Въпрос 21 (multiple)
      { id: 71, question_id: 21, answer_text: 'Камера', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 72, question_id: 21, answer_text: 'Микрофон', is_correct: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 73, question_id: 21, answer_text: 'Интернет връзка', is_correct: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 74, question_id: 21, answer_text: 'Принтер', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 22
      { id: 75, question_id: 22, answer_text: 'Да, обажданията Viber към Viber са безплатни', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 76, question_id: 22, answer_text: 'Не, всички обаждания се таксуват', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 77, question_id: 22, answer_text: 'Само първите 5 минути са безплатни', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 78, question_id: 22, answer_text: 'Безплатни са само в България', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 23
      { id: 79, question_id: 23, answer_text: 'Проверете дали микрофонът не е изключен', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 80, question_id: 23, answer_text: 'Рестартирайте компютъра', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 81, question_id: 23, answer_text: 'Изтрийте приложението', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 82, question_id: 23, answer_text: 'Говорете по-силно', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 24 (true/false)
      { id: 83, question_id: 24, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 84, question_id: 24, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 7: Настройки за поверителност
      // ==========================================
      // Въпрос 25
      { id: 85, question_id: 25, answer_text: 'Кога за последно сте били онлайн', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 86, question_id: 25, answer_text: 'Колко съобщения сте изпратили', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 87, question_id: 25, answer_text: 'Вашата профилна снимка', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 88, question_id: 25, answer_text: 'Вашия телефонен номер', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 26
      { id: 89, question_id: 26, answer_text: 'Всички', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 90, question_id: 26, answer_text: 'Само контактите ми', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 91, question_id: 26, answer_text: 'Никой', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 92, question_id: 26, answer_text: 'Само аз', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 27
      { id: 93, question_id: 27, answer_text: 'Допълнителна защита с код освен паролата', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 94, question_id: 27, answer_text: 'Две различни пароли', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 95, question_id: 27, answer_text: 'Два акаунта едновременно', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 96, question_id: 27, answer_text: 'Двойно криптиране', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 28 (true/false)
      { id: 97, question_id: 28, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 98, question_id: 28, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 8: Навигация в Android
      // ==========================================
      // Въпрос 29
      { id: 99, question_id: 29, answer_text: 'Основният екран при отключване на телефона', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 100, question_id: 29, answer_text: 'Екранът за обаждания', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 101, question_id: 29, answer_text: 'Настройките на телефона', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 102, question_id: 29, answer_text: 'Списъкът с контакти', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 30
      { id: 103, question_id: 30, answer_text: 'Натиснете бутона Home', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 104, question_id: 30, answer_text: 'Рестартирайте телефона', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 105, question_id: 30, answer_text: 'Извадете батерията', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 106, question_id: 30, answer_text: 'Натиснете бутона за звук', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 31 (multiple)
      { id: 107, question_id: 31, answer_text: 'Нови съобщения', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 108, question_id: 31, answer_text: 'Пропуснати обаждания', is_correct: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 109, question_id: 31, answer_text: 'Състояние на батерията', is_correct: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 110, question_id: 31, answer_text: 'Вашите снимки', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 32 (true/false)
      { id: 111, question_id: 32, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 112, question_id: 32, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 9: Полезни приложения
      // ==========================================
      // Въпрос 33
      { id: 113, question_id: 33, answer_text: 'За навигация и намиране на места', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 114, question_id: 33, answer_text: 'За слушане на музика', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 115, question_id: 33, answer_text: 'За изпращане на имейли', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 116, question_id: 33, answer_text: 'За редактиране на снимки', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 34 (multiple)
      { id: 117, question_id: 34, answer_text: 'Viber', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 118, question_id: 34, answer_text: 'WhatsApp', is_correct: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 119, question_id: 34, answer_text: 'Skype', is_correct: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 120, question_id: 34, answer_text: 'Calculator', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 35
      { id: 121, question_id: 35, answer_text: 'Платформа за гледане на видеа', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 122, question_id: 35, answer_text: 'Социална мрежа за снимки', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 123, question_id: 35, answer_text: 'Приложение за музика', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 124, question_id: 35, answer_text: 'Онлайн магазин', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 36 (true/false)
      { id: 125, question_id: 36, answer_text: 'Вярно', is_correct: false, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 126, question_id: 36, answer_text: 'Невярно', is_correct: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // ==========================================
      // ТЕСТ 10: Браузър и търсене
      // ==========================================
      // Въпрос 37
      { id: 127, question_id: 37, answer_text: 'Програма за разглеждане на уебсайтове', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 128, question_id: 37, answer_text: 'Програма за редактиране на текст', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 129, question_id: 37, answer_text: 'Антивирусна програма', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 130, question_id: 37, answer_text: 'Програма за снимки', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 38
      { id: 131, question_id: 38, answer_text: 'Напишете ключови думи в полето за търсене', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 132, question_id: 38, answer_text: 'Обадете се на Google', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 133, question_id: 38, answer_text: 'Изпратете имейл', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 134, question_id: 38, answer_text: 'Натиснете бутона Home', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 39
      { id: 135, question_id: 39, answer_text: 'Добавяне към отметки (bookmarks)', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 136, question_id: 39, answer_text: 'Изтриване на страницата', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 137, question_id: 39, answer_text: 'Споделяне в социални мрежи', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 138, question_id: 39, answer_text: 'Отпечатване', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      // Въпрос 40 (true/false)
      { id: 139, question_id: 40, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 140, question_id: 40, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
    ]);

    console.log('✅ Tests seeded: 10 tests, 40 questions, 140 answers');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('test_answers', null, {});
    await queryInterface.bulkDelete('test_questions', null, {});
    await queryInterface.bulkDelete('lesson_tests', null, {});
  },
};