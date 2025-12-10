'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const createdBy = users[0]?.id || 1;

    const [mentors] = await queryInterface.sequelize.query(
      `SELECT id FROM mentors LIMIT 3`
    );
    const mentorId = mentors[0]?.id || null;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const inTwoWeeks = new Date(today);
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

    await queryInterface.bulkInsert('seminars', [
      {
        id: 1,
        course_id: 2,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'praktika-rabota-s-gmail',
        title: 'Практика: Работа с Gmail',
        short_description: 'Практическо занятие с реални упражнения за Gmail',
        description: `Присъствен семинар в Пенса клуб "Младост".

Какво ще правим:
- Създаване на Gmail акаунт (ако нямате)
- Изпращане на тестови имейли
- Прикачване на файлове
- Организиране на пощата с етикети
- Индивидуална помощ

Какво да носите:
- Документ за самоличност
- Телефон за двуфакторна автентикация
- По желание - собствен лаптоп`,
        category: 'Дигитална грамотност',
        seminar_type: 'workshop',
        is_online: false,
        location: 'Пенса клуб "Младост"',
        address: 'ж.к. Младост 1, бл. 123, партер, София',
        thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        scheduled_date: new Date(tomorrow.setHours(10, 0, 0, 0)),
        scheduled_end_date: new Date(tomorrow.setHours(12, 0, 0, 0)),
        duration_minutes: 120,
        timezone: 'Europe/Sofia',
        max_participants: 15,
        min_participants: 5,
        requires_registration: true,
        requires_approval: false,
        is_public: true,
        max_credits: 20,
        credits_for_attendance: 15,
        credits_for_participation: 3,
        credits_for_test: 2,
        has_test: true,
        test_passing_score: 70,
        has_assignment: false,
        status: 'scheduled',
        is_published: true,
        published_at: new Date(),
        registered_count: 8,
        attended_count: 0,
        views_count: 134,
        rating: null,
        tags: '{gmail,практика,присъствен,workshop}',
        prerequisites: 'Не се изискват предварителни знания',
        what_to_bring: 'Документ за самоличност, телефон',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        course_id: 3,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'workshop-silni-paroli',
        title: 'Workshop: Създаване на силни пароли',
        short_description: 'Интерактивен онлайн workshop за сигурност на паролите',
        description: `Онлайн workshop със споделен екран.

Програма:
- Защо паролите са важни
- Характеристики на силна парола
- Практика: създаваме пароли заедно
- Password managers - какво са и как работят
- Двуфакторна автентикация
- Q&A сесия

Ще работим в реално време - подгответе се да участвате активно!`,
        category: 'Интернет сигурност',
        seminar_type: 'workshop',
        is_online: true,
        meeting_link: 'https://meet.google.com/pass-word-123',
        meeting_password: 'secure2024',
        thumbnail_url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800',
        scheduled_date: new Date(nextWeek.setHours(18, 0, 0, 0)),
        scheduled_end_date: new Date(nextWeek.setHours(19, 30, 0, 0)),
        duration_minutes: 90,
        timezone: 'Europe/Sofia',
        max_participants: 30,
        min_participants: 5,
        requires_registration: true,
        requires_approval: false,
        is_public: true,
        max_credits: 18,
        credits_for_attendance: 12,
        credits_for_participation: 4,
        credits_for_test: 2,
        has_test: true,
        test_passing_score: 80,
        has_assignment: true,
        assignment_description: 'Създайте 3 сигурни пароли за различни сайтове и ги запишете в password manager',
        status: 'scheduled',
        is_published: true,
        published_at: new Date(),
        registered_count: 18,
        attended_count: 0,
        views_count: 89,
        rating: null,
        tags: '{пароли,сигурност,workshop,онлайн}',
        prerequisites: 'Завършен урок "Защо сигурността е важна"',
        what_to_bring: 'Компютър с интернет връзка',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        course_id: 5,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'smartfon-hands-on',
        title: 'Смартфон: Практическо занятие',
        short_description: 'Научете да използвате смартфона си с индивидуална помощ',
        description: `Присъствен семинар с индивидуално внимание.

Какво ще научите:
- Основни настройки на телефона
- Инсталиране на приложения
- Правене и изпращане на снимки
- Използване на Viber/WhatsApp
- Гласови команди и асистенти

Носете вашия смартфон - ще работим директно с него!`,
        category: 'Мобилни устройства',
        seminar_type: 'hands_on',
        is_online: false,
        location: 'Пенса клуб "Надежда"',
        address: 'ж.к. Надежда 2, бл. 234, партер, София',
        thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        scheduled_date: new Date(inTwoWeeks.setHours(14, 0, 0, 0)),
        scheduled_end_date: new Date(inTwoWeeks.setHours(16, 30, 0, 0)),
        duration_minutes: 150,
        timezone: 'Europe/Sofia',
        max_participants: 12,
        min_participants: 4,
        requires_registration: true,
        requires_approval: true,
        is_public: true,
        max_credits: 22,
        credits_for_attendance: 15,
        credits_for_participation: 5,
        credits_for_test: 2,
        has_test: false,
        has_assignment: true,
        assignment_description: 'Изпратете снимка на близък човек чрез Viber или WhatsApp',
        status: 'scheduled',
        is_published: true,
        published_at: new Date(),
        registered_count: 6,
        attended_count: 0,
        views_count: 67,
        rating: null,
        tags: '{смартфон,практика,присъствен,индивидуално}',
        prerequisites: 'Собствен смартфон с Android',
        what_to_bring: 'Вашият смартфон, заредена батерия',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        course_id: null,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'diskusiya-digitalni-umeniya',
        title: 'Дискусия: Дигитални умения в ежедневието',
        short_description: 'Споделете опит и научете от другите участници',
        description: `Групова дискусия за обмяна на опит.

Теми за обсъждане:
- Как използвате технологиите в ежедневието?
- Какви трудности срещате?
- Полезни съвети от опита на другите
- Какво искате да научите?

Няма лектор - всички участваме равноправно!`,
        category: 'Дигитална грамотност',
        seminar_type: 'discussion',
        is_online: true,
        meeting_link: 'https://meet.google.com/disc-uss-ion',
        thumbnail_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
        scheduled_date: new Date(nextWeek.setHours(16, 0, 0, 0)),
        scheduled_end_date: new Date(nextWeek.setHours(17, 30, 0, 0)),
        duration_minutes: 90,
        timezone: 'Europe/Sofia',
        max_participants: 20,
        min_participants: 5,
        requires_registration: true,
        requires_approval: false,
        is_public: true,
        max_credits: 12,
        credits_for_attendance: 8,
        credits_for_participation: 4,
        credits_for_test: 0,
        has_test: false,
        has_assignment: false,
        status: 'scheduled',
        is_published: true,
        published_at: new Date(),
        registered_count: 11,
        attended_count: 0,
        views_count: 45,
        rating: null,
        tags: '{дискусия,опит,общност,онлайн}',
        prerequisites: null,
        what_to_bring: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('seminars', null, {});
  },
};