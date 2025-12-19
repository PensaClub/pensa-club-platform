'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ ПРОВЕРКА: Ако вече има user_credits - skip
    const [existing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM user_credits;`
    );
    
    if (parseInt(existing[0].count) > 0) {
      console.log('✅ User credits already exist, skipping...');
      return;
    }

    // Вземаме студенти с техните user_id
    const [students] = await queryInterface.sequelize.query(
      `SELECT s.id as student_id, s.user_id 
       FROM students s 
       INNER JOIN user_accounts u ON s.user_id = u.id 
       LIMIT 5`
    );

    if (students.length === 0) {
      console.log('No students found, skipping user credits seed');
      return;
    }

    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // User Credits - основни записи
    await queryInterface.bulkInsert('user_credits', [
      // Студент 1 - напреднал с много активност
      {
        user_id: students[0].user_id,
        total_credits: 78,
        credits_by_category: JSON.stringify({
          'Дигитална грамотност': 45,
          'Интернет сигурност': 18,
          'Мобилни устройства': 15,
        }),
        level: 'intermediate',
        courses_completed: 1,
        lectures_attended: 2,
        seminars_attended: 0,
        presentations_viewed: 1,
        tests_passed: 2,
        certificates_earned: 1,
        created_at: oneMonthAgo,
        updated_at: today,
      },
      // Студент 2 - начинаещ
      {
        user_id: students[1]?.user_id || students[0].user_id,
        total_credits: 28,
        credits_by_category: JSON.stringify({
          'Дигитална грамотност': 18,
          'Интернет сигурност': 10,
        }),
        level: 'beginner',
        courses_completed: 0,
        lectures_attended: 1,
        seminars_attended: 0,
        presentations_viewed: 0,
        tests_passed: 0,
        certificates_earned: 0,
        created_at: twoWeeksAgo,
        updated_at: today,
      },
      // Студент 3 - също начинаещ
      {
        user_id: students[2]?.user_id || students[0].user_id,
        total_credits: 12,
        credits_by_category: JSON.stringify({
          'Интернет сигурност': 12,
        }),
        level: 'beginner',
        courses_completed: 0,
        lectures_attended: 0,
        seminars_attended: 0,
        presentations_viewed: 0,
        tests_passed: 0,
        certificates_earned: 0,
        created_at: oneWeekAgo,
        updated_at: today,
      },
    ]);

    // User Credits History - история на транзакциите
    await queryInterface.bulkInsert('user_credits_history', [
      // Студент 1 - история
      {
        user_id: students[0].user_id,
        credits_amount: 30,
        credits_before: 0,
        credits_after: 30,
        source_type: 'course',
        source_id: 1,
        source_title: 'Основи на компютъра',
        category: 'Дигитална грамотност',
        description: 'Завършен курс: Основи на компютъра',
        metadata: JSON.stringify({ completionDate: oneMonthAgo, progress: 100 }),
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
      },
      {
        user_id: students[0].user_id,
        credits_amount: 5,
        credits_before: 30,
        credits_after: 35,
        source_type: 'test',
        source_id: 1,
        source_title: 'Тест: Включване и изключване на компютъра',
        category: 'Дигитална грамотност',
        description: 'Успешно преминат тест с резултат 85%',
        metadata: JSON.stringify({ score: 85, attempts: 1 }),
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
      },
      {
        user_id: students[0].user_id,
        credits_amount: 8,
        credits_before: 35,
        credits_after: 43,
        source_type: 'lecture',
        source_id: 4,
        source_title: 'Практическо занятие: Работа с мишка',
        category: 'Дигитална грамотност',
        description: 'Гледана лекция (запис)',
        metadata: JSON.stringify({ watchedMinutes: 45, completedAt: oneWeekAgo }),
        created_at: oneWeekAgo,
        updated_at: oneWeekAgo,
      },
      {
        user_id: students[0].user_id,
        credits_amount: 10,
        credits_before: 43,
        credits_after: 53,
        source_type: 'lecture',
        source_id: 5,
        source_title: 'Gmail съвети и трикове',
        category: 'Дигитална грамотност',
        description: 'Гледана лекция (запис)',
        metadata: JSON.stringify({ watchedMinutes: 55, completedAt: twoWeeksAgo }),
        created_at: twoWeeksAgo,
        updated_at: twoWeeksAgo,
      },
      {
        user_id: students[0].user_id,
        credits_amount: 18,
        credits_before: 53,
        credits_after: 71,
        source_type: 'course',
        source_id: 2,
        source_title: 'Електронна поща',
        category: 'Дигитална грамотност',
        description: 'Прогрес по курс: 62% завършен',
        metadata: JSON.stringify({ progress: 62, lessonsCompleted: 5 }),
        created_at: oneWeekAgo,
        updated_at: today,
      },
      {
        user_id: students[0].user_id,
        credits_amount: 7,
        credits_before: 71,
        credits_after: 78,
        source_type: 'presentation',
        source_id: 1,
        source_title: 'Как да разпознаем фалшиви новини',
        category: 'Интернет сигурност',
        description: 'Разгледана презентация',
        metadata: JSON.stringify({ slidesViewed: 15, completedAt: today }),
        created_at: today,
        updated_at: today,
      },

      // Студент 2 - история
      {
        user_id: students[1]?.user_id || students[0].user_id,
        credits_amount: 8,
        credits_before: 0,
        credits_after: 8,
        source_type: 'course',
        source_id: 1,
        source_title: 'Основи на компютъра',
        category: 'Дигитална грамотност',
        description: 'Прогрес по курс: 25% завършен',
        metadata: JSON.stringify({ progress: 25, lessonsCompleted: 3 }),
        created_at: oneWeekAgo,
        updated_at: today,
      },
      {
        user_id: students[1]?.user_id || students[0].user_id,
        credits_amount: 10,
        credits_before: 8,
        credits_after: 18,
        source_type: 'lecture',
        source_id: 5,
        source_title: 'Gmail съвети и трикове',
        category: 'Дигитална грамотност',
        description: 'Гледана лекция (запис)',
        metadata: JSON.stringify({ watchedMinutes: 55, completedAt: twoWeeksAgo }),
        created_at: twoWeeksAgo,
        updated_at: twoWeeksAgo,
      },
      {
        user_id: students[1]?.user_id || students[0].user_id,
        credits_amount: 10,
        credits_before: 18,
        credits_after: 28,
        source_type: 'lecture',
        source_id: 6,
        source_title: 'Въведение в интернет',
        category: 'Интернет сигурност',
        description: 'Гледана лекция (запис)',
        metadata: JSON.stringify({ watchedMinutes: 60, completedAt: oneWeekAgo }),
        created_at: oneWeekAgo,
        updated_at: oneWeekAgo,
      },

      // Студент 3 - история
      {
        user_id: students[2]?.user_id || students[0].user_id,
        credits_amount: 12,
        credits_before: 0,
        credits_after: 12,
        source_type: 'course',
        source_id: 3,
        source_title: 'Интернет сигурност',
        category: 'Интернет сигурност',
        description: 'Прогрес по курс: 50% завършен',
        metadata: JSON.stringify({ progress: 50, lessonsCompleted: 3 }),
        created_at: twoWeeksAgo,
        updated_at: today,
      },
    ]);

    console.log('✅ User credits seeded: 3 users with credit history');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_credits_history', null, {});
    await queryInterface.bulkDelete('user_credits', null, {});
  },
};