'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const initiatives = await queryInterface.bulkInsert(
            'initiatives',
            [
                // Initiative 1: Pensa Club
                {
                    slug: 'pensa-club-digital-community',
                    title: 'Pensa Club - Дигитална общност за възрастни',
                    short_description: 'Иновативна платформа за създаване на общност от хора на еднаква възраст, с еднакви интереси, нови идеи и знания.',
                    detailed_description: JSON.stringify([
                        {
                            type: 'paragraph',
                            children: [
                                {
                                    text: 'Подробно описание на инициативата с rich text форматиране...',
                                },
                            ],
                        },
                    ]),
                    category: 'Дигитализация',
                    location: JSON.stringify({
                        address: 'София, България',
                        coordinates: {
                            lat: 42.6977,
                            lng: 23.3219,
                        },
                    }),
                    created_at: new Date('2024-01-15T10:00:00Z'),
                    updated_at: new Date('2024-03-20T14:30:00Z'),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 15,
                    custom_category: 'Дигитална общност',
                    priority: 'High',
                    start_date: new Date('2024-04-01'),
                    end_date: new Date('2024-12-31'),
                    duration: '9 месеца',
                    target_age: ['Adults', 'Seniors'],
                    target_audience: ['Elderly', 'Professionals'],
                    custom_audience: 'Пенсионери с интерес към технологии',
                    expected_budget: 50000,
                    currency: 'BGN',
                    funding_sources: ['Private', 'Donations'],
                    organization: JSON.stringify({
                        name: 'Фондация ПЕНСА',
                        address: 'София, ул. Примерна 123',
                        website: 'https://www.pensaclub.bg',
                    }),
                    contact_email: 'info@pensaclub.bg',
                    contact_phone: '+359 2 123 4567',
                    social_media: JSON.stringify({
                        facebook: 'https://facebook.com/pensaclub',
                        instagram: 'https://instagram.com/pensaclub',
                        linkedin: 'https://linkedin.com/company/pensaclub',
                        twitter: 'https://twitter.com/pensaclub',
                    }),
                    kpis: JSON.stringify([
                        {
                            name: 'Брой регистрирани потребители',
                            target: '1000',
                            current: '250',
                        },
                        {
                            name: 'Месечна активност',
                            target: '70%',
                            current: '45%',
                        },
                    ]),
                    expected_results: JSON.stringify([
                        {
                            type: 'paragraph',
                            children: [
                                {
                                    text: 'Създаване на активна общност от над 1000 потребители...',
                                },
                            ],
                        },
                    ]),
                    progress_report: JSON.stringify([
                        {
                            type: 'paragraph',
                            children: [
                                {
                                    text: 'До момента сме постигнали значителен напредък...',
                                },
                            ],
                        },
                    ]),
                    impact_metrics: JSON.stringify([
                        {
                            name: 'Подобрена дигитална грамотност',
                            value: '85%',
                            description: 'Процент участници с подобени дигитални умения',
                        },
                    ]),
                    testimonials: JSON.stringify([
                        {
                            name: 'Мария Петрова',
                            position: 'Участник',
                            content: 'Благодарение на Pensa Club открих нови приятели и научих много за технологиите.',
                            image: 'https://example.com/maria.jpg',
                        },
                    ]),
                    tags: ['дигитализация', 'възрастни', 'общност', 'образование', 'технологии'],
                    faq: JSON.stringify([
                        {
                            question: 'Какво е Клуб ПЕНСА?',
                            answer: 'Клуб ПЕНСА е дигитална общност...',
                        },
                        {
                            question: 'Как мога да се присъединя?',
                            answer: 'За да се присъедините към Клуб ПЕНСА...',
                        },
                    ]),
                    milestones: JSON.stringify([
                        {
                            date: '2024-06-01',
                            description: 'Завършване на първия етап от разработката',
                        },
                        {
                            date: '2024-07-15',
                            description: 'Стартиране на пилотната програма',
                        },
                    ]),
                },
            ],
            { returning: true }
        );

        // Main images for initiatives
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии в общност',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_main',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add logo images for initiatives
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968641.png',
                alt: 'Pensa Club Logo',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_logo',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Sections for all initiatives
        const sections = await queryInterface.bulkInsert(
            'sections',
            [
                {
                    title_slug: 'mission',
                    title: 'Мисия',
                    content:
                        'Да създадем иновативна платформа, инструмент за изграждане на общност. Обединяваме хора на еднаква възраст с общи интереси, нови идеи и знания.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'about',
                    title: 'Какво представлява Pensa Club?',
                    content:
                        'Пенса клуб се финансира от Фондация ПЕНСА, която работи в областта на Образованието, Обучението и Социалната политика, като ефективно прилага инструменти, механизми и ценности, ключови за постигане на Социална интеграция и Равни възможности за две групи в обществото -- децата и пенсионерите в България.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'goals',
                    title: 'Цели',
                    content:
                        'Изграждане на общност, основана на взаимодействие и взаимопомощ. Подобряване качеството на живот чрез активно включване на възрастните хора в съвременното общество. Подкрепа за придобиване на нови умения и интереси, както и насърчаване на здравословен, пълноценен и достоен живот.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'alumni-club',
                    title: 'Алумни клуб',
                    content:
                        'В рамките на нашата визия за социална ангажираност и междупоколенческо сътрудничество, предстои създаването на Алумни Клуб на пенсионираните служители на Роберт Бош България. Този проект ще бъде вдъхновен от дългогодишните ценности и ангажименти на Фондация Роберт Бош.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // After sections are inserted, add their images
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                alt: 'Мисия на Pensa Club',
                imageable_id: sections[0].id,
                image_link_connection: 'section',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
                alt: 'За Pensa Club',
                imageable_id: sections[1].id,
                image_link_connection: 'section',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
                alt: 'Цели на Pensa Club',
                imageable_id: sections[2].id,
                image_link_connection: 'section',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad',
                alt: 'Алумни клуб',
                imageable_id: sections[3].id,
                image_link_connection: 'section',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Download Materials for Pensa Club
        const downloadMaterials = await queryInterface.bulkInsert(
            'downloadMaterials',
            [
                {
                    title_slug: 'pensa-presentation',
                    title: 'Пълна презентация на Pensa Club',
                    description: 'Детайлна презентация с всички аспекти на проекта, мисия, цели и бъдещи планове.',
                    file_type: 'pdf',
                    file_size: '2.5 MB',
                    download_url: '/downloads/pensa-club-presentation.pdf',
                    downloadable_id: initiatives[0].id,
                    download_link_connection: 'initiative_materials',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'alumni-proposal',
                    title: 'Предложение за Алумни клуб',
                    description: 'Детайлно предложение за създаване на Алумни клуб в партньорство с Фондация Роберт Бош.',
                    file_type: 'docx',
                    file_size: '1.8 MB',
                    download_url: '/downloads/alumni-club-proposal.docx',
                    downloadable_id: initiatives[0].id,
                    download_link_connection: 'initiative_materials',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'pensa-documentation',
                    title: 'Документация на Pensa Club',
                    description: 'Официална документация и ръководства',
                    file_type: 'pdf',
                    file_size: '3.2 MB',
                    download_url: '/downloads/pensa-documentation.pdf',
                    downloadable_id: initiatives[0].id,
                    download_link_connection: 'initiative_documents',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'pensa-guidelines',
                    title: 'Насоки за участие',
                    description: 'Подробни насоки за участие в инициативата',
                    file_type: 'pdf',
                    file_size: '1.5 MB',
                    download_url: '/downloads/pensa-guidelines.pdf',
                    downloadable_id: initiatives[0].id,
                    download_link_connection: 'initiative_documents',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // After download materials are inserted, add their images
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/articles%2Fimages%2Fbec38821-e41d-4cf6-8f18-3599ff1c8664?alt=media&token=15d2d76f-ed59-427a-83b3-a2f055f42f74',
                alt: 'Корица на презентацията',
                imageable_id: downloadMaterials[0].id,
                image_link_connection: 'downloadMaterial',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://www.bosch-stiftung.de/sites/default/files/styles/im1920/public/images/media/2025-04/16_9_Malawi%20GC%20unity%20Kopie.jpg?itok=YoSV1Syz',
                alt: 'Документ за Алумни клуб',
                imageable_id: downloadMaterials[1].id,
                image_link_connection: 'downloadMaterial',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Contacts for Pensa Club
        const contacts = await queryInterface.bulkInsert('contacts', [
            // Main contact
            {
                name: 'Валери Кекевски',
                position: 'Ръководител проект Pensa Club',
                email: 'valeri.kekevski@pensaclub.bg',
                phone: '+359 888 123 456',
                image: 'https://derma-act.bg/wp-content/uploads/2024/01/IMG_1818.jpg',
                is_main_contact: true,
                contactable_id: initiatives[0].id,
                contact_link_connection: 'initiative_contact',
                created_at: new Date(),
                updated_at: new Date(),
            },
            // Additional contacts
            {
                name: 'Виргиния Драгиева',
                phone: '+359 888 932 578',
                email: 'virginia.dragieva@pensaclub.bg',
                is_main_contact: false,
                contactable_id: initiatives[0].id,
                contact_link_connection: 'initiative_additional',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'Георги Георгиев',
                phone: '+359 888 475 421',
                email: 'georgi.georgiev@pensaclub.bg',
                is_main_contact: false,
                contactable_id: initiatives[0].id,
                contact_link_connection: 'initiative_additional',
                created_at: new Date(),
                updated_at: new Date(),
            },
            // Responsible contact
            {
                name: 'Валери Кекевски',
                position: 'Ръководител проект Pensa Club',
                email: 'valeri.kekevski@pensaclub.bg',
                phone: '+359 888 123 456',
                is_main_contact: false,
                contactable_id: initiatives[0].id,
                contact_link_connection: 'initiative_responsible',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Comments for Pensa Club
        await queryInterface.bulkInsert('comments', [
            {
                content:
                    'Страхотна инициатива! Точно това ни трябваше в общността. Надявам се да може да участвам активно и да помогна на други възрастни хора.',
                user_id: 1,
                commentable_id: initiatives[0].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['valeri@example.com', 'georgi@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Благодаря за подкрепата, Мария! Разчитаме на активни участници като вас 🙏',
                user_id: 2,
                commentable_id: initiatives[0].id,
                comment_link_connection: 'initiative',
                parent_id: 1,
                likes: ['maria@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Кога ще стартира официално платформата? Имам много въпроси и предложения за подобрения. Как мога да се свържа с екипа?',
                user_id: 3,
                commentable_id: initiatives[0].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['elena@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Здравейте Георги! Планираме да стартираме в началото на април. Можете да ни пишете на имейла в контактите.',
                user_id: 2,
                commentable_id: initiatives[0].id,
                comment_link_connection: 'initiative',
                parent_id: 3,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Отлична идея за свързване на поколенията! Как мога да се включа като доброволец?',
                user_id: 4,
                commentable_id: initiatives[0].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['maria@example.com', 'georgi@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add gallery images for Pensa Club
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии в общност',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_gallery',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://pibindia.wordpress.com/wp-content/uploads/2016/11/health-aging.jpg?w=1095',
                alt: 'Възрастни хора правят упражнения в парк',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_gallery',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://www.earlychildhoodireland.ie/wp-content/uploads/2024/02/Intergenerational.png',
                alt: 'Млад човек обучава възрастен на компютър',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_gallery',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://crestwoodmanoronline.org/wp-content/uploads/Crestwood-Manor-519545542.jpg',
                alt: 'Възрастни хора се обучават на компютри',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_gallery',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://civicwell.org/wp-content/uploads/2013/07/feature-cultivating-community-gardens.jpg',
                alt: 'Хора работят заедно в градина',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_gallery',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://www.students-care.org/wp-content/uploads/2023/10/2.jpg',
                alt: 'Двама възрастни приятели се разхождат',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_gallery',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://cdn2.hubspot.net/hubfs/2881057/Crafts%20for%20Senior%20to%20Do%20at%20Home1000px.jpg',
                alt: 'Възрастни хора рисуват в ателие',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_gallery',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add sponsors for initiatives
        const sponsors = await queryInterface.bulkInsert(
            'sponsors',
            [
                // Sponsors for Pensa Club
                {
                    name: 'Tech Solutions Ltd',
                    amount: 5000.0,
                    currency: 'BGN',
                    sponsorship_type: 'Gold',
                    is_visible: true,
                    website: 'https://techsolutions.bg',
                    sponsorable_id: initiatives[0].id,
                    sponsor_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Digital Future Foundation',
                    amount: 3000.0,
                    currency: 'BGN',
                    sponsorship_type: 'Silver',
                    is_visible: true,
                    website: 'https://digitalfuture.org',
                    sponsorable_id: initiatives[0].id,
                    sponsor_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Health Plus Insurance',
                    amount: 7500.0,
                    currency: 'BGN',
                    sponsorship_type: 'Platinum',
                    is_visible: true,
                    website: 'https://healthplus.bg',
                    sponsorable_id: initiatives[0].id,
                    sponsor_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Add partners for initiatives
        const partners = await queryInterface.bulkInsert(
            'partners',
            [
                // Partners for Pensa Club
                {
                    name: 'Senior Care Association',
                    description: 'National organization for elderly care',
                    website: 'https://seniorcare.bg',
                    partnership_type: 'Strategic',
                    is_visible: true,
                    partnerable_id: initiatives[0].id,
                    partner_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Digital Skills Academy',
                    description: 'Training center for digital literacy',
                    website: 'https://digitalskills.academy',
                    partnership_type: 'Educational',
                    is_visible: true,
                    partnerable_id: initiatives[0].id,
                    partner_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Wellness Center Sofia',
                    description: 'Leading wellness and health center',
                    website: 'https://wellness.sofia',
                    partnership_type: 'Healthcare',
                    is_visible: true,
                    partnerable_id: initiatives[0].id,
                    partner_link_connection: 'initiative',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Add logo images for sponsors
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968651.png',
                alt: 'Tech Solutions Ltd Logo',
                imageable_id: sponsors[0].id,
                image_link_connection: 'sponsor',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968652.png',
                alt: 'Digital Future Foundation Logo',
                imageable_id: sponsors[1].id,
                image_link_connection: 'sponsor',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968653.png',
                alt: 'Health Plus Insurance Logo',
                imageable_id: sponsors[2].id,
                image_link_connection: 'sponsor',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add logo images for partners
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968661.png',
                alt: 'Senior Care Association Logo',
                imageable_id: partners[0].id,
                image_link_connection: 'partner',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968662.png',
                alt: 'Digital Skills Academy Logo',
                imageable_id: partners[1].id,
                image_link_connection: 'partner',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968663.png',
                alt: 'Wellness Center Sofia Logo',
                imageable_id: partners[2].id,
                image_link_connection: 'partner',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('comments', null, {});
        await queryInterface.bulkDelete('contacts', null, {});
        await queryInterface.bulkDelete('images', null, {});
        await queryInterface.bulkDelete('sections', null, {});
        await queryInterface.bulkDelete('downloadMaterials', null, {});
        await queryInterface.bulkDelete('initiatives', null, {});
    },
};
