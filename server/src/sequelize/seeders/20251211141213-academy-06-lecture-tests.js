// server/src/sequelize/seeders/XXXXXX-academy-06-lecture-tests.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Провери дали вече има тестове за лекции
    const existing = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM lesson_tests WHERE lecture_id IS NOT NULL;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (parseInt(existing[0].count) > 0) {
      console.log('✅ Lecture tests already seeded, skipping...');
      return;
    }

    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const createdBy = users[0]?.id || 1;

    // Провери дали има лекции
    const [lectures] = await queryInterface.sequelize.query(
      `SELECT id, title FROM lectures WHERE is_published = true LIMIT 3`
    );

    if (lectures.length === 0) {
      console.log('⚠️ No lectures found, skipping lecture tests seeder...');
      return;
    }

    // Създай тестове за първите 3 лекции
    const lectureTests = lectures.map((lecture, index) => ({
      lecture_id: lecture.id,
      lesson_id: null,
      created_by: createdBy,
      title: `Тест: ${lecture.title}`,
      description: `Проверете знанията си от лекцията "${lecture.title}"`,
      passing_score: 70,
      max_attempts: 3,
      time_limit_minutes: 15,
      shuffle_questions: true,
      shuffle_answers: true,
      show_correct_answers: true,
      max_credits: 3,
      status: 'active',
      is_published: true,
      questions_count: 4,
      attempts_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('lesson_tests', lectureTests);

    // Вземи ID-тата на новите тестове
    const [newTests] = await queryInterface.sequelize.query(
      `SELECT id, lecture_id FROM lesson_tests WHERE lecture_id IS NOT NULL ORDER BY id`
    );

    // Създай въпроси за всеки тест
    const questions = [];
    let questionId = 100; // Започни от 100 за да не се препокрива

    for (const test of newTests) {
      questions.push(
        { id: questionId++, test_id: test.id, question_text: 'Какво научихте от тази лекция?', question_type: 'single', points: 1, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: questionId++, test_id: test.id, question_text: 'Кой беше основният фокус на лекцията?', question_type: 'single', points: 1, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: questionId++, test_id: test.id, question_text: 'Вярно ли е, че лекцията беше полезна?', question_type: 'true_false', points: 1, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: questionId++, test_id: test.id, question_text: 'Какво бихте искали да научите повече?', question_type: 'single', points: 1, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    await queryInterface.bulkInsert('test_questions', questions);

    // Създай отговори
    const answers = [];
    let answerId = 500;

    for (let i = 100; i < questionId; i++) {
      const q = questions.find(q => q.id === i);
      if (q.question_type === 'true_false') {
        answers.push(
          { id: answerId++, question_id: i, answer_text: 'Вярно', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
          { id: answerId++, question_id: i, answer_text: 'Невярно', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() }
        );
      } else {
        answers.push(
          { id: answerId++, question_id: i, answer_text: 'Отговор А (верен)', is_correct: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
          { id: answerId++, question_id: i, answer_text: 'Отговор Б', is_correct: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
          { id: answerId++, question_id: i, answer_text: 'Отговор В', is_correct: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
          { id: answerId++, question_id: i, answer_text: 'Отговор Г', is_correct: false, sort_order: 4, created_at: new Date(), updated_at: new Date() }
        );
      }
    }

    await queryInterface.bulkInsert('test_answers', answers);

    console.log(`✅ Lecture tests seeded: ${newTests.length} tests`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lesson_tests', { lecture_id: { [Sequelize.Op.ne]: null } }, {});
  },
};