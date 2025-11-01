'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        const existingUsers = await queryInterface.sequelize.query(
            `SELECT id, email FROM user_accounts 
             WHERE email IN ('mentor1@example.com', 'mentor2@example.com', 'mentor3@example.com', 'rejected1@example.com');`
        );

        let user1Id, user2Id, user3Id, user4Id;

        if (existingUsers[0].length === 0) {
     
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('Mentor123!', 10);

            await queryInterface.bulkInsert('user_accounts', [
                {
                    email: 'mentor1@example.com',
                    password: hashedPassword,
                    role: 'mentor',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'mentor2@example.com',
                    password: hashedPassword,
                    role: 'mentor',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'mentor3@example.com',
                    password: hashedPassword,
                    role: 'mentor',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'rejected1@example.com',
                    password: hashedPassword,
                    role: 'user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            const newUsers = await queryInterface.sequelize.query(
                `SELECT id, email FROM user_accounts 
                 WHERE email IN ('mentor1@example.com', 'mentor2@example.com', 'mentor3@example.com', 'rejected1@example.com')
                 ORDER BY email;`
            );

            user1Id = newUsers[0][0].id; 
            user2Id = newUsers[0][1].id; 
            user3Id = newUsers[0][2].id;  
            user4Id = newUsers[0][3].id;  
        } else {
  
            user1Id = existingUsers[0].find(u => u.email === 'mentor1@example.com')?.id;
            user2Id = existingUsers[0].find(u => u.email === 'mentor2@example.com')?.id;
            user3Id = existingUsers[0].find(u => u.email === 'mentor3@example.com')?.id;
            user4Id = existingUsers[0].find(u => u.email === 'rejected1@example.com')?.id;
        }
        
        await queryInterface.bulkInsert('mentors', [
            {
                user_id: user1Id,
                application_id: null,
                name: 'Мария Петрова',
                email: 'maria.petrova@example.com',
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
                priority_contact: 'viber',
                cv_url: 'https://example.com/cv_maria.pdf',
                cv_original_name: 'Maria_Petrova_CV.pdf',
                status: 'active',
                is_online: true,
                students_count: 12,
                rating: 4.9,
                sessions_count: 45,
                approved_at: new Date('2025-01-11T14:30:00Z'),
                last_active_at: new Date('2025-01-28T11:00:00Z'),
                admin_notes: 'Много добър ментор, отзивчив и професионален',
                createdAt: new Date('2025-01-10T10:00:00Z'),
                updatedAt: new Date('2025-01-28T11:00:00Z'),
            },
            {
                user_id: user2Id,
                application_id: null,
                name: 'Иван Георгиев',
                email: 'ivan.georgiev@example.com',
                phone: '+359887654321',
                age: 28,
                photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
                specialization: 'Social Media',
                education: 'НБУ - Комуникации и дигитални медии',
                experience: '3 години опит като социален мениджър',
                motivation: 'Обичам да споделям знания за социалните мрежи',
                availability: 'Вечер и уикенди',
                languages: ['bg', 'en', 'de'],
                viber: '+359887654321',
                facebook: 'facebook.com/ivan.georgiev',
                linkedin: 'linkedin.com/in/ivangeorgiev',
                other_contact: 'Telegram: @ivangeorgiev',
                priority_contact: 'facebook',
                cv_url: 'https://example.com/cv_ivan.pdf',
                cv_original_name: 'Ivan_Georgiev_CV.pdf',
                status: 'active',
                is_online: false,
                students_count: 8,
                rating: 4.7,
                sessions_count: 32,
                approved_at: new Date('2025-01-13T16:00:00Z'),
                last_active_at: new Date('2025-01-27T18:30:00Z'),
                admin_notes: '',
                createdAt: new Date('2025-01-12T09:00:00Z'),
                updatedAt: new Date('2025-01-27T18:30:00Z'),
            },
            {
                user_id: user3Id,
                application_id: null,
                name: 'Елена Димитрова',
                email: 'elena.dimitrova@example.com',
                phone: '+359889999888',
                age: 26,
                photo_url: 'https://randomuser.me/api/portraits/women/65.jpg',
                specialization: 'Online Banking',
                education: 'УНСС - Финанси и банкиране',
                experience: '4 години в банков сектор',
                motivation: 'Желая да помогна на възрастните хора с онлайн банкиране',
                availability: 'Работни дни следобед',
                languages: ['bg', 'en'],
                viber: '',
                facebook: '',
                linkedin: 'linkedin.com/in/elenadimitrova',
                other_contact: '',
                priority_contact: 'linkedin',
                cv_url: 'https://example.com/cv_elena.pdf',
                cv_original_name: 'Elena_Dimitrova_CV.pdf',
                status: 'active',
                is_online: true,
                students_count: 15,
                rating: 5.0,
                sessions_count: 58,
                approved_at: new Date('2025-01-09T10:30:00Z'),
                last_active_at: new Date('2025-01-28T09:15:00Z'),
                admin_notes: 'Топ ментор! Много отговорна и компетентна',
                createdAt: new Date('2025-01-08T14:00:00Z'),
                updatedAt: new Date('2025-01-28T09:15:00Z'),
            },
        ]);

        await queryInterface.bulkInsert('mentor_applications', [
            {
                user_id: user4Id,  
                name: 'Петър Иванов',
                email: 'peter.ivanov@example.com',
                phone: '+359888777666',
                age: 22,
                photo_url: 'https://randomuser.me/api/portraits/men/75.jpg',
                specialization: 'Media Literacy',
                education: 'Студент в СУ - Журналистика',
                experience: '6 месеца стаж в местна медия',
                motivation: 'Искам да помагам на хората да разпознават фалшиви новини',
                availability: 'Уикенди',
                languages: ['bg'],
                viber: '+359888777666',
                facebook: 'facebook.com/peter.ivanov',
                linkedin: '',
                other_contact: '',
                priority_contact: 'viber',
                cv_url: 'https://example.com/cv_peter.pdf',
                cv_original_name: 'Peter_Ivanov_CV.pdf',
                status: 'rejected',
                rejection_reason: 'Недостатъчен опит в областта',
                approved_at: null,
                rejected_at: new Date('2025-01-21T09:00:00Z'),
                createdAt: new Date('2025-01-20T11:00:00Z'),
                updatedAt: new Date('2025-01-21T09:00:00Z'),
            },
        ]);

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('mentors', null, {});
        await queryInterface.bulkDelete('mentor_applications', {
            status: 'rejected'
        }, {});
        await queryInterface.bulkDelete('user_accounts', {
            email: {
                [Sequelize.Op.in]: ['mentor1@example.com', 'mentor2@example.com', 'mentor3@example.com', 'rejected1@example.com']
            }
        }, {});
    },
};