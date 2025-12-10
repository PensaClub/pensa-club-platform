'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [mentors] = await queryInterface.sequelize.query(
      `SELECT m.id, m.name, m.specialization, u.email 
       FROM mentors m 
       JOIN user_accounts u ON m.user_id = u.id 
       ORDER BY m.id`
    );

    if (mentors.length === 0) {
      console.log('No mentors found, skipping mentor_courses seed');
      return;
    }

    const mentor1 = mentors[0];
    const mentor2 = mentors[1];
    const mentor3 = mentors[2];

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    await queryInterface.bulkInsert('mentor_courses', [
      {
        id: 1,
        mentor_id: mentor1?.id,
        course_id: 3,
        role: 'lecturer',
        is_lead: true,
        course_name: 'Интернет сигурност',
        course_category: 'Интернет сигурност',
        description: 'Водещ лектор по курса за интернет сигурност',
        duration_weeks: 3,
        start_date: twoMonthsAgo,
        end_date: null,
        enrolled_students: 178,
        completed_count: 112,
        status: 'active',
        createdAt: twoMonthsAgo,
        updatedAt: today,
      },
      {
        id: 2,
        mentor_id: mentor1?.id,
        course_id: 1,
        role: 'assistant',
        is_lead: false,
        course_name: 'Основи на компютъра',
        course_category: 'Дигитална грамотност',
        description: 'Асистент по курса',
        duration_weeks: 4,
        start_date: oneMonthAgo,
        end_date: null,
        enrolled_students: 156,
        completed_count: 89,
        status: 'active',
        createdAt: oneMonthAgo,
        updatedAt: today,
      },
      {
        id: 3,
        mentor_id: mentor2?.id,
        course_id: 4,
        role: 'lecturer',
        is_lead: true,
        course_name: 'Viber и WhatsApp',
        course_category: 'Мобилни устройства',
        description: 'Водещ лектор - социални мрежи и комуникация',
        duration_weeks: 2,
        start_date: twoMonthsAgo,
        end_date: null,
        enrolled_students: 234,
        completed_count: 189,
        status: 'active',
        createdAt: twoMonthsAgo,
        updatedAt: today,
      },
      {
        id: 4,
        mentor_id: mentor2?.id,
        course_id: 5,
        role: 'lecturer',
        is_lead: true,
        course_name: 'Смартфон за начинаещи',
        course_category: 'Мобилни устройства',
        description: 'Водещ лектор по мобилни устройства',
        duration_weeks: 4,
        start_date: oneMonthAgo,
        end_date: null,
        enrolled_students: 312,
        completed_count: 198,
        status: 'active',
        createdAt: oneMonthAgo,
        updatedAt: today,
      },
      {
        id: 5,
        mentor_id: mentor3?.id,
        course_id: 1,
        role: 'lecturer',
        is_lead: true,
        course_name: 'Основи на компютъра',
        course_category: 'Дигитална грамотност',
        description: 'Водещ лектор по основи',
        duration_weeks: 4,
        start_date: twoMonthsAgo,
        end_date: null,
        enrolled_students: 156,
        completed_count: 89,
        status: 'active',
        createdAt: twoMonthsAgo,
        updatedAt: today,
      },
      {
        id: 6,
        mentor_id: mentor3?.id,
        course_id: 2,
        role: 'lecturer',
        is_lead: true,
        course_name: 'Електронна поща',
        course_category: 'Дигитална грамотност',
        description: 'Водещ лектор - имейл и онлайн комуникация',
        duration_weeks: 3,
        start_date: oneMonthAgo,
        end_date: null,
        enrolled_students: 203,
        completed_count: 145,
        status: 'active',
        createdAt: oneMonthAgo,
        updatedAt: today,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mentor_courses', null, {});
  },
};