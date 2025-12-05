'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ===============================
    // GET STUDENT IDs
    // ===============================
    const students = await queryInterface.sequelize.query(
      `SELECT s.id, s.user_id, u.email 
       FROM students s
       JOIN user_accounts u ON s.user_id = u.id
       WHERE u.email IN ('student1@example.com', 'student2@example.com', 'student3@example.com',
                         'student4@example.com', 'student5@example.com', 'student6@example.com')
       ORDER BY u.email;`
    );

    if (students[0].length === 0) {
      console.log('No students found. Skipping enrollments seeder.');
      return;
    }

    const student1 = students[0].find(s => s.email === 'student1@example.com');
    const student2 = students[0].find(s => s.email === 'student2@example.com');
    const student3 = students[0].find(s => s.email === 'student3@example.com');
    const student4 = students[0].find(s => s.email === 'student4@example.com');
    const student5 = students[0].find(s => s.email === 'student5@example.com');
    const student6 = students[0].find(s => s.email === 'student6@example.com');

    // ===============================
    // GET MENTOR_COURSE IDs
    // ===============================
    const mentorCourses = await queryInterface.sequelize.query(
      `SELECT id, mentor_id, course_id FROM mentor_courses ORDER BY id;`
    );

    // ===============================
    // 1. STUDENT COURSES (11 записвания)
    // ===============================
    await queryInterface.bulkInsert('student_courses', [
      // Student 1 - 2 курса (1 завършен, 1 в прогрес)
      {
        student_id: student1.id,
        course_id: 1,
        mentor_course_id: mentorCourses[0]?.[0]?.id || null,
        status: 'completed',
        progress: 100,
        completed_lessons: 5,
        total_lessons: 5,
        earned_credits: 50,
        max_credits: 50,
        start_date: new Date('2024-11-05'),
        end_date: new Date('2024-12-15'),
        created_at: new Date('2024-11-05'),
        updated_at: new Date('2024-12-15'),
      },
      {
        student_id: student1.id,
        course_id: 2,
        mentor_course_id: mentorCourses[0]?.[1]?.id || null,
        status: 'in_progress',
        progress: 50,
        completed_lessons: 2,
        total_lessons: 4,
        earned_credits: 20,
        max_credits: 40,
        start_date: new Date('2024-12-20'),
        end_date: null,
        created_at: new Date('2024-12-20'),
        updated_at: new Date('2025-01-10'),
      },

      // Student 2 - 1 курс в прогрес
      {
        student_id: student2.id,
        course_id: 1,
        mentor_course_id: mentorCourses[0]?.[0]?.id || null,
        status: 'in_progress',
        progress: 60,
        completed_lessons: 3,
        total_lessons: 5,
        earned_credits: 30,
        max_credits: 50,
        start_date: new Date('2024-11-10'),
        end_date: null,
        created_at: new Date('2024-11-10'),
        updated_at: new Date('2025-01-08'),
      },

      // Student 3 - 3 курса (2 завършени, 1 в прогрес)
      {
        student_id: student3.id,
        course_id: 1,
        mentor_course_id: mentorCourses[0]?.[2]?.id || null,
        status: 'completed',
        progress: 100,
        completed_lessons: 5,
        total_lessons: 5,
        earned_credits: 50,
        max_credits: 50,
        start_date: new Date('2024-11-12'),
        end_date: new Date('2024-12-01'),
        created_at: new Date('2024-11-12'),
        updated_at: new Date('2024-12-01'),
      },
      {
        student_id: student3.id,
        course_id: 2,
        mentor_course_id: mentorCourses[0]?.[3]?.id || null,
        status: 'completed',
        progress: 100,
        completed_lessons: 4,
        total_lessons: 4,
        earned_credits: 40,
        max_credits: 40,
        start_date: new Date('2024-12-05'),
        end_date: new Date('2024-12-25'),
        created_at: new Date('2024-12-05'),
        updated_at: new Date('2024-12-25'),
      },
      {
        student_id: student3.id,
        course_id: 3,
        mentor_course_id: mentorCourses[0]?.[4]?.id || null,
        status: 'in_progress',
        progress: 75,
        completed_lessons: 3,
        total_lessons: 4,
        earned_credits: 35,
        max_credits: 45,
        start_date: new Date('2025-01-02'),
        end_date: null,
        created_at: new Date('2025-01-02'),
        updated_at: new Date('2025-01-12'),
      },

      // Student 4 - 1 курс, тъкмо започнал
      {
        student_id: student4.id,
        course_id: 1,
        mentor_course_id: mentorCourses[0]?.[2]?.id || null,
        status: 'in_progress',
        progress: 20,
        completed_lessons: 1,
        total_lessons: 5,
        earned_credits: 10,
        max_credits: 50,
        start_date: new Date('2024-12-01'),
        end_date: null,
        created_at: new Date('2024-12-01'),
        updated_at: new Date('2025-01-05'),
      },

      // Student 5 - 4 курса (3 завършени, 1 в прогрес)
      {
        student_id: student5.id,
        course_id: 1,
        mentor_course_id: mentorCourses[0]?.[5]?.id || null,
        status: 'completed',
        progress: 100,
        completed_lessons: 5,
        total_lessons: 5,
        earned_credits: 50,
        max_credits: 50,
        start_date: new Date('2024-12-05'),
        end_date: new Date('2024-12-20'),
        created_at: new Date('2024-12-05'),
        updated_at: new Date('2024-12-20'),
      },
      {
        student_id: student5.id,
        course_id: 2,
        mentor_course_id: null,
        status: 'completed',
        progress: 100,
        completed_lessons: 4,
        total_lessons: 4,
        earned_credits: 40,
        max_credits: 40,
        start_date: new Date('2024-12-22'),
        end_date: new Date('2025-01-05'),
        created_at: new Date('2024-12-22'),
        updated_at: new Date('2025-01-05'),
      },
      {
        student_id: student5.id,
        course_id: 3,
        mentor_course_id: null,
        status: 'completed',
        progress: 100,
        completed_lessons: 4,
        total_lessons: 4,
        earned_credits: 45,
        max_credits: 45,
        start_date: new Date('2025-01-06'),
        end_date: new Date('2025-01-10'),
        created_at: new Date('2025-01-06'),
        updated_at: new Date('2025-01-10'),
      },
      {
        student_id: student5.id,
        course_id: 4,
        mentor_course_id: null,
        status: 'in_progress',
        progress: 33,
        completed_lessons: 2,
        total_lessons: 6,
        earned_credits: 15,
        max_credits: 40,
        start_date: new Date('2025-01-11'),
        end_date: null,
        created_at: new Date('2025-01-11'),
        updated_at: new Date('2025-01-12'),
      },
    ]);

    // ===============================
    // 2. STUDENT LESSONS (според твоя модел)
    // Полета: student_id, lesson_id, status, progress, watched_seconds, 
    //         last_watched_at, is_completed, completed_at, test_attempts,
    //         test_score, test_passed, test_completed_at, earned_credits, notes
    // ===============================
    await queryInterface.bulkInsert('student_lessons', [
      // Student 1 - Курс 1 завършен (lessons 1-5)
      { student_id: student1.id, lesson_id: 1, status: 'completed', progress: 100, watched_seconds: 2700, last_watched_at: new Date('2024-11-06'), is_completed: true, completed_at: new Date('2024-11-06'), test_attempts: 1, test_score: 85, test_passed: true, test_completed_at: new Date('2024-11-06'), earned_credits: 10, notes: null, created_at: new Date('2024-11-05'), updated_at: new Date('2024-11-06') },
      { student_id: student1.id, lesson_id: 2, status: 'completed', progress: 100, watched_seconds: 3600, last_watched_at: new Date('2024-11-10'), is_completed: true, completed_at: new Date('2024-11-10'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-11-08'), updated_at: new Date('2024-11-10') },
      { student_id: student1.id, lesson_id: 3, status: 'completed', progress: 100, watched_seconds: 3300, last_watched_at: new Date('2024-11-15'), is_completed: true, completed_at: new Date('2024-11-15'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-11-12'), updated_at: new Date('2024-11-15') },
      { student_id: student1.id, lesson_id: 4, status: 'completed', progress: 100, watched_seconds: 3000, last_watched_at: new Date('2024-11-20'), is_completed: true, completed_at: new Date('2024-11-20'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-11-18'), updated_at: new Date('2024-11-20') },
      { student_id: student1.id, lesson_id: 5, status: 'completed', progress: 100, watched_seconds: 2400, last_watched_at: new Date('2024-11-25'), is_completed: true, completed_at: new Date('2024-11-25'), test_attempts: 2, test_score: 90, test_passed: true, test_completed_at: new Date('2024-11-25'), earned_credits: 10, notes: null, created_at: new Date('2024-11-22'), updated_at: new Date('2024-11-25') },
      // Student 1 - Курс 2 в прогрес
      { student_id: student1.id, lesson_id: 6, status: 'completed', progress: 100, watched_seconds: 2100, last_watched_at: new Date('2024-12-22'), is_completed: true, completed_at: new Date('2024-12-22'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-20'), updated_at: new Date('2024-12-22') },
      { student_id: student1.id, lesson_id: 7, status: 'completed', progress: 100, watched_seconds: 2400, last_watched_at: new Date('2024-12-28'), is_completed: true, completed_at: new Date('2024-12-28'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-25'), updated_at: new Date('2024-12-28') },
      { student_id: student1.id, lesson_id: 8, status: 'in_progress', progress: 30, watched_seconds: 900, last_watched_at: new Date('2025-01-10'), is_completed: false, completed_at: null, test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 0, notes: null, created_at: new Date('2025-01-05'), updated_at: new Date('2025-01-10') },

      // Student 2 - Курс 1 в прогрес
      { student_id: student2.id, lesson_id: 1, status: 'completed', progress: 100, watched_seconds: 3000, last_watched_at: new Date('2024-11-12'), is_completed: true, completed_at: new Date('2024-11-12'), test_attempts: 1, test_score: 75, test_passed: true, test_completed_at: new Date('2024-11-12'), earned_credits: 10, notes: null, created_at: new Date('2024-11-10'), updated_at: new Date('2024-11-12') },
      { student_id: student2.id, lesson_id: 2, status: 'completed', progress: 100, watched_seconds: 3900, last_watched_at: new Date('2024-11-20'), is_completed: true, completed_at: new Date('2024-11-20'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-11-15'), updated_at: new Date('2024-11-20') },
      { student_id: student2.id, lesson_id: 3, status: 'completed', progress: 100, watched_seconds: 4200, last_watched_at: new Date('2024-12-01'), is_completed: true, completed_at: new Date('2024-12-01'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: 'Много полезен урок!', created_at: new Date('2024-11-25'), updated_at: new Date('2024-12-01') },
      { student_id: student2.id, lesson_id: 4, status: 'in_progress', progress: 50, watched_seconds: 1500, last_watched_at: new Date('2025-01-08'), is_completed: false, completed_at: null, test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 0, notes: null, created_at: new Date('2024-12-10'), updated_at: new Date('2025-01-08') },

      // Student 3 - Курс 1 завършен
      { student_id: student3.id, lesson_id: 1, status: 'completed', progress: 100, watched_seconds: 1800, last_watched_at: new Date('2024-11-13'), is_completed: true, completed_at: new Date('2024-11-13'), test_attempts: 1, test_score: 95, test_passed: true, test_completed_at: new Date('2024-11-13'), earned_credits: 10, notes: null, created_at: new Date('2024-11-12'), updated_at: new Date('2024-11-13') },
      { student_id: student3.id, lesson_id: 2, status: 'completed', progress: 100, watched_seconds: 2100, last_watched_at: new Date('2024-11-16'), is_completed: true, completed_at: new Date('2024-11-16'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-11-14'), updated_at: new Date('2024-11-16') },
      { student_id: student3.id, lesson_id: 3, status: 'completed', progress: 100, watched_seconds: 2400, last_watched_at: new Date('2024-11-20'), is_completed: true, completed_at: new Date('2024-11-20'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-11-18'), updated_at: new Date('2024-11-20') },
      { student_id: student3.id, lesson_id: 4, status: 'completed', progress: 100, watched_seconds: 2100, last_watched_at: new Date('2024-11-25'), is_completed: true, completed_at: new Date('2024-11-25'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-11-22'), updated_at: new Date('2024-11-25') },
      { student_id: student3.id, lesson_id: 5, status: 'completed', progress: 100, watched_seconds: 1800, last_watched_at: new Date('2024-12-01'), is_completed: true, completed_at: new Date('2024-12-01'), test_attempts: 1, test_score: 100, test_passed: true, test_completed_at: new Date('2024-12-01'), earned_credits: 10, notes: null, created_at: new Date('2024-11-27'), updated_at: new Date('2024-12-01') },
      // Student 3 - Курс 2 завършен
      { student_id: student3.id, lesson_id: 6, status: 'completed', progress: 100, watched_seconds: 1500, last_watched_at: new Date('2024-12-08'), is_completed: true, completed_at: new Date('2024-12-08'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-05'), updated_at: new Date('2024-12-08') },
      { student_id: student3.id, lesson_id: 7, status: 'completed', progress: 100, watched_seconds: 1800, last_watched_at: new Date('2024-12-13'), is_completed: true, completed_at: new Date('2024-12-13'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-10'), updated_at: new Date('2024-12-13') },
      { student_id: student3.id, lesson_id: 8, status: 'completed', progress: 100, watched_seconds: 2100, last_watched_at: new Date('2024-12-18'), is_completed: true, completed_at: new Date('2024-12-18'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-15'), updated_at: new Date('2024-12-18') },
      { student_id: student3.id, lesson_id: 9, status: 'completed', progress: 100, watched_seconds: 2400, last_watched_at: new Date('2024-12-25'), is_completed: true, completed_at: new Date('2024-12-25'), test_attempts: 1, test_score: 88, test_passed: true, test_completed_at: new Date('2024-12-25'), earned_credits: 10, notes: null, created_at: new Date('2024-12-20'), updated_at: new Date('2024-12-25') },
      // Student 3 - Курс 3 в прогрес
      { student_id: student3.id, lesson_id: 10, status: 'completed', progress: 100, watched_seconds: 2700, last_watched_at: new Date('2025-01-04'), is_completed: true, completed_at: new Date('2025-01-04'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2025-01-02'), updated_at: new Date('2025-01-04') },
      { student_id: student3.id, lesson_id: 11, status: 'completed', progress: 100, watched_seconds: 3000, last_watched_at: new Date('2025-01-08'), is_completed: true, completed_at: new Date('2025-01-08'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2025-01-05'), updated_at: new Date('2025-01-08') },
      { student_id: student3.id, lesson_id: 12, status: 'completed', progress: 100, watched_seconds: 2400, last_watched_at: new Date('2025-01-11'), is_completed: true, completed_at: new Date('2025-01-11'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2025-01-09'), updated_at: new Date('2025-01-11') },
      { student_id: student3.id, lesson_id: 13, status: 'in_progress', progress: 25, watched_seconds: 600, last_watched_at: new Date('2025-01-12'), is_completed: false, completed_at: null, test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 0, notes: null, created_at: new Date('2025-01-12'), updated_at: new Date('2025-01-12') },

      // Student 4 - Курс 1 тъкмо започнал
      { student_id: student4.id, lesson_id: 1, status: 'completed', progress: 100, watched_seconds: 3600, last_watched_at: new Date('2024-12-05'), is_completed: true, completed_at: new Date('2024-12-05'), test_attempts: 2, test_score: 70, test_passed: true, test_completed_at: new Date('2024-12-05'), earned_credits: 10, notes: 'Трудно беше, но се справих', created_at: new Date('2024-12-01'), updated_at: new Date('2024-12-05') },
      { student_id: student4.id, lesson_id: 2, status: 'in_progress', progress: 20, watched_seconds: 600, last_watched_at: new Date('2025-01-05'), is_completed: false, completed_at: null, test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 0, notes: null, created_at: new Date('2024-12-20'), updated_at: new Date('2025-01-05') },

      // Student 5 - Много уроци (Master level)
      { student_id: student5.id, lesson_id: 1, status: 'completed', progress: 100, watched_seconds: 1500, last_watched_at: new Date('2024-12-06'), is_completed: true, completed_at: new Date('2024-12-06'), test_attempts: 1, test_score: 100, test_passed: true, test_completed_at: new Date('2024-12-06'), earned_credits: 10, notes: null, created_at: new Date('2024-12-05'), updated_at: new Date('2024-12-06') },
      { student_id: student5.id, lesson_id: 2, status: 'completed', progress: 100, watched_seconds: 1800, last_watched_at: new Date('2024-12-09'), is_completed: true, completed_at: new Date('2024-12-09'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-07'), updated_at: new Date('2024-12-09') },
      { student_id: student5.id, lesson_id: 3, status: 'completed', progress: 100, watched_seconds: 1680, last_watched_at: new Date('2024-12-12'), is_completed: true, completed_at: new Date('2024-12-12'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-10'), updated_at: new Date('2024-12-12') },
      { student_id: student5.id, lesson_id: 4, status: 'completed', progress: 100, watched_seconds: 1920, last_watched_at: new Date('2024-12-16'), is_completed: true, completed_at: new Date('2024-12-16'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-13'), updated_at: new Date('2024-12-16') },
      { student_id: student5.id, lesson_id: 5, status: 'completed', progress: 100, watched_seconds: 1500, last_watched_at: new Date('2024-12-20'), is_completed: true, completed_at: new Date('2024-12-20'), test_attempts: 1, test_score: 95, test_passed: true, test_completed_at: new Date('2024-12-20'), earned_credits: 10, notes: null, created_at: new Date('2024-12-17'), updated_at: new Date('2024-12-20') },
      { student_id: student5.id, lesson_id: 6, status: 'completed', progress: 100, watched_seconds: 1200, last_watched_at: new Date('2024-12-24'), is_completed: true, completed_at: new Date('2024-12-24'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-22'), updated_at: new Date('2024-12-24') },
      { student_id: student5.id, lesson_id: 7, status: 'completed', progress: 100, watched_seconds: 1500, last_watched_at: new Date('2024-12-28'), is_completed: true, completed_at: new Date('2024-12-28'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-26'), updated_at: new Date('2024-12-28') },
      { student_id: student5.id, lesson_id: 8, status: 'completed', progress: 100, watched_seconds: 1800, last_watched_at: new Date('2025-01-02'), is_completed: true, completed_at: new Date('2025-01-02'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2024-12-30'), updated_at: new Date('2025-01-02') },
      { student_id: student5.id, lesson_id: 9, status: 'completed', progress: 100, watched_seconds: 1680, last_watched_at: new Date('2025-01-05'), is_completed: true, completed_at: new Date('2025-01-05'), test_attempts: 1, test_score: 92, test_passed: true, test_completed_at: new Date('2025-01-05'), earned_credits: 10, notes: null, created_at: new Date('2025-01-03'), updated_at: new Date('2025-01-05') },
      { student_id: student5.id, lesson_id: 10, status: 'completed', progress: 100, watched_seconds: 2100, last_watched_at: new Date('2025-01-07'), is_completed: true, completed_at: new Date('2025-01-07'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2025-01-06'), updated_at: new Date('2025-01-07') },
      { student_id: student5.id, lesson_id: 11, status: 'completed', progress: 100, watched_seconds: 2400, last_watched_at: new Date('2025-01-08'), is_completed: true, completed_at: new Date('2025-01-08'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2025-01-07'), updated_at: new Date('2025-01-08') },
      { student_id: student5.id, lesson_id: 12, status: 'completed', progress: 100, watched_seconds: 2100, last_watched_at: new Date('2025-01-09'), is_completed: true, completed_at: new Date('2025-01-09'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 10, notes: null, created_at: new Date('2025-01-08'), updated_at: new Date('2025-01-09') },
      { student_id: student5.id, lesson_id: 13, status: 'completed', progress: 100, watched_seconds: 2700, last_watched_at: new Date('2025-01-10'), is_completed: true, completed_at: new Date('2025-01-10'), test_attempts: 1, test_score: 98, test_passed: true, test_completed_at: new Date('2025-01-10'), earned_credits: 10, notes: null, created_at: new Date('2025-01-09'), updated_at: new Date('2025-01-10') },
      { student_id: student5.id, lesson_id: 14, status: 'completed', progress: 100, watched_seconds: 1500, last_watched_at: new Date('2025-01-11'), is_completed: true, completed_at: new Date('2025-01-11'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 7, notes: null, created_at: new Date('2025-01-11'), updated_at: new Date('2025-01-11') },
      { student_id: student5.id, lesson_id: 15, status: 'completed', progress: 100, watched_seconds: 1800, last_watched_at: new Date('2025-01-12'), is_completed: true, completed_at: new Date('2025-01-12'), test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 8, notes: null, created_at: new Date('2025-01-12'), updated_at: new Date('2025-01-12') },
      { student_id: student5.id, lesson_id: 16, status: 'in_progress', progress: 40, watched_seconds: 600, last_watched_at: new Date('2025-01-12'), is_completed: false, completed_at: null, test_attempts: 0, test_score: null, test_passed: false, test_completed_at: null, earned_credits: 0, notes: null, created_at: new Date('2025-01-12'), updated_at: new Date('2025-01-12') },
    ]);

    // ===============================
    // 3. STUDENT LECTURES (според твоя модел)
    // Полета: student_id, lecture_id, attended, attended_at, earned_credits, notes
    // ===============================
    await queryInterface.bulkInsert('student_lectures', [
      { student_id: student1.id, lecture_id: 1, attended: true, attended_at: new Date('2024-11-25'), earned_credits: 10, notes: null, created_at: new Date('2024-11-20'), updated_at: new Date('2024-11-25') },
      { student_id: student1.id, lecture_id: 2, attended: false, attended_at: null, earned_credits: 0, notes: 'Регистриран, чака събитието', created_at: new Date('2025-01-05'), updated_at: new Date('2025-01-05') },
      { student_id: student2.id, lecture_id: 1, attended: true, attended_at: new Date('2024-11-25'), earned_credits: 10, notes: null, created_at: new Date('2024-11-18'), updated_at: new Date('2024-11-25') },
      { student_id: student3.id, lecture_id: 1, attended: true, attended_at: new Date('2024-11-25'), earned_credits: 10, notes: 'Отлична лекция!', created_at: new Date('2024-11-15'), updated_at: new Date('2024-11-25') },
      { student_id: student3.id, lecture_id: 3, attended: true, attended_at: new Date('2024-12-10'), earned_credits: 10, notes: null, created_at: new Date('2024-12-01'), updated_at: new Date('2024-12-10') },
      { student_id: student3.id, lecture_id: 4, attended: true, attended_at: new Date('2024-12-20'), earned_credits: 10, notes: null, created_at: new Date('2024-12-15'), updated_at: new Date('2024-12-20') },
      { student_id: student4.id, lecture_id: 1, attended: true, attended_at: new Date('2024-11-25'), earned_credits: 5, notes: 'Закъснях малко', created_at: new Date('2024-12-10'), updated_at: new Date('2024-11-25') },
      { student_id: student5.id, lecture_id: 1, attended: true, attended_at: new Date('2024-11-25'), earned_credits: 10, notes: null, created_at: new Date('2024-12-08'), updated_at: new Date('2024-11-25') },
      { student_id: student5.id, lecture_id: 3, attended: true, attended_at: new Date('2024-12-10'), earned_credits: 10, notes: null, created_at: new Date('2024-12-12'), updated_at: new Date('2024-12-10') },
      { student_id: student5.id, lecture_id: 5, attended: true, attended_at: new Date('2025-01-08'), earned_credits: 10, notes: null, created_at: new Date('2025-01-05'), updated_at: new Date('2025-01-08') },
    ]);

    // ===============================
    // 4. STUDENT SEMINARS (според твоя модел)
    // Полета: student_id, seminar_id, attended, attended_at, earned_credits, notes
    // ===============================
    await queryInterface.bulkInsert('student_seminars', [
      { student_id: student1.id, seminar_id: 1, attended: true, attended_at: new Date('2024-12-05'), earned_credits: 5, notes: null, created_at: new Date('2024-12-01'), updated_at: new Date('2024-12-05') },
      { student_id: student3.id, seminar_id: 1, attended: true, attended_at: new Date('2024-12-05'), earned_credits: 5, notes: 'Практически и полезен', created_at: new Date('2024-11-28'), updated_at: new Date('2024-12-05') },
      { student_id: student3.id, seminar_id: 2, attended: true, attended_at: new Date('2024-12-28'), earned_credits: 15, notes: null, created_at: new Date('2024-12-20'), updated_at: new Date('2024-12-28') },
      { student_id: student5.id, seminar_id: 1, attended: true, attended_at: new Date('2024-12-05'), earned_credits: 5, notes: null, created_at: new Date('2024-12-10'), updated_at: new Date('2024-12-05') },
      { student_id: student5.id, seminar_id: 3, attended: true, attended_at: new Date('2025-01-10'), earned_credits: 15, notes: null, created_at: new Date('2025-01-02'), updated_at: new Date('2025-01-10') },
    ]);

    // ===============================
    // 5. STUDENT PRESENTATIONS (според твоя модел)
    // Полета: student_id, presentation_id, status, submission_url, submission_text,
    //         submitted_at, graded_at, earned_credits, feedback, graded_by
    // ===============================
    await queryInterface.bulkInsert('student_presentations', [
      { student_id: student3.id, presentation_id: 1, status: 'graded', submission_url: null, submission_text: 'Много интересна презентация за сигурността', submitted_at: new Date('2024-12-15'), graded_at: new Date('2024-12-16'), earned_credits: 10, feedback: 'Отличен отзив!', graded_by: null, created_at: new Date('2024-12-10'), updated_at: new Date('2024-12-16') },
      { student_id: student3.id, presentation_id: 2, status: 'graded', submission_url: null, submission_text: 'Презентацията за Viber беше много полезна', submitted_at: new Date('2025-01-05'), graded_at: new Date('2025-01-06'), earned_credits: 10, feedback: 'Добре структуриран отзив', graded_by: null, created_at: new Date('2025-01-02'), updated_at: new Date('2025-01-06') },
      { student_id: student5.id, presentation_id: 1, status: 'graded', submission_url: null, submission_text: 'Научих много за пароли и двуфакторна автентикация', submitted_at: new Date('2024-12-18'), graded_at: new Date('2024-12-19'), earned_credits: 10, feedback: 'Перфектно!', graded_by: null, created_at: new Date('2024-12-15'), updated_at: new Date('2024-12-19') },
      { student_id: student5.id, presentation_id: 3, status: 'graded', submission_url: null, submission_text: 'Презентацията ме научи да ползвам смартфона по-добре', submitted_at: new Date('2025-01-08'), graded_at: new Date('2025-01-09'), earned_credits: 10, feedback: 'Много добър отзив', graded_by: null, created_at: new Date('2025-01-05'), updated_at: new Date('2025-01-09') },
      { student_id: student5.id, presentation_id: 4, status: 'graded', submission_url: null, submission_text: 'Google Photos е страхотно приложение!', submitted_at: new Date('2025-01-10'), graded_at: new Date('2025-01-11'), earned_credits: 10, feedback: 'Супер!', graded_by: null, created_at: new Date('2025-01-08'), updated_at: new Date('2025-01-11') },
      { student_id: student1.id, presentation_id: 1, status: 'submitted', submission_url: null, submission_text: 'Чакам оценка за моя отзив', submitted_at: new Date('2025-01-10'), graded_at: null, earned_credits: 0, feedback: null, graded_by: null, created_at: new Date('2025-01-08'), updated_at: new Date('2025-01-10') },
    ]);

    // ===============================
    // 6. USER CREDITS
    // ===============================
    await queryInterface.bulkInsert('user_credits', [
      {
        user_id: student1.user_id,
        total_credits: 120,
        credits_by_category: JSON.stringify({ 'Дигитална грамотност': 70, 'Комуникация': 35, 'Сигурност': 15 }),
        level: 'intermediate',
        courses_completed: 1,
        lectures_attended: 1,
        seminars_attended: 1,
        presentations_viewed: 0,
        tests_passed: 2,
        certificates_earned: 1,
        created_at: new Date('2024-11-01'),
        updated_at: new Date('2025-01-10'),
      },
      {
        user_id: student2.user_id,
        total_credits: 85,
        credits_by_category: JSON.stringify({ 'Дигитална грамотност': 50, 'Комуникация': 25, 'Сигурност': 10 }),
        level: 'intermediate',
        courses_completed: 0,
        lectures_attended: 1,
        seminars_attended: 0,
        presentations_viewed: 0,
        tests_passed: 1,
        certificates_earned: 0,
        created_at: new Date('2024-11-05'),
        updated_at: new Date('2025-01-08'),
      },
      {
        user_id: student3.user_id,
        total_credits: 200,
        credits_by_category: JSON.stringify({ 'Дигитална грамотност': 90, 'Комуникация': 60, 'Сигурност': 50 }),
        level: 'advanced',
        courses_completed: 2,
        lectures_attended: 3,
        seminars_attended: 2,
        presentations_viewed: 2,
        tests_passed: 4,
        certificates_earned: 2,
        created_at: new Date('2024-11-10'),
        updated_at: new Date('2025-01-12'),
      },
      {
        user_id: student4.user_id,
        total_credits: 45,
        credits_by_category: JSON.stringify({ 'Дигитална грамотност': 40, 'Комуникация': 5 }),
        level: 'beginner',
        courses_completed: 0,
        lectures_attended: 1,
        seminars_attended: 0,
        presentations_viewed: 0,
        tests_passed: 1,
        certificates_earned: 0,
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2025-01-05'),
      },
      {
        user_id: student5.user_id,
        total_credits: 300,
        credits_by_category: JSON.stringify({ 'Дигитална грамотност': 135, 'Комуникация': 85, 'Сигурност': 80 }),
        level: 'advanced',
        courses_completed: 3,
        lectures_attended: 3,
        seminars_attended: 2,
        presentations_viewed: 3,
        tests_passed: 6,
        certificates_earned: 3,
        created_at: new Date('2024-12-01'),
        updated_at: new Date('2025-01-11'),
      },
      {
        user_id: student6.user_id,
        total_credits: 0,
        credits_by_category: JSON.stringify({}),
        level: 'beginner',
        courses_completed: 0,
        lectures_attended: 0,
        seminars_attended: 0,
        presentations_viewed: 0,
        tests_passed: 0,
        certificates_earned: 0,
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-15'),
      },
    ]);

    // ===============================
    // 7. USER CREDITS HISTORY
    // ===============================
    await queryInterface.bulkInsert('user_credits_history', [
      { user_id: student1.user_id, credits_amount: 50, credits_before: 0, credits_after: 50, source_type: 'course', source_id: 1, source_title: 'Основи на компютъра', category: 'Дигитална грамотност', description: 'Завършен курс', metadata: JSON.stringify({}), created_at: new Date('2024-12-15'), updated_at: new Date('2024-12-15') },
      { user_id: student1.user_id, credits_amount: 20, credits_before: 50, credits_after: 70, source_type: 'course', source_id: 2, source_title: 'Работа с електронна поща', category: 'Комуникация', description: 'Прогрес в курс', metadata: JSON.stringify({}), created_at: new Date('2025-01-05'), updated_at: new Date('2025-01-05') },
      { user_id: student1.user_id, credits_amount: 10, credits_before: 70, credits_after: 80, source_type: 'lecture', source_id: 1, source_title: 'Въведение в дигиталния свят', category: 'Дигитална грамотност', description: 'Присъствие на лекция', metadata: JSON.stringify({}), created_at: new Date('2024-11-25'), updated_at: new Date('2024-11-25') },
      { user_id: student1.user_id, credits_amount: 5, credits_before: 80, credits_after: 85, source_type: 'seminar', source_id: 1, source_title: 'Практическа работа с мишка', category: 'Дигитална грамотност', description: 'Присъствие на семинар', metadata: JSON.stringify({}), created_at: new Date('2024-12-05'), updated_at: new Date('2024-12-05') },
      { user_id: student1.user_id, credits_amount: 15, credits_before: 85, credits_after: 100, source_type: 'test', source_id: 1, source_title: 'Тест: Основи на компютъра', category: 'Дигитална грамотност', description: 'Успешно положен тест', metadata: JSON.stringify({ score: 85 }), created_at: new Date('2024-12-10'), updated_at: new Date('2024-12-10') },
      { user_id: student1.user_id, credits_amount: 20, credits_before: 100, credits_after: 120, source_type: 'certificate', source_id: 1, source_title: 'Сертификат: Дигитална грамотност', category: 'Дигитална грамотност', description: 'Получен сертификат', metadata: JSON.stringify({}), created_at: new Date('2024-12-18'), updated_at: new Date('2024-12-18') },

      { user_id: student3.user_id, credits_amount: 50, credits_before: 0, credits_after: 50, source_type: 'course', source_id: 1, source_title: 'Основи на компютъра', category: 'Дигитална грамотност', description: 'Завършен курс', metadata: JSON.stringify({}), created_at: new Date('2024-12-01'), updated_at: new Date('2024-12-01') },
      { user_id: student3.user_id, credits_amount: 40, credits_before: 50, credits_after: 90, source_type: 'course', source_id: 2, source_title: 'Работа с електронна поща', category: 'Комуникация', description: 'Завършен курс', metadata: JSON.stringify({}), created_at: new Date('2024-12-25'), updated_at: new Date('2024-12-25') },
      { user_id: student3.user_id, credits_amount: 35, credits_before: 90, credits_after: 125, source_type: 'course', source_id: 3, source_title: 'Безопасност в интернет', category: 'Сигурност', description: 'Прогрес в курс', metadata: JSON.stringify({}), created_at: new Date('2025-01-12'), updated_at: new Date('2025-01-12') },
      { user_id: student3.user_id, credits_amount: 30, credits_before: 125, credits_after: 155, source_type: 'lecture', source_id: null, source_title: 'Лекции (3 бр.)', category: 'Смесено', description: 'Присъствие на лекции', metadata: JSON.stringify({}), created_at: new Date('2024-12-20'), updated_at: new Date('2024-12-20') },
      { user_id: student3.user_id, credits_amount: 20, credits_before: 155, credits_after: 175, source_type: 'seminar', source_id: null, source_title: 'Семинари (2 бр.)', category: 'Смесено', description: 'Присъствие на семинари', metadata: JSON.stringify({}), created_at: new Date('2024-12-28'), updated_at: new Date('2024-12-28') },
      { user_id: student3.user_id, credits_amount: 25, credits_before: 175, credits_after: 200, source_type: 'bonus', source_id: null, source_title: 'Бонус за активност', category: 'Бонус', description: 'Награда за активност', metadata: JSON.stringify({}), created_at: new Date('2025-01-01'), updated_at: new Date('2025-01-01') },

      { user_id: student5.user_id, credits_amount: 135, credits_before: 0, credits_after: 135, source_type: 'course', source_id: null, source_title: 'Курсове (3 завършени)', category: 'Смесено', description: 'Завършени курсове', metadata: JSON.stringify({}), created_at: new Date('2025-01-10'), updated_at: new Date('2025-01-10') },
      { user_id: student5.user_id, credits_amount: 15, credits_before: 135, credits_after: 150, source_type: 'course', source_id: 4, source_title: 'Viber и WhatsApp', category: 'Комуникация', description: 'Прогрес в курс', metadata: JSON.stringify({}), created_at: new Date('2025-01-12'), updated_at: new Date('2025-01-12') },
      { user_id: student5.user_id, credits_amount: 30, credits_before: 150, credits_after: 180, source_type: 'lecture', source_id: null, source_title: 'Лекции (3 бр.)', category: 'Смесено', description: 'Присъствие на лекции', metadata: JSON.stringify({}), created_at: new Date('2025-01-08'), updated_at: new Date('2025-01-08') },
      { user_id: student5.user_id, credits_amount: 20, credits_before: 180, credits_after: 200, source_type: 'seminar', source_id: null, source_title: 'Семинари (2 бр.)', category: 'Смесено', description: 'Присъствие на семинари', metadata: JSON.stringify({}), created_at: new Date('2025-01-10'), updated_at: new Date('2025-01-10') },
      { user_id: student5.user_id, credits_amount: 60, credits_before: 200, credits_after: 260, source_type: 'test', source_id: null, source_title: 'Тестове (6 бр.)', category: 'Смесено', description: 'Успешно положени тестове', metadata: JSON.stringify({}), created_at: new Date('2025-01-10'), updated_at: new Date('2025-01-10') },
      { user_id: student5.user_id, credits_amount: 40, credits_before: 260, credits_after: 300, source_type: 'certificate', source_id: null, source_title: 'Сертификати (3 бр.)', category: 'Смесено', description: 'Получени сертификати', metadata: JSON.stringify({}), created_at: new Date('2025-01-11'), updated_at: new Date('2025-01-11') },
    ]);

    console.log('✅ Enrollments seeded:');
    console.log('   - Student Courses: 11');
    console.log('   - Student Lessons: 47');
    console.log('   - Student Lectures: 10');
    console.log('   - Student Seminars: 5');
    console.log('   - Student Presentations: 6');
    console.log('   - User Credits: 6');
    console.log('   - User Credits History: 18');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_credits_history', null, {});
    await queryInterface.bulkDelete('user_credits', null, {});
    await queryInterface.bulkDelete('student_presentations', null, {});
    await queryInterface.bulkDelete('student_seminars', null, {});
    await queryInterface.bulkDelete('student_lectures', null, {});
    await queryInterface.bulkDelete('student_lessons', null, {});
    await queryInterface.bulkDelete('student_courses', null, {});
  },
};