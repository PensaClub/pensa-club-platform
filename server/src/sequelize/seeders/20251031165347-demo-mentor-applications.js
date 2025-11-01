'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('Applicant123!', 10);

        // ===============================
        // 1. СЪЗДАЙ 5 УНИКАЛНИ USER ACCOUNTS
        // ===============================
        await queryInterface.bulkInsert('user_accounts', [
            {
                email: 'daniela.stoyanova@example.com',
                password: hashedPassword,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'georgi.mihailov@example.com',
                password: hashedPassword,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'radostina.koleva@example.com',
                password: hashedPassword,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'maria.petrova.applicant@example.com',  // ← РАЗЛИЧЕН EMAIL от ментора
                password: hashedPassword,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'ivan.dimitrov@example.com',
                password: hashedPassword,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // ===============================
        // 2. ВЗЕМИ ТЕХНИТЕ ID-ТА
        // ===============================
        const users = await queryInterface.sequelize.query(
            `SELECT id, email FROM user_accounts 
             WHERE email IN (
               'daniela.stoyanova@example.com',
               'georgi.mihailov@example.com',
               'radostina.koleva@example.com',
               'maria.petrova.applicant@example.com',
               'ivan.dimitrov@example.com'
             )
             ORDER BY email;`
        );

        const userMap = {};
        users[0].forEach(user => {
            userMap[user.email] = user.id;
        });

        // ===============================
        // 3. СЪЗДАЙ APPLICATIONS С РАЗЛИЧНИ USER_ID-ТА
        // ===============================
        await queryInterface.bulkInsert('mentor_applications', [
            {
                user_id: userMap['daniela.stoyanova@example.com'],  // ← УНИКАЛЕН
                name: 'Даниела Стоянова',
                email: 'daniela.stoyanova@example.com',
                phone: '+359888111222',
                age: 25,
                photo_url: 'https://randomuser.me/api/portraits/women/28.jpg',
                specialization: 'Digital Security',
                education: 'ВТУ - Информационна сигурност, Бакалавър 2024',
                experience: '1 година опит в кибер сигурност',
                motivation: 'Искам да помагам на възрастните хора да се предпазят от онлайн измами.',
                availability: 'Гъвкав график, предпочитам следобед',
                languages: ['bg', 'en'],
                viber: '+359888111222',
                facebook: 'facebook.com/daniela.stoyanova',
                linkedin: 'linkedin.com/in/danielastoyanova',
                other_contact: '',
                priority_contact: 'viber',
                cv_url: 'https://example.com/cv_daniela.pdf',
                cv_original_name: 'Daniela_Stoyanova_CV.pdf',
                cv_storage_path: 'mentor_applications/cv/daniela_stoyanova_cv.pdf',
                status: 'pending',
                rejection_reason: null,
                approved_at: null,
                rejected_at: null,
                createdAt: new Date('2025-01-28T09:30:00Z'),
                updatedAt: new Date('2025-01-28T09:30:00Z'),
            },
            {
                user_id: userMap['georgi.mihailov@example.com'],  // ← УНИКАЛЕН
                name: 'Георги Михайлов',
                email: 'georgi.mihailov@example.com',
                phone: '+359887333444',
                age: 30,
                photo_url: 'https://randomuser.me/api/portraits/men/45.jpg',
                specialization: 'Media Literacy',
                education: 'СУ - Журналистика, Магистър 2020',
                experience: '5 години в медийния сектор като журналист',
                motivation: 'Имам страст да обучавам хората как да разпознават фалшиви новини.',
                availability: 'Вечер и уикенди',
                languages: ['bg', 'en', 'de'],
                viber: '',
                facebook: 'facebook.com/georgi.mihailov',
                linkedin: 'linkedin.com/in/georgimihailov',
                other_contact: 'Telegram: @georgim',
                priority_contact: 'facebook',
                cv_url: 'https://example.com/cv_georgi.pdf',
                cv_original_name: 'Georgi_Mihailov_CV.pdf',
                cv_storage_path: 'mentor_applications/cv/georgi_mihailov_cv.pdf',
                status: 'pending',
                rejection_reason: null,
                approved_at: null,
                rejected_at: null,
                createdAt: new Date('2025-01-27T14:20:00Z'),
                updatedAt: new Date('2025-01-27T14:20:00Z'),
            },
            {
                user_id: userMap['radostina.koleva@example.com'],  // ← УНИКАЛЕН
                name: 'Радостина Колева',
                email: 'radostina.koleva@example.com',
                phone: '+359889555666',
                age: 27,
                photo_url: 'https://randomuser.me/api/portraits/women/52.jpg',
                specialization: 'Online Banking',
                education: 'УНСС - Банково дело и застраховане, Бакалавър 2021',
                experience: '3 години работа в банков сектор',
                motivation: 'Желая да помогна на възрастните хора да се чувстват уверени при онлайн банкиране.',
                availability: 'Работни дни следобед',
                languages: ['bg', 'en'],
                viber: '+359889555666',
                facebook: '',
                linkedin: 'linkedin.com/in/radostinakoleva',
                other_contact: '',
                priority_contact: 'viber',
                cv_url: 'https://example.com/cv_radostina.pdf',
                cv_original_name: 'Radostina_Koleva_CV.pdf',
                cv_storage_path: 'mentor_applications/cv/radostina_koleva_cv.pdf',
                status: 'pending',
                rejection_reason: null,
                approved_at: null,
                rejected_at: null,
                createdAt: new Date('2025-01-26T11:00:00Z'),
                updatedAt: new Date('2025-01-26T11:00:00Z'),
            },
            {
                user_id: userMap['maria.petrova.applicant@example.com'],  // ← УНИКАЛЕН
                name: 'Мария Петрова',
                email: 'maria.petrova.applicant@example.com',
                phone: '+359888123456',
                age: 24,
                photo_url: 'https://randomuser.me/api/portraits/women/44.jpg',
                specialization: 'Digital Security',
                education: 'СУ - Киберсигурност, Бакалавър 2023',
                experience: '2 години опит в обучение на възрастни хора',
                motivation: 'Искам да помагам на хората да се чувстват по-сигурни онлайн',
                availability: 'Гъвкав график',
                languages: ['bg', 'en'],
                viber: '+359888123456',
                facebook: 'facebook.com/maria.petrova',
                linkedin: 'linkedin.com/in/mariapetrova',
                other_contact: '',
                priority_contact: 'email',
                cv_url: 'https://example.com/cv_maria.pdf',
                cv_original_name: 'Maria_Petrova_CV.pdf',
                cv_storage_path: 'mentor_applications/cv/maria_petrova_cv.pdf',
                status: 'pending',
                rejection_reason: null,
                approved_at: null,
                rejected_at: null,
                createdAt: new Date('2025-01-25T10:00:00Z'),
                updatedAt: new Date('2025-01-25T10:00:00Z'),
            },
            {
                user_id: userMap['ivan.dimitrov@example.com'],  // ← УНИКАЛЕН
                name: 'Иван Димитров',
                email: 'ivan.dimitrov@example.com',
                phone: '+359887999888',
                age: 32,
                photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
                specialization: 'Email & Communication',
                education: 'ТУ София - Компютърни науки, Магистър 2018',
                experience: '6 години работа в IT сектора',
                motivation: 'Искам да споделя знанията си за дигитална комуникация',
                availability: 'Работни дни следобед и вечер',
                languages: ['bg', 'en', 'ru'],
                viber: '+359887999888',
                facebook: '',
                linkedin: 'linkedin.com/in/ivandimitrov',
                other_contact: 'Skype: ivan.dimitrov',
                priority_contact: 'viber',
                cv_url: 'https://example.com/cv_ivan.pdf',
                cv_original_name: 'Ivan_Dimitrov_CV.pdf',
                cv_storage_path: 'mentor_applications/cv/ivan_dimitrov_cv.pdf',
                status: 'pending',
                rejection_reason: null,
                approved_at: null,
                rejected_at: null,
                createdAt: new Date('2025-01-24T15:30:00Z'),
                updatedAt: new Date('2025-01-24T15:30:00Z'),
            },
        ]);

    },

    async down(queryInterface, Sequelize) {
        // Изтрий applications
        await queryInterface.bulkDelete('mentor_applications', {
            email: {
                [Sequelize.Op.in]: [
                    'daniela.stoyanova@example.com',
                    'georgi.mihailov@example.com',
                    'radostina.koleva@example.com',
                    'maria.petrova.applicant@example.com',
                    'ivan.dimitrov@example.com'
                ]
            }
        }, {});

        // Изтрий users
        await queryInterface.bulkDelete('user_accounts', {
            email: {
                [Sequelize.Op.in]: [
                    'daniela.stoyanova@example.com',
                    'georgi.mihailov@example.com',
                    'radostina.koleva@example.com',
                    'maria.petrova.applicant@example.com',
                    'ivan.dimitrov@example.com'
                ]
            }
        }, {});

    },
};