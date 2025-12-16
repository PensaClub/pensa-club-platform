// server/src/sequelize/seeders/20251211141213-academy-06-lecture-tests.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Провери дали вече има тестове за лекции
    const existing = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM lecture_tests;`,
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

    // Вземи лекциите
    const [lectures] = await queryInterface.sequelize.query(
      `SELECT id, title FROM lectures WHERE is_published = true ORDER BY id LIMIT 5`
    );

    if (lectures.length === 0) {
      console.log('⚠️ No lectures found, skipping lecture tests seeder...');
      return;
    }

    // Създай тестове
    const lectureTests = lectures.map((lecture) => ({
      lecture_id: lecture.id,
      created_by: createdBy,
      title: `Тест: ${lecture.title}`,
      description: `Проверете знанията си от лекцията "${lecture.title}"`,
      test_type: 'quiz',
      passing_score: 70,
      max_attempts: 333,
      time_limit_minutes: 15,
      shuffle_questions: true,
      shuffle_answers: true,
      show_correct_answers: true,
      show_score: true,
      allow_review: true,
      max_credits: 3,
      credits_for_passing: 3,
      status: 'active',
      is_published: true,
      total_questions: 5,
      total_points: 6,
      attempts_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('lecture_tests', lectureTests);

    // Вземи новосъздадените тестове
    const [newTests] = await queryInterface.sequelize.query(
      `SELECT id, lecture_id FROM lecture_tests ORDER BY id`
    );

    // Въпроси за всеки тест
    const questions = [];
    const questionsData = [
      {
        question_text: 'Какво научихте от тази лекция?',
        question_type: 'single',
        points: 1,
        explanation: 'Основната цел на лекцията.',
        answers: [
          { text: 'Нови знания и умения', is_correct: true },
          { text: 'Нищо ново', is_correct: false },
          { text: 'Само теория', is_correct: false },
          { text: 'Не мога да преценя', is_correct: false },
        ]
      },
      {
        question_text: 'Кой беше основният фокус на лекцията?',
        question_type: 'single',
        points: 1,
        explanation: 'Фокусът зависи от темата.',
        answers: [
          { text: 'Практически умения', is_correct: true },
          { text: 'Исторически факти', is_correct: false },
          { text: 'Развлечение', is_correct: false },
          { text: 'Друго', is_correct: false },
        ]
      },
      {
        question_text: 'Вярно ли е, че лекцията беше полезна за вашето обучение?',
        question_type: 'true_false',
        points: 1,
        explanation: 'Лекциите са създадени да бъдат полезни.',
        answers: [
          { text: 'Вярно', is_correct: true },
          { text: 'Невярно', is_correct: false },
        ]
      },
      {
        question_text: 'Какво бихте искали да научите повече?',
        question_type: 'single',
        points: 1,
        explanation: 'Всички теми са важни.',
        answers: [
          { text: 'Повече практика', is_correct: true },
          { text: 'Повече теория', is_correct: false },
          { text: 'Нищо допълнително', is_correct: false },
          { text: 'Всичко от изброеното', is_correct: false },
        ]
      },
      {
        question_text: 'Кои от следните са добри практики за онлайн безопасност?',
        question_type: 'multiple',
        points: 2,
        explanation: 'Множество практики допринасят за безопасността.',
        answers: [
          { text: 'Използване на силни пароли', is_correct: true },
          { text: 'Споделяне на пароли с приятели', is_correct: false },
          { text: 'Редовно обновяване на софтуера', is_correct: true },
          { text: 'Кликване на всички линкове', is_correct: false },
        ]
      },
    ];

    for (const test of newTests) {
      questionsData.forEach((q, index) => {
        questions.push({
          test_id: null,                    // ✅ NULL за lesson tests
          lecture_test_id: test.id,         // ✅ ID на lecture test
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points,
          explanation: q.explanation,
          sort_order: index + 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    }

    await queryInterface.bulkInsert('test_questions', questions);

    // Вземи въпросите за LECTURE tests
    const [insertedQuestions] = await queryInterface.sequelize.query(
      `SELECT id, question_text, lecture_test_id FROM test_questions WHERE lecture_test_id IS NOT NULL ORDER BY id`
    );

    // Създай отговори
    const answers = [];

    for (const question of insertedQuestions) {
      const qData = questionsData.find(q => q.question_text === question.question_text);
      if (qData) {
        qData.answers.forEach((ans, index) => {
          answers.push({
            question_id: question.id,
            answer_text: ans.text,
            is_correct: ans.is_correct,
            sort_order: index + 1,
            created_at: new Date(),
            updated_at: new Date(),
          });
        });
      }
    }

    await queryInterface.bulkInsert('test_answers', answers);

    console.log(`✅ Lecture tests seeded: ${newTests.length} tests, ${insertedQuestions.length} questions, ${answers.length} answers`);
  },

  async down(queryInterface, Sequelize) {
    // Изтрий отговорите за въпроси от lecture tests
    await queryInterface.sequelize.query(
      `DELETE FROM test_answers WHERE question_id IN (SELECT id FROM test_questions WHERE lecture_test_id IS NOT NULL)`
    );
    // Изтрий въпросите
    await queryInterface.sequelize.query(
      `DELETE FROM test_questions WHERE lecture_test_id IS NOT NULL`
    );
    // Изтрий тестовете
    await queryInterface.bulkDelete('lecture_tests', null, {});
  },
};