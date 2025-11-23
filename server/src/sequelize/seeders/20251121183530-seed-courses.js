'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminUser = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' ORDER BY id LIMIT 1;`
    );
    const adminId = adminUser[0][0]?.id || 1;

    await queryInterface.bulkInsert('courses', [
      {
        name: 'Основи на компютъра и интернета',
        category: 'Digital Basics',
        description: 'Базов курс за начинаещи - как да работим с компютър, интернет браузър, имейл и основни програми.',
        duration_weeks: 8,
        total_lessons: 12,
        max_credits: 120,
        difficulty_level: 'beginner',
        course_type: 'online',
        status: 'active',
        thumbnail_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400',
        created_by: adminId,
        created_at: new Date('2024-10-01'),
        updated_at: new Date('2024-10-01'),
      },
      {
        name: 'Социални мрежи за начинаещи',
        category: 'Social Media',
        description: 'Научете как безопасно да използвате Facebook, Viber и други социални мрежи.',
        duration_weeks: 6,
        total_lessons: 10,
        max_credits: 100,
        difficulty_level: 'beginner',
        course_type: 'online',
        status: 'active',
        thumbnail_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        created_by: adminId,
        created_at: new Date('2024-10-05'),
        updated_at: new Date('2024-10-05'),
      },
      {
        name: 'Онлайн банкиране и разплащания',
        category: 'Online Banking',
        description: 'Как безопасно да използваме онлайн банкиране, да правим плащания и преводи.',
        duration_weeks: 4,
        total_lessons: 8,
        max_credits: 80,
        difficulty_level: 'intermediate',
        course_type: 'online',
        status: 'active',
        thumbnail_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
        created_by: adminId,
        created_at: new Date('2024-10-10'),
        updated_at: new Date('2024-10-10'),
      },
      {
        name: 'Киберсигурност за възрастни',
        category: 'Digital Security',
        description: 'Как да се предпазим от онлайн измами, фишинг атаки и да пазим личните си данни.',
        duration_weeks: 5,
        total_lessons: 9,
        max_credits: 90,
        difficulty_level: 'intermediate',
        course_type: 'online',
        status: 'active',
        thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
        created_by: adminId,
        created_at: new Date('2024-10-15'),
        updated_at: new Date('2024-10-15'),
      },
    ]);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {});
  },
};