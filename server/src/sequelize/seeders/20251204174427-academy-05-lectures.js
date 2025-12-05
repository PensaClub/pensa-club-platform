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
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    await queryInterface.bulkInsert('lectures', [
      {
        id: 1,
        course_id: 3,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'zashtita-ot-online-izmami-live',
        title: 'Защита от онлайн измами',
        short_description: 'Научете как да разпознавате и избягвате най-честите онлайн измами',
        description: `В тази LIVE лекция ще разгледаме:
- Най-честите видове онлайн измами
- Как да разпознаете фишинг имейли
- Какво да правите ако станете жертва
- Въпроси и отговори на живо

Лекцията е подходяща за всички нива.`,
        category: 'Интернет сигурност',
        lecture_type: 'live',
        is_online: true,
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        video_provider: 'google_meet',
        thumbnail_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
        scheduled_date: new Date(today.setHours(19, 0, 0, 0)),
        scheduled_end_date: new Date(today.setHours(20, 30, 0, 0)),
        duration_minutes: 90,
        timezone: 'Europe/Sofia',
        max_participants: 100,
        requires_registration: true,
        is_public: true,
        max_credits: 15,
        credits_for_attendance: 10,
        credits_for_test: 5,
        has_test: true,
        test_passing_score: 70,
        status: 'scheduled',
        is_published: true,
        published_at: new Date(),
        registered_count: 67,
        attended_count: 0,
        views_count: 234,
        rating: null,
        tags: '{сигурност,измами,фишинг,live}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        course_id: 1,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'qa-sesiya-osnovi-kompyutar',
        title: 'Q&A Сесия: Въпроси за Модул 1',
        short_description: 'Задайте въпросите си на живо към лектора',
        description: `Интерактивна Q&A сесия за курса "Основи на компютъра".

Можете да зададете въпроси за:
- Всички теми от Модул 1
- Технически проблеми
- Допълнителни обяснения

Подгответе въпросите си предварително!`,
        category: 'Дигитална грамотност',
        lecture_type: 'live',
        is_online: true,
        meeting_link: 'https://meet.google.com/xyz-uvwx-yz',
        video_provider: 'google_meet',
        thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        scheduled_date: new Date(tomorrow.setHours(18, 0, 0, 0)),
        scheduled_end_date: new Date(tomorrow.setHours(19, 0, 0, 0)),
        duration_minutes: 60,
        timezone: 'Europe/Sofia',
        max_participants: 50,
        requires_registration: true,
        is_public: true,
        max_credits: 10,
        credits_for_attendance: 8,
        credits_for_test: 2,
        has_test: false,
        status: 'scheduled',
        is_published: true,
        published_at: new Date(),
        registered_count: 23,
        attended_count: 0,
        views_count: 89,
        rating: null,
        tags: '{Q&A,въпроси,компютър,live}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        course_id: null,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'smartfoni-za-nachinaeshti-live',
        title: 'Смартфони за начинаещи',
        short_description: 'Въведение в света на смартфоните',
        description: `Безплатна LIVE лекция за всички, които искат да научат основите на работа със смартфон.

Теми:
- Основни жестове и навигация
- Полезни приложения
- Настройки за по-лесна употреба

Подходящо за абсолютно начинаещи.`,
        category: 'Мобилни устройства',
        lecture_type: 'live',
        is_online: true,
        meeting_link: 'https://meet.google.com/phone-123',
        video_provider: 'google_meet',
        thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        scheduled_date: new Date(nextWeek.setHours(17, 0, 0, 0)),
        scheduled_end_date: new Date(nextWeek.setHours(18, 30, 0, 0)),
        duration_minutes: 90,
        timezone: 'Europe/Sofia',
        max_participants: 80,
        requires_registration: true,
        is_public: true,
        max_credits: 12,
        credits_for_attendance: 10,
        credits_for_test: 2,
        has_test: false,
        status: 'scheduled',
        is_published: true,
        published_at: new Date(),
        registered_count: 45,
        attended_count: 0,
        views_count: 156,
        rating: null,
        tags: '{смартфон,начинаещи,android,live}',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        course_id: 1,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'praktichesko-zanyatie-mishka',
        title: 'Практическо занятие: Работа с мишка',
        short_description: 'Запис от практическо занятие за работа с мишка',
        description: `Запис от LIVE практическо занятие.

В това занятие разгледахме:
- Правилно държане на мишката
- Ляв и десен бутон
- Двойно кликване
- Влачене (drag and drop)
- Скролиране

Можете да гледате записа по всяко време.`,
        category: 'Дигитална грамотност',
        lecture_type: 'recorded',
        is_online: true,
        video_provider: 'youtube',
        video_url: 'https://www.youtube.com/watch?v=recorded1',
        thumbnail_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
        scheduled_date: lastWeek,
        scheduled_end_date: new Date(lastWeek.getTime() + 45 * 60000),
        duration_minutes: 45,
        timezone: 'Europe/Sofia',
        max_participants: null,
        requires_registration: false,
        is_public: true,
        max_credits: 8,
        credits_for_attendance: 8,
        credits_for_test: 0,
        has_test: false,
        status: 'completed',
        is_published: true,
        published_at: lastWeek,
        registered_count: 56,
        attended_count: 43,
        views_count: 312,
        rating: 4.8,
        tags: '{мишка,практика,запис}',
        created_at: lastWeek,
        updated_at: new Date(),
      },
      {
        id: 5,
        course_id: 2,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'gmail-tips-tricks',
        title: 'Gmail съвети и трикове',
        short_description: 'Полезни съвети за по-ефективна работа с Gmail',
        description: `Запис от лекция с полезни съвети за Gmail:

- Клавишни комбинации
- Филтри и етикети
- Планиране на имейли
- Търсене в пощата
- Отмяна на изпратен имейл

Научете как да сте по-продуктивни с имейла!`,
        category: 'Дигитална грамотност',
        lecture_type: 'recorded',
        is_online: true,
        video_provider: 'youtube',
        video_url: 'https://www.youtube.com/watch?v=recorded2',
        thumbnail_url: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800',
        scheduled_date: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60000),
        duration_minutes: 55,
        timezone: 'Europe/Sofia',
        max_participants: null,
        requires_registration: false,
        is_public: true,
        max_credits: 10,
        credits_for_attendance: 10,
        credits_for_test: 0,
        has_test: false,
        status: 'completed',
        is_published: true,
        published_at: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60000),
        registered_count: 0,
        attended_count: 0,
        views_count: 456,
        rating: 4.9,
        tags: '{gmail,съвети,продуктивност,запис}',
        created_at: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60000),
        updated_at: new Date(),
      },
      {
        id: 6,
        course_id: null,
        mentor_id: mentorId,
        created_by: createdBy,
        slug: 'vavdenie-v-internet',
        title: 'Въведение в интернет',
        short_description: 'Какво е интернет и как да го използваме',
        description: `Основна лекция за начинаещи:

- Какво е интернет
- Как работи
- Браузъри - Chrome, Firefox, Edge
- Търсене с Google
- Безопасно сърфиране

Перфектна първа стъпка в онлайн света!`,
        category: 'Дигитална грамотност',
        lecture_type: 'recorded',
        is_online: true,
        video_provider: 'youtube',
        video_url: 'https://www.youtube.com/watch?v=recorded3',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        scheduled_date: new Date(lastWeek.getTime() - 14 * 24 * 60 * 60000),
        duration_minutes: 60,
        timezone: 'Europe/Sofia',
        max_participants: null,
        requires_registration: false,
        is_public: true,
        max_credits: 10,
        credits_for_attendance: 10,
        credits_for_test: 0,
        has_test: false,
        status: 'completed',
        is_published: true,
        published_at: new Date(lastWeek.getTime() - 14 * 24 * 60 * 60000),
        registered_count: 0,
        attended_count: 0,
        views_count: 678,
        rating: 4.7,
        tags: '{интернет,начинаещи,браузър,google}',
        created_at: new Date(lastWeek.getTime() - 14 * 24 * 60 * 60000),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lectures', null, {});
  },
};