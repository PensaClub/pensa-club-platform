'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // ===============================
        // ПРОВЕРКА - АКО ИМА ДАННИ, СПРИ
        // ===============================
        const existing = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM club_visit_requests;`
        );

        if (parseInt(existing[0][0].count) > 0) {
            console.log('✅ ReAction data already exists, skipping...');
            return;
        }

        // ===============================
        // ВЗЕМИ MENTOR IDs
        // ===============================
        const mentors = await queryInterface.sequelize.query(
            `SELECT id, name FROM mentors WHERE status = 'active' ORDER BY id;`
        );

        if (mentors[0].length < 2) {
            console.log('⚠️ Not enough mentors found. Run mentor seeds first.');
            return;
        }

        const mentor1 = mentors[0][0].id; // Мария Петрова
        const mentor2 = mentors[0][1].id; // Иван Георгиев
        const mentor3 = mentors[0].length > 2 ? mentors[0][2].id : mentor1; // Елена Димитрова

        const now = new Date();

        // =============================================
        // 1. CLUB VISIT REQUESTS (12 заявки в различни статуси)
        // =============================================
        await queryInterface.bulkInsert('club_visit_requests', [
            // --- COMPLETED (3) ---
            {
                tracking_code: 'RAC-001-ABC',
                club_name: 'Пенсионерски клуб Надежда',
                city: 'София',
                participants_count: 30,
                topic: 'fake_news',
                topic_other: null,
                preferred_date: '2026-02-10',
                contact_name: 'Стоянка Иванова',
                contact_phone: '+359888111222',
                contact_email: 'stoyanka@example.com',
                notes: 'Имаме проектор и екран.',
                status: 'completed',
                assigned_mentor_id: mentor1,
                admin_notes: 'Успешно проведена среща.',
                cancel_reason: null,
                confirmed_at: new Date('2026-02-05'),
                completed_at: new Date('2026-02-10'),
                cancelled_at: null,
                reminder_sent: true,
                ip_address: '192.168.1.10',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                created_at: new Date('2026-01-25'),
                updated_at: new Date('2026-02-10'),
            },
            {
                tracking_code: 'RAC-002-DEF',
                club_name: 'Клуб на пенсионера - Възраждане',
                city: 'Пловдив',
                participants_count: 22,
                topic: 'voter_rights',
                topic_other: null,
                preferred_date: '2026-02-18',
                contact_name: 'Георги Димитров',
                contact_phone: '+359877222333',
                contact_email: 'georgi.d@example.com',
                notes: null,
                status: 'completed',
                assigned_mentor_id: mentor2,
                admin_notes: 'Много ентусиазирана група.',
                cancel_reason: null,
                confirmed_at: new Date('2026-02-12'),
                completed_at: new Date('2026-02-18'),
                cancelled_at: null,
                reminder_sent: true,
                ip_address: '10.0.0.5',
                user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                created_at: new Date('2026-02-01'),
                updated_at: new Date('2026-02-18'),
            },
            {
                tracking_code: 'RAC-003-GHI',
                club_name: 'Читалище Христо Ботев',
                city: 'Варна',
                participants_count: 45,
                topic: 'election_process',
                topic_other: null,
                preferred_date: '2026-02-25',
                contact_name: 'Мария Колева',
                contact_phone: '+359899333444',
                contact_email: 'maria.koleva@example.com',
                notes: 'Моля, осигурете материали на хартия за участниците.',
                status: 'completed',
                assigned_mentor_id: mentor3,
                admin_notes: null,
                cancel_reason: null,
                confirmed_at: new Date('2026-02-19'),
                completed_at: new Date('2026-02-25'),
                cancelled_at: null,
                reminder_sent: true,
                ip_address: '172.16.0.3',
                user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
                created_at: new Date('2026-02-08'),
                updated_at: new Date('2026-02-25'),
            },
            // --- CONFIRMED (2) ---
            {
                tracking_code: 'RAC-004-JKL',
                club_name: 'Пенсионерски клуб Зора',
                city: 'Бургас',
                participants_count: 18,
                topic: 'fake_news',
                topic_other: null,
                preferred_date: '2026-03-20',
                contact_name: 'Петър Стоянов',
                contact_phone: '+359888444555',
                contact_email: 'petar.st@example.com',
                notes: null,
                status: 'confirmed',
                assigned_mentor_id: mentor1,
                admin_notes: 'Потвърдено по телефона.',
                cancel_reason: null,
                confirmed_at: new Date('2026-03-10'),
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '192.168.0.15',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                created_at: new Date('2026-03-01'),
                updated_at: new Date('2026-03-10'),
            },
            {
                tracking_code: 'RAC-005-MNO',
                club_name: 'Клуб Дълголетие',
                city: 'Стара Загора',
                participants_count: 35,
                topic: 'voter_rights',
                topic_other: null,
                preferred_date: '2026-03-25',
                contact_name: 'Иванка Николова',
                contact_phone: '+359877555666',
                contact_email: 'ivanka.n@example.com',
                notes: 'Залата е на втория етаж, има асансьор.',
                status: 'confirmed',
                assigned_mentor_id: mentor2,
                admin_notes: null,
                cancel_reason: null,
                confirmed_at: new Date('2026-03-11'),
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '10.10.0.8',
                user_agent: 'Mozilla/5.0 (Linux; Android 14)',
                created_at: new Date('2026-03-03'),
                updated_at: new Date('2026-03-11'),
            },
            // --- MENTOR_ASSIGNED (2) ---
            {
                tracking_code: 'RAC-006-PQR',
                club_name: 'Пенсионерски клуб Единство',
                city: 'Русе',
                participants_count: 25,
                topic: 'election_process',
                topic_other: null,
                preferred_date: '2026-03-28',
                contact_name: 'Димитър Павлов',
                contact_phone: '+359888666777',
                contact_email: 'dimitar.p@example.com',
                notes: null,
                status: 'mentor_assigned',
                assigned_mentor_id: mentor3,
                admin_notes: 'Чакаме потвърждение от ментора.',
                cancel_reason: null,
                confirmed_at: null,
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '192.168.1.22',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                created_at: new Date('2026-03-05'),
                updated_at: new Date('2026-03-09'),
            },
            {
                tracking_code: 'RAC-007-STU',
                club_name: 'Читалище Съгласие',
                city: 'Плевен',
                participants_count: 40,
                topic: 'fake_news',
                topic_other: null,
                preferred_date: '2026-04-02',
                contact_name: 'Елена Маринова',
                contact_phone: '+359899777888',
                contact_email: 'elena.m@example.com',
                notes: 'Предпочитаме сутрин, около 10:00.',
                status: 'mentor_assigned',
                assigned_mentor_id: mentor1,
                admin_notes: null,
                cancel_reason: null,
                confirmed_at: null,
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '172.16.5.1',
                user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                created_at: new Date('2026-03-07'),
                updated_at: new Date('2026-03-10'),
            },
            // --- REVIEWING (2) ---
            {
                tracking_code: 'RAC-008-VWX',
                club_name: 'Пенсионерски клуб Здравец',
                city: 'Велико Търново',
                participants_count: 20,
                topic: 'other',
                topic_other: 'Безопасно ползване на интернет',
                preferred_date: '2026-04-08',
                contact_name: 'Николай Тодоров',
                contact_phone: '+359888888999',
                contact_email: 'nikolay.t@example.com',
                notes: 'Интересуваме се от защита от онлайн измами.',
                status: 'reviewing',
                assigned_mentor_id: null,
                admin_notes: 'Темата е извън стандартните, да обсъдим.',
                cancel_reason: null,
                confirmed_at: null,
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '10.20.0.4',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                created_at: new Date('2026-03-09'),
                updated_at: new Date('2026-03-10'),
            },
            {
                tracking_code: 'RAC-009-YZA',
                club_name: 'Клуб Младост',
                city: 'Благоевград',
                participants_count: 15,
                topic: 'voter_rights',
                topic_other: null,
                preferred_date: '2026-04-10',
                contact_name: 'Росица Ангелова',
                contact_phone: '+359877999000',
                contact_email: 'rositsa.a@example.com',
                notes: null,
                status: 'reviewing',
                assigned_mentor_id: null,
                admin_notes: null,
                cancel_reason: null,
                confirmed_at: null,
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '192.168.2.33',
                user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
                created_at: new Date('2026-03-10'),
                updated_at: new Date('2026-03-10'),
            },
            // --- NEW (2) ---
            {
                tracking_code: 'RAC-010-BCD',
                club_name: 'Пенсионерски клуб Хармония',
                city: 'Добрич',
                participants_count: 28,
                topic: 'fake_news',
                topic_other: null,
                preferred_date: '2026-04-15',
                contact_name: 'Калина Петкова',
                contact_phone: '+359888000111',
                contact_email: 'kalina.p@example.com',
                notes: 'Искаме да научим как да разпознаваме фалшиви новини във Фейсбук.',
                status: 'new',
                assigned_mentor_id: null,
                admin_notes: null,
                cancel_reason: null,
                confirmed_at: null,
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '172.16.1.9',
                user_agent: 'Mozilla/5.0 (Linux; Android 14)',
                created_at: new Date('2026-03-11'),
                updated_at: new Date('2026-03-11'),
            },
            {
                tracking_code: 'RAC-011-EFG',
                club_name: 'Читалище Пробуда',
                city: 'Шумен',
                participants_count: 32,
                topic: 'election_process',
                topic_other: null,
                preferred_date: '2026-04-18',
                contact_name: 'Васил Христов',
                contact_phone: '+359899111222',
                contact_email: 'vasil.h@example.com',
                notes: null,
                status: 'new',
                assigned_mentor_id: null,
                admin_notes: null,
                cancel_reason: null,
                confirmed_at: null,
                completed_at: null,
                cancelled_at: null,
                reminder_sent: false,
                ip_address: '10.0.5.17',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                created_at: new Date('2026-03-12'),
                updated_at: new Date('2026-03-12'),
            },
            // --- CANCELLED (1) ---
            {
                tracking_code: 'RAC-012-HIJ',
                club_name: 'Клуб Вечерница',
                city: 'Хасково',
                participants_count: 12,
                topic: 'voter_rights',
                topic_other: null,
                preferred_date: '2026-03-15',
                contact_name: 'Пенка Георгиева',
                contact_phone: '+359877333444',
                contact_email: 'penka.g@example.com',
                notes: null,
                status: 'cancelled',
                assigned_mentor_id: null,
                admin_notes: null,
                cancel_reason: 'Клубът отмени заради ремонт на сградата.',
                confirmed_at: null,
                completed_at: null,
                cancelled_at: new Date('2026-03-08'),
                reminder_sent: false,
                ip_address: '192.168.3.5',
                user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                created_at: new Date('2026-02-28'),
                updated_at: new Date('2026-03-08'),
            },
        ]);

        // =============================================
        // 2. MENTOR AVAILABILITIES (за март и април 2026)
        // =============================================
        const availabilities = [];
        const mentorIds = [mentor1, mentor2, mentor3];

        // Всеки ментор е наличен в работни дни за следващите 6 седмици
        for (const mId of mentorIds) {
            for (let d = 16; d <= 31; d++) {
                const date = new Date(2026, 2, d); // март 2026
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends
                const dateStr = `2026-03-${String(d).padStart(2, '0')}`;
                availabilities.push({
                    mentor_id: mId,
                    date: dateStr,
                    is_available: true,
                    created_at: now,
                    updated_at: now,
                });
            }
            for (let d = 1; d <= 30; d++) {
                const date = new Date(2026, 3, d); // април 2026
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) continue;
                const dateStr = `2026-04-${String(d).padStart(2, '0')}`;
                availabilities.push({
                    mentor_id: mId,
                    date: dateStr,
                    is_available: true,
                    created_at: now,
                    updated_at: now,
                });
            }
        }

        // Направи някои дни неналични за разнообразие
        const unavailableDates = {
            [mentor1]: ['2026-03-23', '2026-03-24', '2026-04-06', '2026-04-07'],
            [mentor2]: ['2026-03-18', '2026-03-19', '2026-04-13', '2026-04-14'],
            [mentor3]: ['2026-03-25', '2026-03-26', '2026-04-20', '2026-04-21'],
        };

        for (const avail of availabilities) {
            const mentorUnavail = unavailableDates[avail.mentor_id] || [];
            if (mentorUnavail.includes(avail.date)) {
                avail.is_available = false;
            }
        }

        await queryInterface.bulkInsert('mentor_availabilities', availabilities);

        // =============================================
        // 3. VISIT FEEDBACKS (за завършените посещения)
        // =============================================
        const requests = await queryInterface.sequelize.query(
            `SELECT id, assigned_mentor_id FROM club_visit_requests WHERE status = 'completed' ORDER BY id;`
        );

        if (requests[0].length >= 3) {
            await queryInterface.bulkInsert('visit_feedbacks', [
                {
                    visit_request_id: requests[0][0].id,
                    mentor_id: requests[0][0].assigned_mentor_id,
                    participants_actual: 27,
                    topics_covered: 'Разпознаване на фалшиви новини във Фейсбук, проверка на източници, как да не споделяме невярна информация.',
                    challenges: 'Някои участници имаха трудности с разбирането на разликата между мнение и факт.',
                    highlights: 'Много активна дискусия! Участниците споделиха лични истории за измами, които са разпознали.',
                    recommendations: 'Повече практически упражнения с реални примери от социалните мрежи.',
                    rating: 5,
                    created_at: new Date('2026-02-10'),
                    updated_at: new Date('2026-02-10'),
                },
                {
                    visit_request_id: requests[0][1].id,
                    mentor_id: requests[0][1].assigned_mentor_id,
                    participants_actual: 20,
                    topics_covered: 'Права на избирателите, как да проверим дали сме в избирателния списък, процедура за гласуване.',
                    challenges: 'Залата беше малка за групата, но се справихме.',
                    highlights: 'Участниците бяха много заинтересовани и задаваха много въпроси за предстоящите избори.',
                    recommendations: 'Да се подготви кратък наръчник с основните права, който да се раздаде.',
                    rating: 4,
                    created_at: new Date('2026-02-18'),
                    updated_at: new Date('2026-02-18'),
                },
                {
                    visit_request_id: requests[0][2].id,
                    mentor_id: requests[0][2].assigned_mentor_id,
                    participants_actual: 42,
                    topics_covered: 'Изборен процес от А до Я - регистрация, гласуване, броене, обжалване на резултати.',
                    challenges: null,
                    highlights: 'Голяма група, но много дисциплинирана. Читалището осигури отлични условия.',
                    recommendations: null,
                    rating: 5,
                    created_at: new Date('2026-02-25'),
                    updated_at: new Date('2026-02-25'),
                },
            ]);
        }

        // =============================================
        // 4. VISIT TESTIMONIALS (5 отзива, 3 одобрени)
        // =============================================
        const completedRequests = await queryInterface.sequelize.query(
            `SELECT id FROM club_visit_requests WHERE status = 'completed' ORDER BY id;`
        );

        await queryInterface.bulkInsert('visit_testimonials', [
            {
                visit_request_id: completedRequests[0].length > 0 ? completedRequests[0][0].id : null,
                club_name: 'Пенсионерски клуб Надежда',
                city: 'София',
                quote: 'Менторката беше прекрасна! Обясни ни как да разпознаваме фалшивите новини по един много разбираем начин. Сега вече знаем на какво да обръщаме внимание.',
                author_name: 'Стоянка Иванова',
                is_approved: true,
                created_at: new Date('2026-02-12'),
                updated_at: new Date('2026-02-13'),
            },
            {
                visit_request_id: completedRequests[0].length > 1 ? completedRequests[0][1].id : null,
                club_name: 'Клуб на пенсионера - Възраждане',
                city: 'Пловдив',
                quote: 'Много полезна среща! Научихме много за правата си като избиратели. Менторът отговори на всичките ни въпроси с търпение и разбиране.',
                author_name: 'Георги Димитров',
                is_approved: true,
                created_at: new Date('2026-02-20'),
                updated_at: new Date('2026-02-21'),
            },
            {
                visit_request_id: completedRequests[0].length > 2 ? completedRequests[0][2].id : null,
                club_name: 'Читалище Христо Ботев',
                city: 'Варна',
                quote: 'Отлична инициатива! Нашите членове бяха впечатлени от професионализма и достъпния начин на обяснение. Определено ще поканим менторите отново!',
                author_name: 'Мария Колева',
                is_approved: true,
                created_at: new Date('2026-02-27'),
                updated_at: new Date('2026-02-28'),
            },
            {
                visit_request_id: null,
                club_name: 'Клуб Розова долина',
                city: 'Казанлък',
                quote: 'Благодарим за посещението! Много интересна презентация за изборния процес.',
                author_name: null,
                is_approved: false,
                created_at: new Date('2026-03-05'),
                updated_at: new Date('2026-03-05'),
            },
            {
                visit_request_id: null,
                club_name: 'Пенсионерски клуб Мир',
                city: 'Перник',
                quote: 'Много сме доволни от срещата. Менторът ни показа как да проверяваме дали една новина е истинска. Препоръчваме на всички клубове!',
                author_name: 'Тодор Василев',
                is_approved: false,
                created_at: new Date('2026-03-08'),
                updated_at: new Date('2026-03-08'),
            },
        ]);

        console.log('✅ ReAction seed data created: 12 requests, mentor availabilities, 3 feedbacks, 5 testimonials');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('visit_feedbacks', null, {});
        await queryInterface.bulkDelete('visit_testimonials', null, {});
        await queryInterface.bulkDelete('mentor_availabilities', null, {});
        await queryInterface.bulkDelete('club_visit_requests', null, {});
    },
};
