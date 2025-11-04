// server/src/sequelize/seeders/YYYYMMDDHHMMSS-demo-reviews.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const reviews = [
      // ✅ 3 ОДОБРЕНИ ACADEMY REVIEWS
      {
        user_id: 1,
        review_type: 'academy',
        target_id: null,
        name: 'Мария Иванова',
        email: 'maria.ivanova@example.com',
        role: 'participant',
        rating: 5,
        text: 'Страхотна платформа! Научих толкова много нови неща за дигиталния свят. Менторите са изключително подготвени и търпеливи. Препоръчвам топло на всеки, който иска да развие дигиталните си умения!',
        status: 'approved',
        approved_at: new Date('2024-01-15'),
        approved_by: 1,
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-15')
      },
      {
        user_id: 2,
        review_type: 'academy',
        target_id: null,
        name: 'Георги Петров',
        email: 'georgi.petrov@example.com',
        role: 'participant',
        rating: 5,
        text: 'На 67 години успях да науча как да използвам смартфона си уверено! Много съм благодарен на екипа на DigiBridge Academy. Сега мога да общувам с внуците си през видео обаждания и да си плащам сметките онлайн.',
        status: 'approved',
        approved_at: new Date('2024-02-20'),
        approved_by: 1,
        created_at: new Date('2024-02-18'),
        updated_at: new Date('2024-02-20')
      },
      {
        user_id: 3,
        review_type: 'academy',
        target_id: null,
        name: 'Анна Димитрова',
        email: 'anna.dimitrova@example.com',
        role: 'mentor',
        rating: 5,
        text: 'Като ментор в академията, мога да кажа, че това е невероятно обогатяващо преживяване. Виждам как хората преодоляват страховете си от технологиите и стават по-уверени. Организацията е отлична!',
        status: 'approved',
        approved_at: new Date('2024-03-10'),
        approved_by: 1,
        created_at: new Date('2024-03-08'),
        updated_at: new Date('2024-03-10')
      },

      // ❌ 2 НЕОДОБРЕНИ (PENDING) ACADEMY REVIEWS
      {
        user_id: 4,
        review_type: 'academy',
        target_id: null,
        name: 'Иван Стоянов',
        email: 'ivan.stoyanov@example.com',
        role: 'participant',
        rating: 4,
        text: 'Много добра инициатива! Обучението беше полезно, макар че понякога имаше технически проблеми със свързването. Въпреки това, менторът ми беше много отзивчив и ми помогна да преодолея трудностите.',
        status: 'pending',
        approved_at: null,
        approved_by: null,
        created_at: new Date('2024-03-25'),
        updated_at: new Date('2024-03-25')
      },
      {
        user_id: 5,
        review_type: 'academy',
        target_id: null,
        name: 'Елена Христова',
        email: 'elena.hristova@example.com',
        role: 'participant',
        rating: 5,
        text: 'Изключително съм доволна от обучението! Преди се страхувах да използвам интернет, но сега спокойно си правя онлайн покупки и общувам с приятели. Благодаря на DigiBridge!',
        status: 'pending',
        approved_at: null,
        approved_by: null,
        created_at: new Date('2024-03-28'),
        updated_at: new Date('2024-03-28')
      }
    ];

    await queryInterface.bulkInsert('reviews', reviews, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reviews', {
      review_type: 'academy'
    }, {});
  }
};