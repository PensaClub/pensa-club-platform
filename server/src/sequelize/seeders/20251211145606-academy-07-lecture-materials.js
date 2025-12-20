// server/src/sequelize/seeders/XXXXXX-academy-07-lecture-materials.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ИЗТРИЙ СТАРИТЕ ДАННИ ПЪРВО
    await queryInterface.bulkDelete('lecture_materials', null, {});

    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`
    );
    const uploadedBy = users[0]?.id || 1;

    // Вземи реалните ID-та на лекциите по slug
    const [lectures] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM lectures`
    );

    if (lectures.length === 0) {
      console.log('⚠️ No lectures found, skipping...');
      return;
    }

    const lectureMap = {};
    lectures.forEach(l => { lectureMap[l.slug] = l.id; });

    await queryInterface.bulkInsert('lecture_materials', [
      // ==========================================
      // Лекция 1: Защита от онлайн измами
      // ==========================================
      {
        lecture_id: lectureMap['zashtita-ot-online-izmami-live'],
        uploaded_by: uploadedBy,
        title: 'Презентация - Онлайн измами',
        description: 'Слайдове от лекцията за онлайн измами',
        material_type: 'pdf',
        file_url: '/uploads/materials/lecture1-online-scams-presentation.pdf',
        original_file_name: 'Онлайн измами - Презентация.pdf',
        file_size: 2800000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 1,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['zashtita-ot-online-izmami-live'],
        uploaded_by: uploadedBy,
        title: 'Чек-лист за разпознаване на фишинг',
        description: 'Бърз списък с признаци на измамни съобщения',
        material_type: 'pdf',
        file_url: '/uploads/materials/phishing-checklist.pdf',
        original_file_name: 'Фишинг чек-лист.pdf',
        file_size: 180000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 2,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['zashtita-ot-online-izmami-live'],
        uploaded_by: uploadedBy,
        title: 'Примери за фалшиви имейли',
        description: 'Реални примери на измамни съобщения с обяснения',
        material_type: 'pdf',
        file_url: '/uploads/materials/fake-emails-examples.pdf',
        original_file_name: 'Примери фалшиви имейли.pdf',
        file_size: 1200000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 3,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================================
      // Лекция 2: Q&A Сесия
      // ==========================================
      {
        lecture_id: lectureMap['qa-sesiya-osnovi-kompyutar'],
        uploaded_by: uploadedBy,
        title: 'Често задавани въпроси - Модул 1',
        description: 'Списък с въпроси и отговори от предишни сесии',
        material_type: 'pdf',
        file_url: '/uploads/materials/module1-faq.pdf',
        original_file_name: 'FAQ Модул 1.pdf',
        file_size: 420000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 1,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['qa-sesiya-osnovi-kompyutar'],
        uploaded_by: uploadedBy,
        title: 'Формуляр за въпроси',
        description: 'Подгответе въпросите си предварително',
        material_type: 'link',
        file_url: null,
        original_file_name: null,
        file_size: null,
        mime_type: null,
        external_url: 'https://forms.google.com/qa-session-questions',
        sort_order: 2,
        is_downloadable: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================================
      // Лекция 3: Смартфони за начинаещи
      // ==========================================
      {
        lecture_id: lectureMap['smartfoni-za-nachinaeshti-live'],
        uploaded_by: uploadedBy,
        title: 'Презентация - Смартфони за начинаещи',
        description: 'Основни слайдове от лекцията',
        material_type: 'pdf',
        file_url: '/uploads/materials/smartphones-beginners-presentation.pdf',
        original_file_name: 'Смартфони за начинаещи.pdf',
        file_size: 3200000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 1,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['smartfoni-za-nachinaeshti-live'],
        uploaded_by: uploadedBy,
        title: 'Илюстрации на жестове',
        description: 'Визуално ръководство за tap, swipe, pinch',
        material_type: 'image',
        file_url: '/uploads/materials/smartphone-gestures.png',
        original_file_name: 'Жестове смартфон.png',
        file_size: 890000,
        mime_type: 'image/png',
        external_url: null,
        sort_order: 2,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['smartfoni-za-nachinaeshti-live'],
        uploaded_by: uploadedBy,
        title: 'Списък с полезни приложения',
        description: 'Препоръчани безплатни приложения за Android',
        material_type: 'pdf',
        file_url: '/uploads/materials/recommended-apps-list.pdf',
        original_file_name: 'Полезни приложения.pdf',
        file_size: 350000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 3,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================================
      // Лекция 4: Практическо занятие - Мишка
      // ==========================================
      {
        lecture_id: lectureMap['praktichesko-zanyatie-mishka'],
        uploaded_by: uploadedBy,
        title: 'Упражнения за мишка',
        description: 'Практически задачи за усвояване на мишката',
        material_type: 'pdf',
        file_url: '/uploads/materials/mouse-practice-exercises.pdf',
        original_file_name: 'Упражнения мишка.pdf',
        file_size: 280000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 1,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['praktichesko-zanyatie-mishka'],
        uploaded_by: uploadedBy,
        title: 'Онлайн игра за практика',
        description: 'Линк към безплатна игра за упражняване с мишка',
        material_type: 'link',
        file_url: null,
        original_file_name: null,
        file_size: null,
        mime_type: null,
        external_url: 'https://mouseaccuracy.com/',
        sort_order: 2,
        is_downloadable: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================================
      // Лекция 5: Gmail съвети и трикове
      // ==========================================
      {
        lecture_id: lectureMap['gmail-tips-tricks'],
        uploaded_by: uploadedBy,
        title: 'Gmail клавишни комбинации',
        description: 'Пълен списък с keyboard shortcuts',
        material_type: 'pdf',
        file_url: '/uploads/materials/gmail-keyboard-shortcuts.pdf',
        original_file_name: 'Gmail shortcuts.pdf',
        file_size: 220000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 1,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['gmail-tips-tricks'],
        uploaded_by: uploadedBy,
        title: 'Ръководство за филтри и етикети',
        description: 'Как да организирате пощата си автоматично',
        material_type: 'pdf',
        file_url: '/uploads/materials/gmail-filters-labels-guide.pdf',
        original_file_name: 'Филтри и етикети.pdf',
        file_size: 480000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 2,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['gmail-tips-tricks'],
        uploaded_by: uploadedBy,
        title: 'Видео: Търсене в Gmail',
        description: 'Допълнително видео с advanced search operators',
        material_type: 'video',
        file_url: null,
        original_file_name: null,
        file_size: null,
        mime_type: null,
        external_url: 'https://www.youtube.com/watch?v=gmail-search-tips',
        sort_order: 3,
        is_downloadable: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ==========================================
      // Лекция 6: Въведение в интернет
      // ==========================================
      {
        lecture_id: lectureMap['vavdenie-v-internet'],
        uploaded_by: uploadedBy,
        title: 'Презентация - Въведение в интернет',
        description: 'Слайдове от лекцията',
        material_type: 'pdf',
        file_url: '/uploads/materials/intro-internet-presentation.pdf',
        original_file_name: 'Въведение в интернет.pdf',
        file_size: 2100000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 1,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['vavdenie-v-internet'],
        uploaded_by: uploadedBy,
        title: 'Речник на интернет термините',
        description: 'Обяснение на основните термини',
        material_type: 'pdf',
        file_url: '/uploads/materials/internet-glossary.pdf',
        original_file_name: 'Интернет речник.pdf',
        file_size: 320000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 2,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lecture_id: lectureMap['vavdenie-v-internet'],
        uploaded_by: uploadedBy,
        title: 'Сравнение на браузъри',
        description: 'Chrome vs Firefox vs Edge - плюсове и минуси',
        material_type: 'pdf',
        file_url: '/uploads/materials/browsers-comparison.pdf',
        original_file_name: 'Сравнение браузъри.pdf',
        file_size: 450000,
        mime_type: 'application/pdf',
        external_url: null,
        sort_order: 3,
        is_downloadable: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ].filter(m => m.lecture_id));

    console.log('✅ Lecture materials seeded: 16 materials for 6 lectures');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lecture_materials', null, {});
  },
};