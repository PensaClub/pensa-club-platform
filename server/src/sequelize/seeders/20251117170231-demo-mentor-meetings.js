'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ===============================
    // ВЗЕМИ MENTOR IDs
    // ===============================
    const mentors = await queryInterface.sequelize.query(
      `SELECT m.id, u.email FROM mentors m 
       JOIN user_accounts u ON m.user_id = u.id 
       WHERE u.email IN ('mentor1@example.com', 'mentor2@example.com', 'mentor3@example.com')
       ORDER BY u.email;`
    );

    const mentor1Id = mentors[0][0]?.id;
    const mentor2Id = mentors[0][1]?.id;
    const mentor3Id = mentors[0][2]?.id;

    // ===============================
    // ВЗЕМИ STUDENT IDs
    // ===============================
    const students = await queryInterface.sequelize.query(
      `SELECT s.id, u.email FROM students s 
       JOIN user_accounts u ON s.user_id = u.id 
       WHERE u.email IN ('student1@example.com', 'student2@example.com', 'student3@example.com',
                         'student4@example.com', 'student5@example.com')
       ORDER BY u.email;`
    );

    const student1Id = students[0][0]?.id;
    const student2Id = students[0][1]?.id;
    const student3Id = students[0][2]?.id;
    const student4Id = students[0][3]?.id;
    const student5Id = students[0][4]?.id;

    // ===============================
    // СЪЗДАЙ MEETINGS
    // ===============================
    await queryInterface.bulkInsert('mentor_meetings', [
      // ✅ ПРЕДСТОЯЩИ СРЕЩИ (scheduled)
      {
        mentor_id: mentor1Id,
        student_id: student1Id,
        title: 'Консултация за Excel',
        meeting_date: '2025-11-18',
        meeting_time: '14:00:00',
        duration: 60,
        notes: 'Преглед на напредъка по курса "Основи на компютрите". Обсъждане на трудностите при работа с текстови редактори.',
        status: 'scheduled',
        meeting_type: 'viber',  // ✅ ПРОМЕНЕНО
        completed_at: null,
        cancelled_at: null,
        created_at: new Date('2025-01-10'),
        updated_at: new Date('2025-01-10'),
      },
      {
        mentor_id: mentor1Id,
        student_id: student2Id,
        title: 'Среща по телефона',
        meeting_date: '2025-11-19',
        meeting_time: '10:30:00',
        duration: 30,
        notes: 'Бърза проверка на домашното по Excel.',
        status: 'scheduled',
        meeting_type: 'phone',  // ✅ ОК
        completed_at: null,
        cancelled_at: null,
        created_at: new Date('2025-01-11'),
        updated_at: new Date('2025-01-11'),
      },
      {
        mentor_id: mentor1Id,
        student_id: student1Id,
        title: 'Лична среща в клуба',
        meeting_date: '2025-11-20',
        meeting_time: '16:00:00',
        duration: 90,
        notes: 'Практически урок за работа с имейл и прикачени файлове.',
        status: 'scheduled',
        meeting_type: 'in_person',  // ✅ ОК
        completed_at: null,
        cancelled_at: null,
        created_at: new Date('2025-01-12'),
        updated_at: new Date('2025-01-12'),
      },
      {
        mentor_id: mentor2Id,
        student_id: student3Id,
        title: 'Обучение за социални мрежи',
        meeting_date: '2025-11-21',
        meeting_time: '15:00:00',
        duration: 60,
        notes: 'Как да създадем Facebook профил и да управляваме настройките за поверителност.',
        status: 'scheduled',
        meeting_type: 'google_meet',  // ✅ ПРОМЕНЕНО
        completed_at: null,
        cancelled_at: null,
        created_at: new Date('2025-01-13'),
        updated_at: new Date('2025-01-13'),
      },
      {
        mentor_id: mentor2Id,
        student_id: student4Id,
        title: 'Видео среща за banking',
        meeting_date: '2025-11-22',
        meeting_time: '11:00:00',
        duration: 45,
        notes: 'Преглед на онлайн банкиране и сигурност.',
        status: 'scheduled',
        meeting_type: 'viber',  // ✅ ПРОМЕНЕНО
        completed_at: null,
        cancelled_at: null,
        created_at: new Date('2025-01-14'),
        updated_at: new Date('2025-01-14'),
      },
      {
        mentor_id: mentor3Id,
        student_id: student5Id,
        title: 'Подготовка за финален тест',
        meeting_date: '2025-11-23',
        meeting_time: '13:00:00',
        duration: 120,
        notes: 'Преглед на всички теми и подготовка за сертификационен изпит.',
        status: 'scheduled',
        meeting_type: 'in_person',  // ✅ ОК
        completed_at: null,
        cancelled_at: null,
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-15'),
      },

      // ✅ ЗАВЪРШЕНИ СРЕЩИ (completed)
      {
        mentor_id: mentor1Id,
        student_id: student1Id,
        title: 'Въведение в Windows',
        meeting_date: '2024-12-15',
        meeting_time: '14:00:00',
        duration: 60,
        notes: 'Отлична среща! Студентът разбра основите на файловата система.',
        status: 'completed',
        meeting_type: 'google_meet',  // ✅ ПРОМЕНЕНО
        completed_at: new Date('2024-12-15T15:00:00Z'),
        cancelled_at: null,
        created_at: new Date('2024-12-10'),
        updated_at: new Date('2024-12-15'),
      },
      {
        mentor_id: mentor1Id,
        student_id: student2Id,
        title: 'Работа с имейл',
        meeting_date: '2024-12-20',
        meeting_time: '10:00:00',
        duration: 45,
        notes: 'Успешно създадохме имейл акаунт и научихме как да прикачваме файлове.',
        status: 'completed',
        meeting_type: 'phone',  // ✅ ОК
        completed_at: new Date('2024-12-20T10:45:00Z'),
        cancelled_at: null,
        created_at: new Date('2024-12-18'),
        updated_at: new Date('2024-12-20'),
      },
      {
        mentor_id: mentor2Id,
        student_id: student3Id,
        title: 'Excel за начинаещи',
        meeting_date: '2025-01-05',
        meeting_time: '15:30:00',
        duration: 90,
        notes: 'Много продуктивна среща. Студентът вече може да създава таблици.',
        status: 'completed',
        meeting_type: 'in_person',  // ✅ ОК
        completed_at: new Date('2025-01-05T17:00:00Z'),
        cancelled_at: null,
        created_at: new Date('2025-01-02'),
        updated_at: new Date('2025-01-05'),
      },
      {
        mentor_id: mentor3Id,
        student_id: student5Id,
        title: 'Онлайн сигурност',
        meeting_date: '2025-01-08',
        meeting_time: '11:00:00',
        duration: 60,
        notes: 'Обсъдихме как да разпознаваме фишинг имейли и как да създаваме сигурни пароли.',
        status: 'completed',
        meeting_type: 'viber',  // ✅ ПРОМЕНЕНО
        completed_at: new Date('2025-01-08T12:00:00Z'),
        cancelled_at: null,
        created_at: new Date('2025-01-05'),
        updated_at: new Date('2025-01-08'),
      },

      // ❌ ОТМЕНЕНИ СРЕЩИ (cancelled)
      {
        mentor_id: mentor1Id,
        student_id: student1Id,
        title: 'Google Drive обучение',
        meeting_date: '2025-01-03',
        meeting_time: '16:00:00',
        duration: 60,
        notes: null,
        status: 'cancelled',
        meeting_type: 'google_meet',  // ✅ ПРОМЕНЕНО
        completed_at: null,
        cancelled_at: new Date('2025-01-02T10:00:00Z'),
        created_at: new Date('2024-12-28'),
        updated_at: new Date('2025-01-02'),
      },
      {
        mentor_id: mentor2Id,
        student_id: student4Id,
        title: 'Работа със Zoom',
        meeting_date: '2025-01-10',
        meeting_time: '14:00:00',
        duration: 45,
        notes: null,
        status: 'cancelled',
        meeting_type: 'viber',  // ✅ ПРОМЕНЕНО
        completed_at: null,
        cancelled_at: new Date('2025-01-09T12:00:00Z'),
        created_at: new Date('2025-01-07'),
        updated_at: new Date('2025-01-09'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mentor_meetings', null, {});
  },
};