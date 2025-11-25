'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const courses = await queryInterface.sequelize.query(
      `SELECT id FROM courses ORDER BY id;`
    );
    const course1Id = courses[0][0]?.id;
    const course2Id = courses[0][1]?.id;
    const course3Id = courses[0][2]?.id;
    const course4Id = courses[0][3]?.id;

    const students = await queryInterface.sequelize.query(
      `SELECT s.id, u.email 
       FROM students s 
       JOIN user_accounts u ON s.user_id = u.id 
       ORDER BY u.email;`
    );

    const student1Id = students[0][0]?.id;
    const student2Id = students[0][1]?.id;
    const student3Id = students[0][2]?.id;
    const student4Id = students[0][3]?.id;
    const student5Id = students[0][4]?.id;

    await queryInterface.bulkInsert('student_courses', [
      // Student 1
      { student_id: student1Id, course_id: course1Id, mentor_course_id: null, status: 'in_progress', progress: 85, completed_lessons: 10, total_lessons: 12, earned_credits: 100, max_credits: 120, start_date: new Date('2024-11-05'), end_date: null, created_at: new Date(), updated_at: new Date() },
      { student_id: student1Id, course_id: course4Id, mentor_course_id: null, status: 'in_progress', progress: 40, completed_lessons: 4, total_lessons: 9, earned_credits: 40, max_credits: 90, start_date: new Date('2024-11-20'), end_date: null, created_at: new Date(), updated_at: new Date() },

      // Student 2
      { student_id: student2Id, course_id: course2Id, mentor_course_id: null, status: 'in_progress', progress: 70, completed_lessons: 7, total_lessons: 10, earned_credits: 70, max_credits: 100, start_date: new Date('2024-11-06'), end_date: null, created_at: new Date(), updated_at: new Date() },

      // Student 3
      { student_id: student3Id, course_id: course1Id, mentor_course_id: null, status: 'completed', progress: 100, completed_lessons: 12, total_lessons: 12, earned_credits: 120, max_credits: 120, start_date: new Date('2024-11-05'), end_date: new Date('2024-12-01'), created_at: new Date(), updated_at: new Date() },
      { student_id: student3Id, course_id: course3Id, mentor_course_id: null, status: 'completed', progress: 100, completed_lessons: 8, total_lessons: 8, earned_credits: 80, max_credits: 80, start_date: new Date('2024-11-09'), end_date: new Date('2024-11-28'), created_at: new Date(), updated_at: new Date() },
      { student_id: student3Id, course_id: course4Id, mentor_course_id: null, status: 'in_progress', progress: 55, completed_lessons: 5, total_lessons: 9, earned_credits: 55, max_credits: 90, start_date: new Date('2024-11-20'), end_date: null, created_at: new Date(), updated_at: new Date() },

      // Student 4
      { student_id: student4Id, course_id: course1Id, mentor_course_id: null, status: 'in_progress', progress: 33, completed_lessons: 4, total_lessons: 12, earned_credits: 40, max_credits: 120, start_date: new Date('2024-11-15'), end_date: null, created_at: new Date(), updated_at: new Date() },

      // Student 5
      { student_id: student5Id, course_id: course3Id, mentor_course_id: null, status: 'completed', progress: 100, completed_lessons: 8, total_lessons: 8, earned_credits: 80, max_credits: 80, start_date: new Date('2024-12-01'), end_date: new Date('2024-12-28'), created_at: new Date(), updated_at: new Date() },
      { student_id: student5Id, course_id: course4Id, mentor_course_id: null, status: 'completed', progress: 100, completed_lessons: 9, total_lessons: 9, earned_credits: 90, max_credits: 90, start_date: new Date('2024-12-05'), end_date: new Date('2025-01-10'), created_at: new Date(), updated_at: new Date() },
    ]);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('student_courses', null, {});
  },
};