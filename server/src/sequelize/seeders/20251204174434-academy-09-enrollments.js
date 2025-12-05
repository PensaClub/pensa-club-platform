'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [students] = await queryInterface.sequelize.query(
      `SELECT id FROM students LIMIT 5`
    );
    
    if (students.length === 0) {
      console.log('No students found, skipping enrollments seed');
      return;
    }

    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Student Courses
    await queryInterface.bulkInsert('student_courses', [
      {
        student_id: students[0].id,
        course_id: 1,
        mentor_course_id: null,
        status: 'completed',
        progress: 100,
        completed_lessons: 12,
        total_lessons: 12,
        earned_credits: 40,
        max_credits: 40,
        start_date: oneMonthAgo,
        end_date: oneWeekAgo,
        created_at: oneMonthAgo,
        updated_at: oneWeekAgo,
      },
      {
        student_id: students[0].id,
        course_id: 2,
        mentor_course_id: null,
        status: 'in_progress',
        progress: 62,
        completed_lessons: 5,
        total_lessons: 8,
        earned_credits: 18,
        max_credits: 35,
        start_date: oneWeekAgo,
        end_date: null,
        created_at: oneWeekAgo,
        updated_at: today,
      },
      {
        student_id: students[1]?.id || students[0].id,
        course_id: 1,
        mentor_course_id: null,
        status: 'in_progress',
        progress: 25,
        completed_lessons: 3,
        total_lessons: 12,
        earned_credits: 8,
        max_credits: 40,
        start_date: oneWeekAgo,
        end_date: null,
        created_at: oneWeekAgo,
        updated_at: today,
      },
      {
        student_id: students[2]?.id || students[0].id,
        course_id: 3,
        mentor_course_id: null,
        status: 'in_progress',
        progress: 50,
        completed_lessons: 3,
        total_lessons: 6,
        earned_credits: 12,
        max_credits: 30,
        start_date: twoWeeksAgo,
        end_date: null,
        created_at: twoWeeksAgo,
        updated_at: today,
      },
    ]);

    // Student Lessons - всички полета включени
    await queryInterface.bulkInsert('student_lessons', [
      {
        student_id: students[0].id,
        lesson_id: 1,
        status: 'completed',
        progress: 100,
        watched_seconds: 900,
        last_watched_at: oneMonthAgo,
        is_completed: true,
        completed_at: oneMonthAgo,
        test_attempts: 0,
        test_score: null,
        test_passed: false,
        test_completed_at: null,
        earned_credits: 2,
        notes: null,
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
      },
      {
        student_id: students[0].id,
        lesson_id: 2,
        status: 'completed',
        progress: 100,
        watched_seconds: 1200,
        last_watched_at: oneMonthAgo,
        is_completed: true,
        completed_at: oneMonthAgo,
        test_attempts: 0,
        test_score: null,
        test_passed: false,
        test_completed_at: null,
        earned_credits: 2,
        notes: null,
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
      },
      {
        student_id: students[0].id,
        lesson_id: 3,
        status: 'completed',
        progress: 100,
        watched_seconds: 600,
        last_watched_at: oneMonthAgo,
        is_completed: true,
        completed_at: oneMonthAgo,
        test_attempts: 1,
        test_score: 85,
        test_passed: true,
        test_completed_at: oneMonthAgo,
        earned_credits: 3,
        notes: 'Отличен резултат на теста!',
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
      },
      {
        student_id: students[0].id,
        lesson_id: 6,
        status: 'completed',
        progress: 100,
        watched_seconds: 900,
        last_watched_at: today,
        is_completed: true,
        completed_at: today,
        test_attempts: 0,
        test_score: null,
        test_passed: false,
        test_completed_at: null,
        earned_credits: 3,
        notes: null,
        created_at: oneWeekAgo,
        updated_at: today,
      },
      {
        student_id: students[0].id,
        lesson_id: 7,
        status: 'in_progress',
        progress: 45,
        watched_seconds: 324,
        last_watched_at: today,
        is_completed: false,
        completed_at: null,
        test_attempts: 0,
        test_score: null,
        test_passed: false,
        test_completed_at: null,
        earned_credits: 0,
        notes: null,
        created_at: today,
        updated_at: today,
      },
    ]);

    // Student Lectures
    await queryInterface.bulkInsert('student_lectures', [
      {
        student_id: students[0].id,
        lecture_id: 4,
        attended: true,
        attended_at: oneWeekAgo,
        earned_credits: 8,
        notes: 'Много полезна лекция!',
        created_at: oneWeekAgo,
        updated_at: oneWeekAgo,
      },
      {
        student_id: students[0].id,
        lecture_id: 1,
        attended: false,
        attended_at: null,
        earned_credits: 0,
        notes: null,
        created_at: today,
        updated_at: today,
      },
      {
        student_id: students[1]?.id || students[0].id,
        lecture_id: 5,
        attended: true,
        attended_at: twoWeeksAgo,
        earned_credits: 10,
        notes: null,
        created_at: twoWeeksAgo,
        updated_at: twoWeeksAgo,
      },
    ]);

    // Student Seminars
    await queryInterface.bulkInsert('student_seminars', [
      {
        student_id: students[0].id,
        seminar_id: 1,
        attended: false,
        attended_at: null,
        earned_credits: 0,
        notes: null,
        created_at: today,
        updated_at: today,
      },
      {
        student_id: students[1]?.id || students[0].id,
        seminar_id: 2,
        attended: false,
        attended_at: null,
        earned_credits: 0,
        notes: null,
        created_at: today,
        updated_at: today,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('student_seminars', null, {});
    await queryInterface.bulkDelete('student_lectures', null, {});
    await queryInterface.bulkDelete('student_lessons', null, {});
    await queryInterface.bulkDelete('student_courses', null, {});
  },
};