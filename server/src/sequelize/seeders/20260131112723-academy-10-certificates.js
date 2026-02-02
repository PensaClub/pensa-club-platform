'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ===============================
    // UPDATE ALL COURSES TO HAVE CERTIFICATES
    // ===============================
    await queryInterface.sequelize.query(
      `UPDATE courses SET has_certificate = true WHERE has_certificate = false;`
    );

    // ===============================
    // GET ADMIN USER (issuer)
    // ===============================
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1;`
    );
    const issuedBy = admins[0]?.id || 1;

    // ===============================
    // GET STUDENTS
    // ===============================
    const [students] = await queryInterface.sequelize.query(
      `SELECT s.id, s.user_id, u.email
       FROM students s
       JOIN user_accounts u ON s.user_id = u.id
       WHERE u.email IN ('student1@example.com', 'student3@example.com', 'student5@example.com')
       ORDER BY u.email;`
    );

    if (students.length === 0) {
      console.log('No students found. Skipping certificates seeder.');
      return;
    }

    const student1 = students.find(s => s.email === 'student1@example.com');
    const student3 = students.find(s => s.email === 'student3@example.com');
    const student5 = students.find(s => s.email === 'student5@example.com');

    // Hardcoded names
    const studentNames = {
      [student1?.id]: 'Иван Петков',
      [student3?.id]: 'Георги Димитров',
      [student5?.id]: 'Петър Христов',
    };

    // ===============================
    // GET COURSES
    // ===============================
    const [courses] = await queryInterface.sequelize.query(
      `SELECT id, name, category, credits_for_completion FROM courses ORDER BY id;`
    );

    const course1 = courses.find(c => c.id === 1);
    const course2 = courses.find(c => c.id === 2);
    const course3 = courses.find(c => c.id === 3);

    // ===============================
    // HELPER: Generate certificate number
    // ===============================
    const generateCertNumber = (studentId, courseId, year) => {
      return `CERT-${year}-${String(studentId).padStart(4, '0')}-${String(courseId).padStart(3, '0')}`;
    };

    // ===============================
    // HELPER: Generate validation code
    // ===============================
    const generateValidationCode = (index) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `VAL-${code}-${index}`;
    };

    // ===============================
    // INSERT CERTIFICATES
    // ===============================
    await queryInterface.bulkInsert('certificates', [
      // Student 1 - Course 1 (Основи на компютъра)
      {
        student_id: student1.id,
        course_id: 1,
        issued_by: issuedBy,
        certificate_number: generateCertNumber(student1.id, 1, 2024),
        student_name: studentNames[student1.id],
        course_title: course1.name,
        course_category: course1.category,
        completion_date: new Date('2024-12-15'),
        final_score: 87.5,
        total_credits_earned: 50,
        total_hours_completed: 8,
        pdf_url: 'https://example.com/certificates/cert-2024-0001-001.pdf',
        validation_code: generateValidationCode(1),
        valid_until: new Date('2027-12-15'),
        status: 'active',
        revoked_at: null,
        revoked_reason: null,
        additional_info: JSON.stringify({ 
          lessonsCompleted: 5, 
          testsPassed: 2,
          averageTestScore: 87.5
        }),
        issued_at: new Date('2024-12-16'),
        created_at: new Date('2024-12-16'),
        updated_at: new Date('2024-12-16'),
      },

      // Student 3 - Course 1 (Основи на компютъра)
      {
        student_id: student3.id,
        course_id: 1,
        issued_by: issuedBy,
        certificate_number: generateCertNumber(student3.id, 1, 2024),
        student_name: studentNames[student3.id],
        course_title: course1.name,
        course_category: course1.category,
        completion_date: new Date('2024-12-01'),
        final_score: 97.5,
        total_credits_earned: 50,
        total_hours_completed: 7,
        pdf_url: 'https://example.com/certificates/cert-2024-0003-001.pdf',
        validation_code: generateValidationCode(2),
        valid_until: new Date('2027-12-01'),
        status: 'active',
        revoked_at: null,
        revoked_reason: null,
        additional_info: JSON.stringify({ 
          lessonsCompleted: 5, 
          testsPassed: 2,
          averageTestScore: 97.5,
          distinction: true
        }),
        issued_at: new Date('2024-12-02'),
        created_at: new Date('2024-12-02'),
        updated_at: new Date('2024-12-02'),
      },

      // Student 3 - Course 2 (Електронна поща)
      {
        student_id: student3.id,
        course_id: 2,
        issued_by: issuedBy,
        certificate_number: generateCertNumber(student3.id, 2, 2024),
        student_name: studentNames[student3.id],
        course_title: course2.name,
        course_category: course2.category,
        completion_date: new Date('2024-12-25'),
        final_score: 88.0,
        total_credits_earned: 40,
        total_hours_completed: 6,
        pdf_url: 'https://example.com/certificates/cert-2024-0003-002.pdf',
        validation_code: generateValidationCode(3),
        valid_until: new Date('2027-12-25'),
        status: 'active',
        revoked_at: null,
        revoked_reason: null,
        additional_info: JSON.stringify({ 
          lessonsCompleted: 4, 
          testsPassed: 1,
          averageTestScore: 88.0
        }),
        issued_at: new Date('2024-12-26'),
        created_at: new Date('2024-12-26'),
        updated_at: new Date('2024-12-26'),
      },

      // Student 5 - Course 1 (Основи на компютъра)
      {
        student_id: student5.id,
        course_id: 1,
        issued_by: issuedBy,
        certificate_number: generateCertNumber(student5.id, 1, 2024),
        student_name: studentNames[student5.id],
        course_title: course1.name,
        course_category: course1.category,
        completion_date: new Date('2024-12-20'),
        final_score: 97.5,
        total_credits_earned: 50,
        total_hours_completed: 6,
        pdf_url: 'https://example.com/certificates/cert-2024-0005-001.pdf',
        validation_code: generateValidationCode(4),
        valid_until: new Date('2027-12-20'),
        status: 'active',
        revoked_at: null,
        revoked_reason: null,
        additional_info: JSON.stringify({ 
          lessonsCompleted: 5, 
          testsPassed: 2,
          averageTestScore: 97.5,
          distinction: true
        }),
        issued_at: new Date('2024-12-21'),
        created_at: new Date('2024-12-21'),
        updated_at: new Date('2024-12-21'),
      },

      // Student 5 - Course 2 (Електронна поща)
      {
        student_id: student5.id,
        course_id: 2,
        issued_by: issuedBy,
        certificate_number: generateCertNumber(student5.id, 2, 2025),
        student_name: studentNames[student5.id],
        course_title: course2.name,
        course_category: course2.category,
        completion_date: new Date('2025-01-05'),
        final_score: 92.0,
        total_credits_earned: 40,
        total_hours_completed: 5,
        pdf_url: 'https://example.com/certificates/cert-2025-0005-002.pdf',
        validation_code: generateValidationCode(5),
        valid_until: new Date('2028-01-05'),
        status: 'active',
        revoked_at: null,
        revoked_reason: null,
        additional_info: JSON.stringify({ 
          lessonsCompleted: 4, 
          testsPassed: 1,
          averageTestScore: 92.0
        }),
        issued_at: new Date('2025-01-06'),
        created_at: new Date('2025-01-06'),
        updated_at: new Date('2025-01-06'),
      },

      // Student 5 - Course 3 (Интернет сигурност)
      {
        student_id: student5.id,
        course_id: 3,
        issued_by: issuedBy,
        certificate_number: generateCertNumber(student5.id, 3, 2025),
        student_name: studentNames[student5.id],
        course_title: course3.name,
        course_category: course3.category,
        completion_date: new Date('2025-01-10'),
        final_score: 98.0,
        total_credits_earned: 45,
        total_hours_completed: 5,
        pdf_url: 'https://example.com/certificates/cert-2025-0005-003.pdf',
        validation_code: generateValidationCode(6),
        valid_until: new Date('2028-01-10'),
        status: 'active',
        revoked_at: null,
        revoked_reason: null,
        additional_info: JSON.stringify({ 
          lessonsCompleted: 4, 
          testsPassed: 1,
          averageTestScore: 98.0,
          distinction: true
        }),
        issued_at: new Date('2025-01-11'),
        created_at: new Date('2025-01-11'),
        updated_at: new Date('2025-01-11'),
      },
    ]);

    console.log('✅ Certificates seeded:');

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('certificates', null, {});
    
    await queryInterface.sequelize.query(
      `UPDATE courses SET has_certificate = false WHERE id = 4;`
    );
  },
};