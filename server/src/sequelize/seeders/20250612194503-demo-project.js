'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const projects = await queryInterface.bulkInsert(
            'projects',
            [
                {
                    slug: 'pensa-digital-platform',
                    creator_id: 15,
                    title: 'Дигитална платформа Pensa Club',
                    short_description: 'Разработка на уеб платформа за свързване на възрастни хора с общи интереси.',
                    full_description:
                        'Детайлно описание на проекта за създаване на иновативна дигитална платформа която ще свързва възрастни хора с общи интереси, ще предоставя инструменти за комуникация и ще насърчава активното участие в общността.',
                    category: 'Дигитализация',
                    status: 'in-progress',
                    priority: 'high',
                    budget: JSON.stringify({
                        total: 50000,
                        currency: 'BGN',
                        funded: 32000,
                        goal: 50000,
                    }),
                    timeline: JSON.stringify({
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        estimatedDuration: '12 месеца',
                    }),
                    location: JSON.stringify([
                        {
                            address: 'София, България',
                            coordinates: {
                                lat: 42.6951,
                                lng: 23.3274,
                            },
                        },
                    ]),
                    application_status: 'open',
                    application_deadline: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000),
                    max_participants: 50,
                    current_participants: 23,
                    participant_requirements: ['Възраст над 55 години', 'Основни компютърни умения', 'Желание за активно участие в общността'],
                    tags: ['дигитализация', 'възрастни', 'общност', 'платформа'],
                    comments_enabled: true,
                    logo: 'https://cdn-icons-png.flaticon.com/512/471/471662.png',
                    created_at: new Date(),
                    updated_at: new Date(),
                    is_draft: false,
                },
                {
                    slug: 'senior-art-gallery',
                    creator_id: 15,
                    title: 'Общностна художествена галерия за възрастни художники',
                    short_description: 'Създаване на галерия за излагане на творби на талантливи възрастни художники.',
                    full_description:
                        'Проектът цели да създаде постоянна галерия, където възрастни художники могат да излагат своите творби, да провеждат работилници и да общуват с публиката. Галерията ще бъде и културен център за различни творчески събития.',
                    category: 'Култура',
                    status: 'planned',
                    priority: 'medium',
                    budget: JSON.stringify({
                        total: 45000,
                        currency: 'BGN',
                        funded: 15000,
                        goal: 45000,
                    }),
                    timeline: JSON.stringify({
                        startDate: new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        endDate: new Date(Date.now() + 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        estimatedDuration: '12 месеца',
                    }),
                    location: JSON.stringify([
                        {
                            address: 'Пловдив, България',
                            coordinates: {
                                lat: 42.1354,
                                lng: 24.7453,
                            },
                        },
                    ]),
                    application_status: 'open',
                    application_deadline: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
                    max_participants: 25,
                    current_participants: 8,
                    participant_requirements: ['Възраст над 55 години', 'Творчески опит', 'Готовност за участие в събития'],
                    tags: ['изкуство', 'галерия', 'творчество', 'култура'],
                    comments_enabled: true,
                    logo: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
                    created_at: new Date(),
                    updated_at: new Date(),
                    is_draft: true,
                },
            ],
            { returning: true }
        );

        // Add main images for projects
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://activatedinsights.com/wp-content/uploads/2015/06/Older-couple-using-laptop-mb.jpg',
                alt: 'Възрастна двойка използва лаптоп',
                imageable_id: projects[0].id,
                image_link_connection: 'project_main',
                caption: 'random text for testing',
                is_uploading: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
                alt: 'Художествена галерия с творби на възрастни художники',
                imageable_id: projects[1].id,
                image_link_connection: 'project_main',
                caption: 'random text for testing',
                is_uploading: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add project sections
        const sections = await queryInterface.bulkInsert(
            'sections',
            [
                {
                    title_slug: 'overview',
                    title: 'Общ преглед на проекта',
                    content:
                        'Проектът за дигитална платформа Pensa Club има за цел да създаде иновативно решение за свързване на възрастни хора с общи интереси и потребности.',
                    sectionable_id: projects[0].id,
                    section_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'features',
                    title: 'Основни функционалности',
                    content:
                        'Платформата ще включва профили на потребители, системи за съобщения, календар с събития, форуми за дискусии и мобилно приложение.',
                    sectionable_id: projects[0].id,
                    section_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'overview',
                    title: 'Общ преглед на проекта',
                    content:
                        'Проектът за художествена галерия има за цел да създаде пространство, където възрастните художники могат да покажат своите творби и да се свържат с публиката. Галерията ще бъде и културен център за различни творчески събития и работилници.',
                    sectionable_id: projects[1].id,
                    section_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'activities',
                    title: 'Дейности в галерията',
                    content:
                        'Галерията ще предлага: Постоянни изложби на възрастни художники; Творчески работилници; Кураторски екскурзии; Арт терапия сесии; Срещи с художники; Културни събития.',
                    sectionable_id: projects[1].id,
                    section_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Add section images
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://media.azpm.org/master/image/2018/5/21/spot/teeniors_2.jpg',
                alt: 'Преглед на платформата',
                imageable_id: sections[0].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                is_uploading: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBL-h0PBWZaJ8g36hYPBo8_OF3KFsyZHoMYQ&s',
                alt: 'Функционалности на платформата',
                imageable_id: sections[1].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                is_uploading: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
                alt: 'Обучение по дигитални умения',
                imageable_id: sections[2].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                is_uploading: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573164713988-8665fc963095',
                alt: 'Учебна програма за дигитални умения',
                imageable_id: sections[3].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                is_uploading: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // First, insert parent comments and store their IDs
        const parentComments = await queryInterface.bulkInsert(
            'comments',
            [
                {
                    content: 'Много се интересувам от този проект! Как мога да кандидатствам?',
                    user_id: 1,
                    commentable_id: projects[0].id,
                    comment_link_connection: 'project',
                    parent_id: null,
                    likes: ['valeri@example.com'],
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    content: 'Отлична идея за галерията! Как мога да се включа като художник?',
                    user_id: 2,
                    commentable_id: projects[1].id,
                    comment_link_connection: 'project',
                    parent_id: null,
                    likes: ['maria@example.com'],
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    content: 'Има ли възможност за групови посещения? Искаме да дойдем с клуб по пенсионерски дейности.',
                    user_id: 3,
                    commentable_id: projects[1].id,
                    comment_link_connection: 'project',
                    parent_id: null,
                    likes: ['elena@example.com'],
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Then insert replies using the parent comment IDs
        await queryInterface.bulkInsert('comments', [
            {
                content: 'Здравейте Мария! Можете да кандидатствате чрез формуляра в секция "Кандидатстване".',
                user_id: 2,
                commentable_id: projects[0].id,
                comment_link_connection: 'project',
                parent_id: parentComments[0].id,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Благодаря за интереса! Можете да изпратите портфолио на имейла в контактите.',
                user_id: 1,
                commentable_id: projects[1].id,
                comment_link_connection: 'project',
                parent_id: parentComments[1].id,
                likes: ['valeri@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Да, разбира се! Моля, свържете се с нас за координация на груповите посещения.',
                user_id: 1,
                commentable_id: projects[1].id,
                comment_link_connection: 'project',
                parent_id: parentComments[2].id,
                likes: ['valeri@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add download materials
        const downloadMaterials = await queryInterface.bulkInsert(
            'downloadMaterials',
            [
                {
                    title_slug: 'platform-presentation',
                    title: 'Презентация на проекта',
                    description: 'Пълна презентация с всички аспекти на проекта за дигитална платформа.',
                    file_type: 'pdf',
                    file_size: '3.2',
                    download_url: '/downloads/platform-presentation.pdf',
                    downloadable_id: projects[0].id,
                    download_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        await queryInterface.bulkInsert('images', [
            {
                src: 'https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/articles%2Fimages%2Fbec38821-e41d-4cf6-8f18-3599ff1c8664?alt=media&token=15d2d76f-ed59-427a-83b3-a2f055f42f74',
                alt: 'Корица на презентацията',
                imageable_id: downloadMaterials[0].id,
                image_link_connection: 'downloadMaterial',
                is_uploading: false,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add team members (contacts)
        await queryInterface.bulkInsert('contacts', [
            // Team members (is_team_member: true, is_main_contact: false)
            {
                name: 'Валери Кекевски',
                position: 'Ръководител проект',
                email: 'valeri.kekevski@pensaclub.bg',
                phone: '+359 888 123 456',
                image: '/images/team/valeri-kekevski.jpg',
                is_team_member: true,
                is_main_contact: false,
                role: 'project-manager',
                contactable_id: projects[0].id,
                contact_link_connection: 'project',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'Мария Иванова',
                position: 'UX Дизайнер',
                email: 'maria.ivanova@pensaclub.bg',
                phone: '+359 888 123 457',
                image: '/images/team/maria-ivanova.jpg',
                is_team_member: true,
                is_main_contact: false,
                role: 'designer',
                contactable_id: projects[0].id,
                contact_link_connection: 'project',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'Валери Кекевски',
                position: 'Ръководител проект',
                email: 'valeri.kekevski@pensaclub.bg',
                phone: '+359 888 123 456',
                image: '/images/contacts/valeri-kekevski.jpg',
                is_team_member: false,
                is_main_contact: false,
                contactable_id: projects[0].id,
                contact_link_connection: 'project',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add sponsors for projects
        const sponsors = await queryInterface.bulkInsert(
            'sponsors',
            [
                // Sponsors for Pensa Digital Platform
                {
                    name: 'Digital Innovation Fund',
                    amount: 15000.0,
                    currency: 'BGN',
                    type: 'Platinum',
                    visible: true,
                    website: 'https://digitalinnovation.bg',
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968654.png',
                    sponsorable_id: projects[0].id,
                    sponsor_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Tech Startups Bulgaria',
                    amount: 8000.0,
                    currency: 'BGN',
                    type: 'Gold',
                    visible: true,
                    website: 'https://techstartups.bg',
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968655.png',
                    sponsorable_id: projects[0].id,
                    sponsor_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                // Sponsors for Senior Art Gallery
                {
                    name: 'Cultural Heritage Foundation',
                    amount: 12000.0,
                    currency: 'BGN',
                    type: 'Platinum',
                    visible: true,
                    website: 'https://culturalheritage.bg',
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968656.png',
                    sponsorable_id: projects[1].id,
                    sponsor_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Art Support Network',
                    amount: 5000.0,
                    currency: 'BGN',
                    type: 'Silver',
                    visible: true,
                    website: 'https://artsupport.bg',
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968657.png',
                    sponsorable_id: projects[1].id,
                    sponsor_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Add partners for projects
        const partners = await queryInterface.bulkInsert(
            'partners',
            [
                // Partners for Pensa Digital Platform
                {
                    name: 'Digital Skills Institute',
                    description: 'Leading provider of digital literacy training',
                    website: 'https://digitalskills.institute',
                    type: 'Educational',
                    visible: true,
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968664.png',
                    partnerable_id: projects[0].id,
                    partner_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Senior Tech Alliance',
                    description: 'Network of technology companies focused on senior solutions',
                    website: 'https://seniortech.bg',
                    type: 'Strategic',
                    visible: true,
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968665.png',
                    partnerable_id: projects[0].id,
                    partner_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                // Partners for Senior Art Gallery
                {
                    name: 'Plovdiv Art Academy',
                    description: 'Leading art education institution',
                    website: 'https://artacademy.plovdiv',
                    type: 'Educational',
                    visible: true,
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968666.png',
                    partnerable_id: projects[1].id,
                    partner_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    name: 'Creative Aging Network',
                    description: 'International network promoting creative aging',
                    website: 'https://creativeaging.net',
                    type: 'Strategic',
                    visible: true,
                    logo: 'https://cdn-icons-png.flaticon.com/512/1968/1968667.png',
                    partnerable_id: projects[1].id,
                    partner_link_connection: 'project',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Add milestones
        await queryInterface.bulkInsert('milestones', [
            {
                title: 'Проектиране и дизайн',
                due_date: new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000),
                status: 'completed',
                project_id: projects[0].id,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                title: 'Разработка на основни функции',
                due_date: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000),
                status: 'in-progress',
                project_id: projects[0].id,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('projects', {
            slug: ['pensa-digital-platform', 'senior-art-gallery'],
        });
    },
};
