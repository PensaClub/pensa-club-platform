//courses seeder file
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const createdBy = users[0]?.id || 1;

    await queryInterface.bulkInsert('courses', [
      {
        id: 1,
        created_by: createdBy,
        slug: 'osnovi-na-kompyutra',
        name: 'Основи на компютъра',
        short_description: 'Научете се да работите уверено с компютър от нулата',
        description: `Този курс е създаден специално за хора, които искат да направят първите си стъпки в света на компютрите. 

Ще научите:
- Какво е компютър и от какви части се състои
- Как да включвате и изключвате компютъра правилно
- Работа с мишка и клавиатура
- Основни операции с файлове и папки
- Как да персонализирате работния плот

Курсът е подходящ за абсолютно начинаещи и не изисква предварителни знания.`,
        category: 'Дигитална грамотност',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example1',
        thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        duration_weeks: 4,
        estimated_hours: 8,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 40,
        credits_for_completion: 30,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 12,
        enrolled_count: 156,
        completed_count: 89,
        rating: 4.8,
        tags: '{компютър,начинаещи,windows,основи}',
        target_audience: '{Възрастни,Пенсионери,Начинаещи}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        created_by: createdBy,
        slug: 'elektronna-poshta',
        name: 'Електронна поща',
        short_description: 'Научете се да изпращате и получавате имейли с Gmail',
        description: `Курсът ще ви научи всичко необходимо за работа с електронна поща.

Теми в курса:
- Създаване на Gmail акаунт
- Изпращане и получаване на имейли
- Прикачване на файлове
- Организиране на входящата кутия
- Защита от спам и измами
- Работа с контакти

След завършване ще можете уверено да комуникирате по имейл.`,
        category: 'Дигитална грамотност',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example2',
        thumbnail_url: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800',
        duration_weeks: 3,
        estimated_hours: 6,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 35,
        credits_for_completion: 25,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 8,
        enrolled_count: 203,
        completed_count: 145,
        rating: 4.9,
        tags: '{имейл,gmail,поща,комуникация}',
        target_audience: '{Възрастни,Пенсионери,Начинаещи}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        created_by: createdBy,
        slug: 'internet-sigurnost',
        name: 'Интернет сигурност',
        short_description: 'Защитете се от онлайн измами и заплахи',
        description: `Научете как да се предпазите от най-честите онлайн заплахи.

В курса ще разгледаме:
- Как да разпознаваме фишинг имейли
- Създаване на сигурни пароли
- Двуфакторна автентикация
- Безопасно онлайн пазаруване
- Защита на личните данни
- Разпознаване на фалшиви сайтове

Курсът е задължителен за всеки, който използва интернет!`,
        category: 'Интернет сигурност',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example3',
        thumbnail_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
        duration_weeks: 3,
        estimated_hours: 5,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 30,
        credits_for_completion: 20,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 6,
        enrolled_count: 178,
        completed_count: 112,
        rating: 4.7,
        tags: '{сигурност,пароли,защита,фишинг}',
        target_audience: '{Всички,Начинаещи,Напреднали}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        created_by: createdBy,
        slug: 'viber-i-whatsapp',
        name: 'Viber и WhatsApp',
        short_description: 'Комуникирайте безплатно с близките си',
        description: `Научете се да използвате най-популярните приложения за съобщения.

Теми:
- Инсталиране на Viber и WhatsApp
- Изпращане на съобщения и снимки
- Гласови и видео разговори
- Създаване на групи
- Изпращане на документи
- Настройки за поверителност

Останете свързани с близките си безплатно!`,
        category: 'Мобилни устройства',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example4',
        thumbnail_url: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800',
        duration_weeks: 2,
        estimated_hours: 4,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 25,
        credits_for_completion: 20,
        has_certificate: false,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 6,
        enrolled_count: 234,
        completed_count: 189,
        rating: 4.9,
        tags: '{viber,whatsapp,съобщения,мобилни}',
        target_audience: '{Възрастни,Пенсионери}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        created_by: createdBy,
        slug: 'smartfon-za-nachinaeshti',
        name: 'Смартфон за начинаещи',
        short_description: 'Овладейте вашия смартфон с Android',
        description: `Пълно ръководство за работа с Android смартфон.

Ще научите:
- Основни жестове и навигация
- Настройки на телефона
- Инсталиране на приложения от Google Play
- Работа с камерата
- Управление на контакти
- Свързване с Wi-Fi
- Полезни приложения за ежедневието

Курсът е подходящ за всички, които имат смартфон, но не го използват пълноценно.`,
        category: 'Мобилни устройства',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example5',
        thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        duration_weeks: 4,
        estimated_hours: 7,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 35,
        credits_for_completion: 25,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 10,
        enrolled_count: 312,
        completed_count: 198,
        rating: 4.8,
        tags: '{смартфон,android,мобилни,приложения}',
        target_audience: '{Възрастни,Пенсионери,Начинаещи}',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {});
  },
};'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const createdBy = users[0]?.id || 1;

    await queryInterface.bulkInsert('courses', [
      {
        id: 1,
        created_by: createdBy,
        slug: 'osnovi-na-kompyutra',
        name: 'Основи на компютъра',
        short_description: 'Научете се да работите уверено с компютър от нулата',
        description: `Този курс е създаден специално за хора, които искат да направят първите си стъпки в света на компютрите. 

Ще научите:
- Какво е компютър и от какви части се състои
- Как да включвате и изключвате компютъра правилно
- Работа с мишка и клавиатура
- Основни операции с файлове и папки
- Как да персонализирате работния плот

Курсът е подходящ за абсолютно начинаещи и не изисква предварителни знания.`,
        category: 'Дигитална грамотност',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example1',
        thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        duration_weeks: 4,
        estimated_hours: 8,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 40,
        credits_for_completion: 30,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 12,
        enrolled_count: 156,
        completed_count: 89,
        rating: 4.8,
        tags: '{компютър,начинаещи,windows,основи}',
        target_audience: '{Възрастни,Пенсионери,Начинаещи}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        created_by: createdBy,
        slug: 'elektronna-poshta',
        name: 'Електронна поща',
        short_description: 'Научете се да изпращате и получавате имейли с Gmail',
        description: `Курсът ще ви научи всичко необходимо за работа с електронна поща.

Теми в курса:
- Създаване на Gmail акаунт
- Изпращане и получаване на имейли
- Прикачване на файлове
- Организиране на входящата кутия
- Защита от спам и измами
- Работа с контакти

След завършване ще можете уверено да комуникирате по имейл.`,
        category: 'Дигитална грамотност',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example2',
        thumbnail_url: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800',
        duration_weeks: 3,
        estimated_hours: 6,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 35,
        credits_for_completion: 25,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 8,
        enrolled_count: 203,
        completed_count: 145,
        rating: 4.9,
        tags: '{имейл,gmail,поща,комуникация}',
        target_audience: '{Възрастни,Пенсионери,Начинаещи}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        created_by: createdBy,
        slug: 'internet-sigurnost',
        name: 'Интернет сигурност',
        short_description: 'Защитете се от онлайн измами и заплахи',
        description: `Научете как да се предпазите от най-честите онлайн заплахи.

В курса ще разгледаме:
- Как да разпознаваме фишинг имейли
- Създаване на сигурни пароли
- Двуфакторна автентикация
- Безопасно онлайн пазаруване
- Защита на личните данни
- Разпознаване на фалшиви сайтове

Курсът е задължителен за всеки, който използва интернет!`,
        category: 'Интернет сигурност',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example3',
        thumbnail_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
        duration_weeks: 3,
        estimated_hours: 5,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 30,
        credits_for_completion: 20,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 6,
        enrolled_count: 178,
        completed_count: 112,
        rating: 4.7,
        tags: '{сигурност,пароли,защита,фишинг}',
        target_audience: '{Всички,Начинаещи,Напреднали}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        created_by: createdBy,
        slug: 'viber-i-whatsapp',
        name: 'Viber и WhatsApp',
        short_description: 'Комуникирайте безплатно с близките си',
        description: `Научете се да използвате най-популярните приложения за съобщения.

Теми:
- Инсталиране на Viber и WhatsApp
- Изпращане на съобщения и снимки
- Гласови и видео разговори
- Създаване на групи
- Изпращане на документи
- Настройки за поверителност

Останете свързани с близките си безплатно!`,
        category: 'Мобилни устройства',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example4',
        thumbnail_url: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800',
        duration_weeks: 2,
        estimated_hours: 4,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 25,
        credits_for_completion: 20,
        has_certificate: false,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 6,
        enrolled_count: 234,
        completed_count: 189,
        rating: 4.9,
        tags: '{viber,whatsapp,съобщения,мобилни}',
        target_audience: '{Възрастни,Пенсионери}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        created_by: createdBy,
        slug: 'smartfon-za-nachinaeshti',
        name: 'Смартфон за начинаещи',
        short_description: 'Овладейте вашия смартфон с Android',
        description: `Пълно ръководство за работа с Android смартфон.

Ще научите:
- Основни жестове и навигация
- Настройки на телефона
- Инсталиране на приложения от Google Play
- Работа с камерата
- Управление на контакти
- Свързване с Wi-Fi
- Полезни приложения за ежедневието

Курсът е подходящ за всички, които имат смартфон, но не го използват пълноценно.`,
        category: 'Мобилни устройства',
        course_type: 'recorded',
        difficulty_level: 'beginner',
        video_provider: 'youtube',
        trailer_url: 'https://www.youtube.com/watch?v=example5',
        thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        duration_weeks: 4,
        estimated_hours: 7,
        max_participants: null,
        requires_approval: false,
        is_public: true,
        max_credits: 35,
        credits_for_completion: 25,
        has_certificate: true,
        status: 'active',
        is_draft: false,
        published_at: new Date(),
        total_lessons: 10,
        enrolled_count: 312,
        completed_count: 198,
        rating: 4.8,
        tags: '{смартфон,android,мобилни,приложения}',
        target_audience: '{Възрастни,Пенсионери,Начинаещи}',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {});
  },
};