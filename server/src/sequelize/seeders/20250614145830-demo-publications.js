'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const publications = await queryInterface.bulkInsert(
            'publications',
            [
                {
                    slug: 'pensa-digital-guide',
                    title_slug: 'pensa-digital-literacy-guide',
                    title: 'Ръководство за дигитална грамотност за възрастни',
                    short_description: 'Изчерпателно ръководство за възрастни хора, които искат да подобрят своите дигитални умения.',
                    published_at: new Date('2024-03-15T10:00:00Z'),
                    read_time: '15 мин',
                    category: 'Ръководства',
                    file_type: 'pdf',
                    file_size: '2.5 MB',
                    download_url: '/downloads/digital-literacy-guide.pdf',
                    tags: ['дигитализация', 'възрастни', 'ръководство', 'обучение'],
                    views: 320,
                    likes: 45,
                    downloads: 180,
                    comments_enabled: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    slug: 'pensa-community-handbook',
                    title_slug: 'pensa-community-building-handbook',
                    title: 'Ръководство за изграждане на дигитална общност',
                    short_description: 'Практическо ръководство за създаване и поддръжка на дигитални общности за възрастни.',
                    published_at: new Date('2024-04-10T09:00:00Z'),
                    read_time: '20 мин',
                    category: 'Ръководства',
                    file_type: 'pdf',
                    file_size: '3.2 MB',
                    download_url: '/downloads/community-handbook.pdf',
                    tags: ['общност', 'дигитализация', 'ръководство', 'социализация'],
                    views: 280,
                    likes: 38,
                    downloads: 150,
                    comments_enabled: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    slug: 'pensa-digital-safety',
                    title_slug: 'pensa-digital-safety-guide',
                    title: 'Безопасност в дигиталния свят',
                    short_description: 'Важно ръководство за защита на личните данни и безопасно използване на интернет.',
                    published_at: new Date('2024-05-05T14:30:00Z'),
                    read_time: '12 мин',
                    category: 'Безопасност',
                    file_type: 'pdf',
                    file_size: '1.8 MB',
                    download_url: '/downloads/digital-safety.pdf',
                    tags: ['безопасност', 'дигитализация', 'ръководство', 'защита'],
                    views: 450,
                    likes: 65,
                    downloads: 220,
                    comments_enabled: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Add main image for first publication
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии',
                imageable_id: publications[0].id,
                image_link_connection: 'publication',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии',
                imageable_id: publications[1].id,
                image_link_connection: 'publication',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии',
                imageable_id: publications[2].id,
                image_link_connection: 'publication',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add sections for first publication
        const sections = await queryInterface.bulkInsert(
            'sections',
            [
                {
                    title_slug: 'introduction',
                    title: 'Въведение',
                    content:
                        'Това ръководство е създадено специално за възрастни хора, които искат да подобрят своите дигитални умения и да се чувстват по-уверени в дигиталния свят.',
                    sectionable_id: publications[0].id,
                    section_link_connection: 'publication',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'basics',
                    title: 'Основи на дигиталната грамотност',
                    content:
                        'Научете основните концепции и термини в дигиталния свят. Разберете как да използвате основните дигитални инструменти и платформи.',
                    sectionable_id: publications[0].id,
                    section_link_connection: 'publication',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'advanced',
                    title: 'Разширени умения',
                    content: 'След като усвоите основите, можете да преминете към по-разширени дигитални умения и техники.',
                    sectionable_id: publications[0].id,
                    section_link_connection: 'publication',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'resources',
                    title: 'Полезни ресурси',
                    content: 'Списък с полезни ресурси, уроци и материали за допълнително обучение.',
                    sectionable_id: publications[0].id,
                    section_link_connection: 'publication',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        // Add images for sections
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                alt: 'Въведение в дигиталната грамотност',
                imageable_id: sections[0].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
                alt: 'Основи на дигиталната грамотност',
                imageable_id: sections[1].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
                alt: 'Разширени дигитални умения',
                imageable_id: sections[2].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad',
                alt: 'Полезни ресурси',
                imageable_id: sections[3].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Add comments for first publication
        await queryInterface.bulkInsert('comments', [
            {
                content: 'Страхотно ръководство! Точно това ми трябваше. Надявам се да има още подобни материали.',
                user_id: 1,
                commentable_id: publications[0].id,
                comment_link_connection: 'publication',
                parent_id: null,
                likes: ['valeri@example.com', 'georgi@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Благодаря за подкрепата! Ще продължим да създаваме подобни материали 🙏',
                user_id: 2,
                commentable_id: publications[0].id,
                comment_link_connection: 'publication',
                parent_id: 1,
                likes: ['maria@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Имате ли и видео версия на提醒大家? За някои хора е по-лесно да следват видео уроци.',
                user_id: 3,
                commentable_id: publications[0].id,
                comment_link_connection: 'publication',
                parent_id: null,
                likes: ['elena@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Да, планираме да създадем видео версия на提醒大家. Ще бъде достъпна следващия месец.',
                user_id: 2,
                commentable_id: publications[0].id,
                comment_link_connection: 'publication',
                parent_id: 3,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Много полезно ръководство! Особено харесах секцията за безопасност.',
                user_id: 4,
                commentable_id: publications[0].id,
                comment_link_connection: 'publication',
                parent_id: null,
                likes: ['maria@example.com', 'georgi@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('publications', null, {});
    },
};
