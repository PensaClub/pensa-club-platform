'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ===============================
    // ПРОВЕРИ ДАЛИ STUDENTS ВЕЧЕ СЪЩЕСТВУВАТ
    // ===============================
    const existingStudents = await queryInterface.sequelize.query(
      `SELECT s.id, u.email FROM students s
       JOIN user_accounts u ON s.user_id = u.id
       WHERE u.email IN ('student1@example.com', 'student2@example.com', 'student3@example.com', 
                         'student4@example.com', 'student5@example.com', 'student6@example.com');`
    );

    if (existingStudents[0].length > 0) {
      console.log('✅ Students already exist, skipping...');
      return;
    }

    // ===============================
    // СЪЗДАЙ STUDENT USER ACCOUNTS
    // ===============================
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT id, email FROM user_accounts 
       WHERE email IN ('student1@example.com', 'student2@example.com', 'student3@example.com', 
                       'student4@example.com', 'student5@example.com', 'student6@example.com');`
    );

    let student1UserId, student2UserId, student3UserId, student4UserId, student5UserId, student6UserId;

    if (existingUsers[0].length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Student123!', 10);

      await queryInterface.bulkInsert('user_accounts', [
        {
          email: 'student1@example.com',
          password: hashedPassword,
          role: 'user',
          finished: true,
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2024-11-01'),
        },
        {
          email: 'student2@example.com',
          password: hashedPassword,
          role: 'user',
          finished: true,
          createdAt: new Date('2024-11-05'),
          updatedAt: new Date('2024-11-05'),
        },
        {
          email: 'student3@example.com',
          password: hashedPassword,
          role: 'user',
          finished: true,
          createdAt: new Date('2024-11-10'),
          updatedAt: new Date('2024-11-10'),
        },
        {
          email: 'student4@example.com',
          password: hashedPassword,
          role: 'user',
          finished: true,
          createdAt: new Date('2024-11-15'),
          updatedAt: new Date('2024-11-15'),
        },
        {
          email: 'student5@example.com',
          password: hashedPassword,
          role: 'user',
          finished: true,
          createdAt: new Date('2024-12-01'),
          updatedAt: new Date('2024-12-01'),
        },
        {
          email: 'student6@example.com',
          password: hashedPassword,
          role: 'user',
          finished: false,
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15'),
        },
      ]);
    }

    // Вземи user IDs (независимо дали са нови или съществуващи)
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM user_accounts 
       WHERE email IN ('student1@example.com', 'student2@example.com', 'student3@example.com',
                       'student4@example.com', 'student5@example.com', 'student6@example.com')
       ORDER BY email;`
    );

    student1UserId = users[0].find(u => u.email === 'student1@example.com')?.id;
    student2UserId = users[0].find(u => u.email === 'student2@example.com')?.id;
    student3UserId = users[0].find(u => u.email === 'student3@example.com')?.id;
    student4UserId = users[0].find(u => u.email === 'student4@example.com')?.id;
    student5UserId = users[0].find(u => u.email === 'student5@example.com')?.id;
    student6UserId = users[0].find(u => u.email === 'student6@example.com')?.id;

    // ===============================
    // ВЗЕМИ MENTOR IDs
    // ===============================
    const mentors = await queryInterface.sequelize.query(
      `SELECT m.id, u.email FROM mentors m 
       JOIN user_accounts u ON m.user_id = u.id 
       WHERE u.email IN ('mentor1@example.com', 'mentor2@example.com', 'mentor3@example.com')
       ORDER BY u.email;`
    );

    const mentor1Id = mentors[0][0]?.id || null;
    const mentor2Id = mentors[0][1]?.id || null;
    const mentor3Id = mentors[0][2]?.id || null;

    // ===============================
    // СЪЗДАЙ STUDENTS
    // ===============================
    await queryInterface.bulkInsert('students', [
      {
        user_id: student1UserId,
        phone: '+359888111222',
        date_of_birth: '1955-03-15',
        age: 70,
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        address: 'ул. Гладстон 5',
        city: 'София',
        country: 'BG',
        emergency_contact_name: 'Мария Петкова',
        emergency_contact_phone: '+359888999888',
        total_credits_earned: 120,
        total_credits_possible: 500,
        credits_from_courses: 100,
        credits_from_lectures: 15,
        credits_from_seminars: 5,
        credits_from_presentations: 0,
        current_mentor_id: mentor1Id,
        mentor_assigned_date: new Date('2024-11-05'),
        total_scheduled_sessions: 20,
        attended_sessions: 18,
        missed_sessions: 2,
        total_chat_sessions: 15,
        total_chat_hours: 12.5,
        last_chat_date: new Date('2025-01-10'),
        scheduled_meetings: 2,
        completed_meetings: 12,
        preferred_language: 'bg',
        preferred_contact_method: 'phone',
        availability_notes: 'Предпочитам следобед след 14:00ч',
        admin_notes: 'Много мотивиран студент, отличен напредък',
        special_needs: null,
        status: 'active',
        registration_date: new Date('2024-11-01'),
        graduation_date: null,
        last_active_at: new Date('2025-01-10'),
        created_at: new Date('2024-11-01'),
        updated_at: new Date('2025-01-10'),
      },
      {
        user_id: student2UserId,
        phone: '+359887222333',
        date_of_birth: '1958-07-22',
        age: 67,
        avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
        address: 'бул. Витоша 125',
        city: 'София',
        country: 'BG',
        emergency_contact_name: 'Иван Георгиев',
        emergency_contact_phone: '+359887999888',
        total_credits_earned: 85,
        total_credits_possible: 350,
        credits_from_courses: 70,
        credits_from_lectures: 10,
        credits_from_seminars: 5,
        credits_from_presentations: 0,
        current_mentor_id: mentor1Id,
        mentor_assigned_date: new Date('2024-11-08'),
        total_scheduled_sessions: 15,
        attended_sessions: 14,
        missed_sessions: 1,
        total_chat_sessions: 10,
        total_chat_hours: 8.0,
        last_chat_date: new Date('2025-01-08'),
        scheduled_meetings: 1,
        completed_meetings: 8,
        preferred_language: 'bg',
        preferred_contact_method: 'viber',
        availability_notes: 'Всеки делничен ден сутрин',
        admin_notes: null,
        special_needs: 'Затруднено зрение - по-едър шрифт',
        status: 'active',
        registration_date: new Date('2024-11-05'),
        graduation_date: null,
        last_active_at: new Date('2025-01-08'),
        created_at: new Date('2024-11-05'),
        updated_at: new Date('2025-01-08'),
      },
      {
        user_id: student3UserId,
        phone: '+359886333444',
        date_of_birth: '1960-11-30',
        age: 64,
        avatar: 'https://randomuser.me/api/portraits/men/60.jpg',
        address: 'ул. Г.С.Раковски 88',
        city: 'Пловдив',
        country: 'BG',
        emergency_contact_name: 'Елена Димитрова',
        emergency_contact_phone: '+359886888777',
        total_credits_earned: 200,
        total_credits_possible: 400,
        credits_from_courses: 150,
        credits_from_lectures: 30,
        credits_from_seminars: 20,
        credits_from_presentations: 0,
        current_mentor_id: mentor2Id,
        mentor_assigned_date: new Date('2024-11-12'),
        total_scheduled_sessions: 25,
        attended_sessions: 25,
        missed_sessions: 0,
        total_chat_sessions: 20,
        total_chat_hours: 18.5,
        last_chat_date: new Date('2025-01-12'),
        scheduled_meetings: 3,
        completed_meetings: 15,
        preferred_language: 'bg',
        preferred_contact_method: 'email',
        availability_notes: 'Гъвкав график',
        admin_notes: 'Образцов студент!',
        special_needs: null,
        status: 'active',
        registration_date: new Date('2024-11-10'),
        graduation_date: null,
        last_active_at: new Date('2025-01-12'),
        created_at: new Date('2024-11-10'),
        updated_at: new Date('2025-01-12'),
      },
      {
        user_id: student4UserId,
        phone: '+359885444555',
        date_of_birth: '1962-05-18',
        age: 62,
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        address: 'ул. Цар Симеон 44',
        city: 'Варна',
        country: 'BG',
        emergency_contact_name: 'Петър Стоянов',
        emergency_contact_phone: '+359885777666',
        total_credits_earned: 45,
        total_credits_possible: 250,
        credits_from_courses: 40,
        credits_from_lectures: 5,
        credits_from_seminars: 0,
        credits_from_presentations: 0,
        current_mentor_id: mentor2Id,
        mentor_assigned_date: new Date('2024-11-18'),
        total_scheduled_sessions: 8,
        attended_sessions: 6,
        missed_sessions: 2,
        total_chat_sessions: 5,
        total_chat_hours: 4.0,
        last_chat_date: new Date('2025-01-05'),
        scheduled_meetings: 1,
        completed_meetings: 3,
        preferred_language: 'bg',
        preferred_contact_method: 'phone',
        availability_notes: 'Уикенди предпочитам',
        admin_notes: null,
        special_needs: null,
        status: 'active',
        registration_date: new Date('2024-11-15'),
        graduation_date: null,
        last_active_at: new Date('2025-01-05'),
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2025-01-05'),
      },
      {
        user_id: student5UserId,
        phone: '+359884555666',
        date_of_birth: '1950-09-10',
        age: 74,
        avatar: 'https://randomuser.me/api/portraits/men/70.jpg',
        address: 'бул. България 200',
        city: 'София',
        country: 'BG',
        emergency_contact_name: 'Анна Христова',
        emergency_contact_phone: '+359884666555',
        total_credits_earned: 300,
        total_credits_possible: 500,
        credits_from_courses: 250,
        credits_from_lectures: 30,
        credits_from_seminars: 20,
        credits_from_presentations: 0,
        current_mentor_id: mentor3Id,
        mentor_assigned_date: new Date('2024-12-05'),
        total_scheduled_sessions: 30,
        attended_sessions: 28,
        missed_sessions: 2,
        total_chat_sessions: 25,
        total_chat_hours: 22.0,
        last_chat_date: new Date('2025-01-11'),
        scheduled_meetings: 2,
        completed_meetings: 18,
        preferred_language: 'bg',
        preferred_contact_method: 'viber',
        availability_notes: 'Всеки ден 10:00-12:00 и 15:00-17:00',
        admin_notes: 'Завършва скоро - подготовка за сертификат',
        special_needs: null,
        status: 'active',
        registration_date: new Date('2024-12-01'),
        graduation_date: null,
        last_active_at: new Date('2025-01-11'),
        created_at: new Date('2024-12-01'),
        updated_at: new Date('2025-01-11'),
      },
      {
        user_id: student6UserId,
        phone: null,
        date_of_birth: '1965-02-28',
        age: 60,
        avatar: null,
        address: null,
        city: 'София',
        country: 'BG',
        emergency_contact_name: null,
        emergency_contact_phone: null,
        total_credits_earned: 0,
        total_credits_possible: 0,
        credits_from_courses: 0,
        credits_from_lectures: 0,
        credits_from_seminars: 0,
        credits_from_presentations: 0,
        current_mentor_id: null,
        mentor_assigned_date: null,
        total_scheduled_sessions: 0,
        attended_sessions: 0,
        missed_sessions: 0,
        total_chat_sessions: 0,
        total_chat_hours: 0.00,
        last_chat_date: null,
        scheduled_meetings: 0,
        completed_meetings: 0,
        preferred_language: 'bg',
        preferred_contact_method: 'email',
        availability_notes: null,
        admin_notes: 'Нов студент - чака assignment на ментор',
        special_needs: null,
        status: 'active',
        registration_date: new Date('2025-01-15'),
        graduation_date: null,
        last_active_at: new Date('2025-01-15'),
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-15'),
      },
    ]);

    console.log('✅ Students seeded: 6 students created');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('students', null, {});
    await queryInterface.bulkDelete('user_accounts', {
      email: {
        [Sequelize.Op.in]: [
          'student1@example.com',
          'student2@example.com',
          'student3@example.com',
          'student4@example.com',
          'student5@example.com',
          'student6@example.com',
        ]
      }
    }, {});
  },
};