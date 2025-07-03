'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const stories = await queryInterface.bulkInsert(
            'stories',
            [
                {
                    slug: 'pensa-digital-transformation',
                    title_slug: 'pensa-story-tech-transformation',
                    title: 'Как технологиите променят живота на възрастните',
                    short_description: 'Истории за успешна дигитална трансформация и как възрастните хора се адаптират към новите технологии.',
                    published_at: new Date('2024-03-15T10:00:00Z'),
                    author: 'Мария Стоянова',
                    author_email: 'maria.stoyanova@pensaclub.bg',
                    author_image: 'https://www.healee.com/images/048972_meta_5f97fa8b380df308d1acedef.png',
                    read_time: '5 мин',
                    category: 'Успешни истории',
                    tags: ['дигитализация', 'възрастни', 'технологии', 'трансформация', 'успех'],
                    views: 245,
                    likes: 18,
                    comments_enabled: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    slug: 'pensa-community-building',
                    title_slug: 'pensa-story-community-building',
                    title: 'Силата на общността: Pensa Club като дигитален дом',
                    short_description: 'Как дигиталната общност на Pensa Club помага на възрастните да се чувстват приети и активни.',
                    published_at: new Date('2024-04-10T09:00:00Z'),
                    author: 'Иван Георгиев',
                    author_email: 'ivan.georgiev@pensaclub.bg',
                    author_image: 'https://randomuser.me/api/portraits/men/32.jpg',
                    read_time: '4 мин',
                    category: 'Общност',
                    tags: ['общност', 'подкрепа', 'възрастни', 'социализация'],
                    views: 180,
                    likes: 12,
                    comments_enabled: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    slug: 'pensa-digital-education',
                    title_slug: 'pensa-story-digital-education',
                    title: 'Образование без възраст: дигитални умения за всички',
                    short_description: 'Истории за възрастни, които преоткриват ученето чрез дигитални курсове и уебинари.',
                    published_at: new Date('2024-05-05T14:30:00Z'),
                    author: 'Силвия Петрова',
                    author_email: 'silvia.petrova@pensaclub.bg',
                    author_image: 'https://randomuser.me/api/portraits/women/44.jpg',
                    read_time: '6 мин',
                    category: 'Образование',
                    tags: ['образование', 'дигитални умения', 'учене', 'възрастни'],
                    views: 210,
                    likes: 15,
                    comments_enabled: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            { returning: true }
        );

        await queryInterface.bulkInsert('images', [
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии в общност',
                imageable_id: stories[0].id,
                image_link_connection: 'story',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии в общност',
                imageable_id: stories[1].id,
                image_link_connection: 'story',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии в общност',
                imageable_id: stories[2].id,
                image_link_connection: 'story',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        const sections = await queryInterface.bulkInsert(
            'sections',
            [
                {
                    title_slug: 'mission',
                    title: 'Мисия',
                    content:
                        'Да създадем иновативна платформа, инструмент за изграждане на общност. Обединяваме хора на еднаква възраст с общи интереси, нови идеи и знания.',
                    sectionable_id: stories[0].id,
                    section_link_connection: 'story',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'about',
                    title: 'Какво представлява Pensa Club?',
                    content:
                        'Пенса клуб се финансира от Фондация ПЕНСА, която работи в областта на Образованието, Обучението и Социалната политика, като ефективно прилага инструменти, механизми и ценности, ключови за постигане на Социална интеграция и Равни възможности за две групи в обществото -- децата и пенсионерите в България.',
                    sectionable_id: stories[0].id,
                    section_link_connection: 'story',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'goals',
                    title: 'Цели',
                    content:
                        'Изграждане на общност, основана на взаимодействие и взаимопомощ. Подобряване качеството на живот чрез активно включване на възрастните хора в съвременното общество. Подкрепа за придобиване на нови умения и интереси, както и насърчаване на здравословен, пълноценен и достоен живот.',
                    sectionable_id: stories[0].id,
                    section_link_connection: 'story',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    title_slug: 'alumni-club',
                    title: 'Алумни клуб',
                    content:
                        'В рамките на нашата визия за социална ангажираност и междупоколенческо сътрудничество, предстои създаването на Алумни Клуб на пенсионираните служители на Роберт Бош България. Този проект ще бъде вдъхновен от дългогодишните ценности и ангажименти на Фондация Роберт Бош.',
                    sectionable_id: stories[0].id,
                    section_link_connection: 'story',
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
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
                alt: 'За Pensa Club',
                imageable_id: sections[1].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
                alt: 'Цели на Pensa Club',
                imageable_id: sections[2].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad',
                alt: 'Алумни клуб',
                imageable_id: sections[3].id,
                image_link_connection: 'section',
                caption: 'random text for testing',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        await queryInterface.bulkInsert('comments', [
            {
                content:
                    'Страхотна инициатива! Точно това ни трябваше в общността. Надявам се да може да участвам активно и да помогна на други възрастни хора.',
                user_id: 1,
                commentable_id: stories[0].id,
                comment_link_connection: 'story',
                parent_id: null,
                likes: ['valeri@example.com', 'georgi@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Благодаря за подкрепата, Мария! Разчитаме на активни участници като вас 🙏',
                user_id: 2,
                commentable_id: stories[0].id,
                comment_link_connection: 'story',
                parent_id: 1,
                likes: ['maria@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Кога ще стартира официално платформата? Имам много въпроси и предложения за подобрения. Как мога да се свържа с екипа?',
                user_id: 3,
                commentable_id: stories[0].id,
                comment_link_connection: 'story',
                parent_id: null,
                likes: ['elena@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Здравейте Георги! Планираме да стартираме в началото на април. Можете да ни пишете на имейла в контактите.',
                user_id: 2,
                commentable_id: stories[0].id,
                comment_link_connection: 'story',
                parent_id: 3,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Отлична идея за свързване на поколенията! Как мога да се включа като доброволец?',
                user_id: 4,
                commentable_id: stories[0].id,
                comment_link_connection: 'story',
                parent_id: null,
                likes: ['maria@example.com', 'georgi@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('stories', null, {});
    },
};
