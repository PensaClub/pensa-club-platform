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
                    category: 'Дигитализация',
                    address: 'София, България',
                    lat: 42.6977,
                    lng: 23.3219,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 1,
                },
                // Initiative 2: Healthy Aging Program
                {
                    slug: 'healthy-aging-program',
                    title: 'Програма за здравословно стареене',
                    short_description: 'Комплексна програма за физическо и психическо здраве на възрастни хора.',
                    category: 'Здраве',
                    address: 'Пловдив, България',
                    lat: 42.1354,
                    lng: 24.7453,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 1,
                },
                // Initiative 3: Intergenerational Learning
                {
                    slug: 'intergenerational-learning',
                    title: 'Междупоколенческо учене',
                    short_description: 'Програма за обмен на знания и опит между поколенията.',
                    category: 'Образование',
                    address: 'Варна, България',
                    lat: 43.2141,
                    lng: 27.9147,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active',
                    campaign_status: 'closed',
                    comments_enabled: false,
                    creator_id: 1,
                },
                // Initiative 4: Digital Literacy for Seniors
                {
                    slug: 'digital-literacy-seniors',
                    title: 'Дигитална грамотност за възрастни',
                    short_description: 'Курсове за основи на интернет, имейл и социални мрежи за хора над 65 години.',
                    category: 'Образование',
                    address: 'Бургас, България',
                    lat: 42.5048,
                    lng: 27.4626,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 2,
                },
                // Initiative 5: Community Gardening
                {
                    slug: 'community-gardening',
                    title: 'Общностно градинарство',
                    short_description: 'Създаване на градини в квартала за социализация и здравословно хранене.',
                    category: 'Общност',
                    address: 'Стара Загора, България',
                    lat: 42.4258,
                    lng: 25.6342,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 2,
                },
                // Initiative 6: Senior Buddy System
                {
                    slug: 'senior-buddy-system',
                    title: 'Система приятели за възрастни',
                    short_description: 'Програма за свързване на по-млади възрастни с по-стари за взаимопомощ.',
                    category: 'Социални услуги',
                    address: 'Плевен, България',
                    lat: 43.4092,
                    lng: 24.618,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'planned',
                    campaign_status: 'closed',
                    comments_enabled: false,
                    creator_id: 2,
                },
                // Initiative 7: Arts & Crafts for Seniors
                {
                    slug: 'arts-crafts-seniors',
                    title: 'Изкуства и занаяти за възрастни',
                    short_description: 'Творчески работилници за рисуване, плетене и керамика за активно стареене.',
                    category: 'Култура',
                    address: 'Русе, България',
                    lat: 43.8564,
                    lng: 25.9704,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'completed',
                    campaign_status: 'closed',
                    comments_enabled: true,
                    creator_id: 2,
                },
            ],
            { returning: true }
        );

        // Now insert the main images for each initiative
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://rivervalleyseniorliving.com/wp-content/uploads/2024/03/Screenshot-2024-03-21-at-8.10.58-AM.jpg',
                alt: 'Възрастни хора използват дигитални технологии в общност',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://pibindia.wordpress.com/wp-content/uploads/2016/11/health-aging.jpg?w=1095',
                alt: 'Възрастни хора правят упражнения в парк',
                imageable_id: initiatives[1].id,
                image_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.earlychildhoodireland.ie/wp-content/uploads/2024/02/Intergenerational.png',
                alt: 'Млад човек обучава възрастен на компютър',
                imageable_id: initiatives[2].id,
                image_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://crestwoodmanoronline.org/wp-content/uploads/Crestwood-Manor-519545542.jpg',
                alt: 'Възрастни хора се обучават на компютри',
                imageable_id: initiatives[3].id,
                image_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://civicwell.org/wp-content/uploads/2013/07/feature-cultivating-community-gardens.jpg',
                alt: 'Хора работят заедно в градина',
                imageable_id: initiatives[4].id,
                image_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.students-care.org/wp-content/uploads/2023/10/2.jpg',
                alt: 'Двама възрастни приятели се разхождат',
                imageable_id: initiatives[5].id,
                image_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn2.hubspot.net/hubfs/2881057/Crafts%20for%20Senior%20to%20Do%20at%20Home1000px.jpg',
                alt: 'Възрастни хора рисуват в ателие',
                imageable_id: initiatives[6].id,
                image_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Sections for all initiatives
        const sections = await queryInterface.bulkInsert(
            'sections',
            [
                // Sections for Initiative 1 (Pensa Club)
                {
                    title_slug: 'mission',
                    title: 'Мисия',
                    content:
                        'Да създадем иновативна платформа, инструмент за изграждане на общност. Обединяваме хора на еднаква възраст с общи интереси, нови идеи и знания.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'about',
                    title: 'Какво представлява Pensa Club?',
                    content:
                        'Пенса клуб се финансира от Фондация ПЕНСА, която работи в областта на Образованието, Обучението и Социалната политика, като ефективно прилага инструменти, механизми и ценности, ключови за постигане на Социална интеграция и Равни възможности за две групи в обществото -- децата и пенсионерите в България.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'goals',
                    title: 'Цели',
                    content:
                        'Изграждане на общност, основана на взаимодействие и взаимопомощ. Подобряване качеството на живот чрез активно включване на възрастните хора в съвременното общество. Подкрепа за придобиване на нови умения и интереси, както и насърчаване на здравословен, пълноценен и достоен живот.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'alumni-club',
                    title: 'Алумни клуб',
                    content:
                        'В рамките на нашата визия за социална ангажираност и междупоколенческо сътрудничество, предстои създаването на Алумни Клуб на пенсионираните служители на Роберт Бош България. Този проект ще бъде вдъхновен от дългогодишните ценности и ангажименти на Фондация Роберт Бош.',
                    sectionable_id: initiatives[0].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'health-center-mission',
                    title: 'Нашата мисия',
                    content:
                        'Центърът за здраве и благополучие се стреми да подобри качеството на живот на възрастните хора чрез интеграция на модерни технологии в здравните практики.',
                    sectionable_id: initiatives[4].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'arts-studio-vision',
                    title: 'Нашата визия',
                    content:
                        'Студиото за творчески изкуства създава пространство, където възрастните хора могат да изразяват своята креативност и да се развиват в различни изкуства.',
                    sectionable_id: initiatives[5].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'innovation-lab-goals',
                    title: 'Нашите цели',
                    content:
                        'Лабораторията за социални иновации разработва решения, които подобряват живота на възрастните хора чрез технологични и социални иновации.',
                    sectionable_id: initiatives[6].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Sections for Initiative 2 (Healthy Aging Program)
                {
                    title_slug: 'overview',
                    title: 'Общ преглед',
                    content:
                        'Програмата за здравословно стареене обединява физически активности, психологическа подкрепа и социални дейности за възрастни хора над 60 години.',
                    sectionable_id: initiatives[1].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'physical-activities',
                    title: 'Физически активности',
                    content: 'Специално разработени упражнения за възрастни хора, включващи йога, разходки в природата и лека гимнастика.',
                    sectionable_id: initiatives[1].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Sections for Initiative 3 (Intergenerational Learning)
                {
                    title_slug: 'concept',
                    title: 'Концепция',
                    content: 'Създаване на мостове между поколенията чрез споделяне на знания, умения и опит.',
                    sectionable_id: initiatives[2].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Sections for Initiative 4 (Digital Literacy)
                {
                    title_slug: 'overview',
                    title: 'Преглед на програмата',
                    content:
                        'Безплатни курсове за дигитална грамотност, специално проектирани за възрастни хора. Обучението включва основи на работа с компютър, интернет търсене, електронна поща и социални мрежи.',
                    sectionable_id: initiatives[3].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'curriculum',
                    title: 'Учебна програма',
                    content:
                        'Курсът се провежда в продължение на 8 седмици с 2 занятия седмично. Включва практически упражнения с имейл, видео разговори, онлайн банкиране и електронно правителство.',
                    sectionable_id: initiatives[3].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'support',
                    title: 'Техническа подкрепа',
                    content:
                        'Всеки курсист получава индивидуална подкрепа и достъп до учебни материали. Предоставяме таблети за упражнения и постоянна техническа помощ.',
                    sectionable_id: initiatives[3].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Sections for Initiative 5 (Community Gardening)
                {
                    title_slug: 'mission',
                    title: 'Мисия на проекта',
                    content:
                        'Създаване на общностни градини които обединяват съседи, насърчават здравословното хранене и изграждат социални връзки между поколенията.',
                    sectionable_id: initiatives[4].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'activities',
                    title: 'Дейности в градината',
                    content: 'Сезонно засаждане на зеленчуци и билки, компостиране, работилници за биологично земеделие и общи обеди с реколтата от градината.',
                    sectionable_id: initiatives[4].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'benefits',
                    title: 'Ползи за общността',
                    content:
                        'Подобряване на физическото здраве чрез работа на открито, социализация, достъп до пресни продукти и укрепване на съседските отношения.',
                    sectionable_id: initiatives[4].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Sections for Initiative 6 (Senior Buddy System)
                {
                    title_slug: 'concept',
                    title: 'Концепция на програмата',
                    content:
                        'Свързваме възрастни хора за взаимна подкрепа и приятелство. Програмата създава двойки от участници които се подкрепят емоционално и практически.',
                    sectionable_id: initiatives[5].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'matching',
                    title: 'Подбиране на двойки',
                    content:
                        'Внимателно подбираме съвместими участници въз основа на интереси, местоположение и нужди. Всяка двойка получава ориентация и подкрепа.',
                    sectionable_id: initiatives[5].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'activities',
                    title: 'Общи дейности',
                    content:
                        'Редовни срещи за разходка, чай, посещения на културни събития или просто разговор. Организираме и групови активности за всички участници.',
                    sectionable_id: initiatives[5].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Sections for Initiative 7 (Arts & Crafts)
                {
                    title_slug: 'workshops',
                    title: 'Творчески работилници',
                    content:
                        'Разнообразни работилници за рисуване с акварел, плетене, бродерия, керамика и декупаж. Всеки участник може да избере дейностите които го интересуват.',
                    sectionable_id: initiatives[6].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'exhibitions',
                    title: 'Изложби и събития',
                    content: 'Организираме редовни изложби с творчеството на участниците, както и благотворителни базари за продажба на изделията.',
                    sectionable_id: initiatives[6].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'therapy',
                    title: 'Терапевтични ползи',
                    content:
                        'Творческите дейности подобряват моторните умения, стимулират паметта и намаляват стреса. Групите създават социални връзки и чувство за принадлежност.',
                    sectionable_id: initiatives[6].id,
                    section_link_connection: 'initiative',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            { returning: true }
        );

        // After sections are inserted, add their images
        await queryInterface.bulkInsert('images', [
            // Pensa Club sections images
            {
                src: '/images/sections/pensa-mission.jpg',
                alt: 'Мисия на Pensa Club',
                imageable_id: sections[0].id, // mission section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/pensa-about.jpg',
                alt: 'За Pensa Club',
                imageable_id: sections[1].id, // about section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/pensa-goals.jpg',
                alt: 'Цели на Pensa Club',
                imageable_id: sections[2].id, // goals section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/pensa-alumni.jpg',
                alt: 'Алумни клуб',
                imageable_id: sections[3].id, // alumni-club section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Health Center sections images
            {
                src: '/images/sections/health-mission.jpg',
                alt: 'Мисия на здравния център',
                imageable_id: sections[4].id, // health-center-mission section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Arts Studio sections images
            {
                src: '/images/sections/arts-vision.jpg',
                alt: 'Визия на студиото',
                imageable_id: sections[5].id, // arts-studio-vision section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Innovation Lab sections images
            {
                src: '/images/sections/innovation-goals.jpg',
                alt: 'Цели на лабораторията',
                imageable_id: sections[6].id, // innovation-lab-goals section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Healthy Aging Program sections images
            {
                src: '/images/sections/health-overview.jpg',
                alt: 'Общ преглед на програмата',
                imageable_id: sections[7].id, // overview section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/physical-activities.jpg',
                alt: 'Физически активности',
                imageable_id: sections[8].id, // physical-activities section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Intergenerational Learning sections images
            {
                src: '/images/sections/inter-concept.jpg',
                alt: 'Концепция на програмата',
                imageable_id: sections[9].id, // concept section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Digital Literacy sections images
            {
                src: '/images/sections/digital-overview.jpg',
                alt: 'Преглед на програмата',
                imageable_id: sections[10].id, // overview section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/digital-curriculum.jpg',
                alt: 'Учебна програма',
                imageable_id: sections[11].id, // curriculum section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/digital-support.jpg',
                alt: 'Техническа подкрепа',
                imageable_id: sections[12].id, // support section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Community Gardening sections images
            {
                src: '/images/sections/garden-mission.jpg',
                alt: 'Мисия на проекта',
                imageable_id: sections[13].id, // mission section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/garden-activities.jpg',
                alt: 'Дейности в градината',
                imageable_id: sections[14].id, // activities section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/garden-benefits.jpg',
                alt: 'Ползи за общността',
                imageable_id: sections[15].id, // benefits section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Senior Buddy System sections images
            {
                src: '/images/sections/buddy-concept.jpg',
                alt: 'Концепция на програмата',
                imageable_id: sections[16].id, // concept section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/buddy-matching.jpg',
                alt: 'Подбиране на двойки',
                imageable_id: sections[17].id, // matching section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/buddy-activities.jpg',
                alt: 'Общи дейности',
                imageable_id: sections[18].id, // activities section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Arts & Crafts sections images
            {
                src: '/images/sections/arts-workshops.jpg',
                alt: 'Творчески работилници',
                imageable_id: sections[19].id, // workshops section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/arts-exhibitions.jpg',
                alt: 'Изложби и събития',
                imageable_id: sections[20].id, // exhibitions section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/sections/arts-therapy.jpg',
                alt: 'Терапевтични ползи',
                imageable_id: sections[21].id, // therapy section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // First create all published contents (both stories and publications)
        const publishedContents = await queryInterface.bulkInsert(
            'publishedContents',
            [
                // Stories for Pensa Club
                {
                    title_slug: 'pensa-story-tech-transformation',
                    title: 'Как технологиите променят живота на възрастните',
                    description: 'Истории за успешна дигитална трансформация и как възрастните хора се адаптират към новите технологии.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Мария Стоянова',
                    link: '/stories/pensa-digital-transformation',
                    initiative_id: initiatives[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'pensa-story-community-building',
                    title: 'Изграждане на дигитална общност',
                    description: 'Как Pensa Club свързва хора с общи интереси и създава нови приятелства.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Валери Кекевски',
                    link: '/stories/pensa-community-building',
                    initiative_id: initiatives[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Stories for Healthy Aging Program
                {
                    title_slug: 'health-story-yoga-success',
                    title: 'Успехи в йога програмата',
                    description: 'Как йога помага на възрастните хора да подобрят баланса и гъвкавостта си.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Д-р Елена Иванова',
                    link: '/stories/yoga-success',
                    initiative_id: initiatives[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Stories for Intergenerational Learning
                {
                    title_slug: 'inter-success-story',
                    title: 'Успешни истории от програмата',
                    description: 'Как младежи и възрастни си помагат взаимно в ученето.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Мария Стоянова',
                    link: '/stories/intergenerational-success',
                    initiative_id: initiatives[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Stories for Digital Literacy
                {
                    title_slug: 'digital-success-stories',
                    title: 'Дигитални успехи на възрастните',
                    description: 'Вдъхновяващи истории за възрастни хора които овладяха технологиите.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Иван Петров',
                    link: '/stories/digital-success',
                    initiative_id: initiatives[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Stories for Community Gardening
                {
                    title_slug: 'garden-success-story',
                    title: 'Успехи в общностната градина',
                    description: 'Как градината обедини квартала и подобри качеството на живот.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Петя Георгиева',
                    link: '/stories/garden-success',
                    initiative_id: initiatives[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Stories for Senior Buddy System
                {
                    title_slug: 'buddy-program-info',
                    title: 'Представяне на програмата приятели',
                    description: 'Как работи системата и какви са ползите за участниците.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Димитър Стоянов',
                    link: '/stories/buddy-program',
                    initiative_id: initiatives[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Stories for Arts & Crafts
                {
                    title_slug: 'arts-exhibition-story',
                    title: 'Успешна изложба на творбите',
                    description: 'Как участниците показаха своите произведения пред обществото.',
                    type: 'story',
                    published_at: new Date(),
                    author: 'Анна Николова',
                    link: '/stories/arts-exhibition',
                    initiative_id: initiatives[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Publications for Pensa Club
                {
                    title_slug: 'pensa-pub-digital-guide',
                    title: 'Ръководство за дигитална грамотност',
                    description: 'Пълно ръководство за основни дигитални умения и безопасност онлайн.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/pensa-digital-literacy-guide',
                    initiative_id: initiatives[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'pensa-pub-platform-manual',
                    title: 'Наръчник за платформата Pensa Club',
                    description: 'Детайлно ръководство за използване на всички функции на платформата.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/pensa-platform-manual',
                    initiative_id: initiatives[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Publications for Healthy Aging Program
                {
                    title_slug: 'health-nutrition-guide',
                    title: 'Наръчник за здравословно хранене',
                    description: 'Препоръки за балансирано хранене за хора над 60 години.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/nutrition-guide',
                    initiative_id: initiatives[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Publications for Intergenerational Learning
                {
                    title_slug: 'inter-methodology',
                    title: 'Методология за междупоколенческо учене',
                    description: 'Научни основи и практически подходи.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/methodology',
                    initiative_id: initiatives[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Publications for Digital Literacy
                {
                    title_slug: 'digital-safety-guide',
                    title: 'Ръководство за дигитална безопасност',
                    description: 'Как да се предпазим от онлайн измами и вируси.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/digital-safety',
                    initiative_id: initiatives[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Publications for Community Gardening
                {
                    title_slug: 'organic-gardening-guide',
                    title: 'Ръководство за биологично градинарство',
                    description: 'Как да отглеждаме здравословни зеленчуци без химикали.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/organic-gardening',
                    initiative_id: initiatives[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Publications for Senior Buddy System
                {
                    title_slug: 'buddy-research',
                    title: 'Изследване за ползите от приятелството',
                    description: 'Научно изследване за влиянието на социалните връзки върху здравето.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/buddy-research',
                    initiative_id: initiatives[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Publications for Arts & Crafts
                {
                    title_slug: 'art-therapy-benefits',
                    title: 'Ползите от арт терапията',
                    description: 'Как творчеството помага за психическото здраве на възрастните.',
                    type: 'publication',
                    published_at: new Date(),
                    link: '/publications/art-therapy',
                    initiative_id: initiatives[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            { returning: true }
        );

        // Then when adding images, use the correct indices:
        await queryInterface.bulkInsert('images', [
            // Stories images
            {
                src: 'https://careinkent.co.uk/wp-content/uploads/2022/10/old-people-with-ipad.jpg',
                alt: 'Възрастни с технологии',
                imageable_id: publishedContents[0].id, // First story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.torontocouncilonaging.com/wp-content/uploads/IMG_0024-1024x676.jpg',
                alt: 'Pensa Club общност',
                imageable_id: publishedContents[1].id, // Second story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/stories/yoga-seniors.jpg',
                alt: 'Възрастни хора правят йога',
                imageable_id: publishedContents[2].id, // Third story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/stories/intergenerational-success.jpg',
                alt: 'Младежи и възрастни заедно',
                imageable_id: publishedContents[3].id, // Fourth story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/stories/digital-success.jpg',
                alt: 'Възрастни с технологии',
                imageable_id: publishedContents[4].id, // Fifth story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/stories/garden-success.jpg',
                alt: 'Общностна градина',
                imageable_id: publishedContents[5].id, // Sixth story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/stories/buddy-program.jpg',
                alt: 'Програма приятели',
                imageable_id: publishedContents[6].id, // Seventh story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/stories/arts-exhibition.jpg',
                alt: 'Изложба на изкуства',
                imageable_id: publishedContents[7].id, // Eighth story
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Publications images
            {
                src: 'https://www.webwise.ie/wp-content/uploads/2017/12/The-Weekly-Newspaper-Org-Structure-Org-Chart-1024x768.png',
                alt: 'Дигитално ръководство',
                imageable_id: publishedContents[8].id, // First publication (after stories)
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://view.subpage.app/app/company/Cee1990b34d6f46aba51cdc2103a102c3/domain/M4ge1OMPUob/page/Mql6onaQUob/article/M8c3aee0c24df12fb9d9a1677a7eab3791737439606160/hero/Me19e4e9281d5a5be8913cdf4f4412a991737609112226.webp',
                alt: 'Наръчник Pensa Club',
                imageable_id: publishedContents[9].id, // Second publication
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/publications/nutrition-guide.jpg',
                alt: 'Наръчник за хранене',
                imageable_id: publishedContents[10].id, // Third publication
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/publications/methodology.jpg',
                alt: 'Методология',
                imageable_id: publishedContents[11].id, // Fourth publication
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/publications/safety-guide.jpg',
                alt: 'Дигитална безопасност',
                imageable_id: publishedContents[12].id, // Fifth publication
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/publications/organic-guide.jpg',
                alt: 'Биологично градинарство',
                imageable_id: publishedContents[13].id, // Sixth publication
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/publications/buddy-research.jpg',
                alt: 'Изследване',
                imageable_id: publishedContents[14].id, // Seventh publication
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/publications/art-therapy.jpg',
                alt: 'Арт терапия',
                imageable_id: publishedContents[15].id, // Eighth publication
                image_link_connection: 'publishedContent',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Download Materials for all initiatives
        const downloadMaterials = await queryInterface.bulkInsert(
            'downloadMaterials',
            [
                // Materials for Initiative 1 (Pensa Club)
                {
                    title_slug: 'pensa-presentation',
                    title: 'Пълна презентация на Pensa Club',
                    description: 'Детайлна презентация с всички аспекти на проекта, мисия, цели и бъдещи планове.',
                    file_type: 'pdf',
                    file_size: '2.5',
                    download_url: '/downloads/pensa-club-presentation.pdf',
                    initiative_id: initiatives[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'alumni-proposal',
                    title: 'Предложение за Алумни клуб',
                    description: 'Детайлно предложение за създаване на Алумни клуб в партньорство с Фондация Роберт Бош.',
                    file_type: 'docx',
                    file_size: '1.8',
                    download_url: '/downloads/alumni-club-proposal.docx',
                    initiative_id: initiatives[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Materials for Healthy Aging Program
                {
                    title_slug: 'exercise-guide',
                    title: 'Ръководство за физически упражнения',
                    description: 'Безопасни упражнения за възрастни хора с подробни инструкции и илюстрации.',
                    file_type: 'pdf',
                    file_size: '2.5',
                    download_url: '/downloads/exercise-guide.pdf',
                    initiative_id: initiatives[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Materials for Intergenerational Learning
                {
                    title_slug: 'program-guide',
                    title: 'Ръководство за междупоколенчески програми',
                    description: 'Методически указания за организиране на успешни междупоколенчески срещи.',
                    file_type: 'pdf',
                    file_size: '3.2',
                    download_url: '/downloads/intergenerational-guide.pdf',
                    initiative_id: initiatives[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Materials for Digital Literacy
                {
                    title_slug: 'digital-guide',
                    title: 'Основно ръководство за дигитална грамотност',
                    description: 'Постъпково ръководство за овладяване на основни дигитални умения.',
                    file_type: 'pdf',
                    file_size: '4.1',
                    download_url: '/downloads/digital-basics.pdf',
                    initiative_id: initiatives[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'safety-tips',
                    title: 'Съвети за онлайн безопасност',
                    description: 'Важни правила за защита при използване на интернет и социални мрежи.',
                    file_type: 'pdf',
                    file_size: '1.8',
                    download_url: '/downloads/online-safety.pdf',
                    initiative_id: initiatives[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Materials for Community Gardening
                {
                    title_slug: 'gardening-guide',
                    title: 'Ръководство за градинарство',
                    description: 'Основни принципи и техники за успешно градинарство.',
                    file_type: 'pdf',
                    file_size: '3.5',
                    download_url: '/downloads/gardening-basics.pdf',
                    initiative_id: initiatives[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'plant-calendar',
                    title: 'Календар за засаждане',
                    description: 'Времеви план за засаждане на различни култури през годината.',
                    file_type: 'pdf',
                    file_size: '1.2',
                    download_url: '/downloads/planting-calendar.pdf',
                    initiative_id: initiatives[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Materials for Senior Buddy System
                {
                    title_slug: 'buddy-handbook',
                    title: 'Ръководство за приятели',
                    description: 'Пълно ръководство за участници в програмата за приятелство.',
                    file_type: 'pdf',
                    file_size: '2.8',
                    download_url: '/downloads/buddy-handbook.pdf',
                    initiative_id: initiatives[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Materials for Arts & Crafts
                {
                    title_slug: 'art-techniques',
                    title: 'Техники за изкуство и занаяти',
                    description: 'Постъпкови инструкции за различни художествени техники.',
                    file_type: 'pdf',
                    file_size: '5.2',
                    download_url: '/downloads/art-techniques.pdf',
                    initiative_id: initiatives[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title_slug: 'pattern-collection',
                    title: 'Колекция от шаблони',
                    description: 'Разнообразни шаблони за изкуство и занаяти.',
                    file_type: 'pdf',
                    file_size: '4.7',
                    download_url: '/downloads/patterns.pdf',
                    initiative_id: initiatives[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            { returning: true }
        );

        // After download materials are inserted, add their images
        await queryInterface.bulkInsert('images', [
            // Pensa Club download materials images
            {
                src: 'https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/articles%2Fimages%2Fbec38821-e41d-4cf6-8f18-3599ff1c8664?alt=media&token=15d2d76f-ed59-427a-83b3-a2f055f42f74',
                alt: 'Корица на презентацията',
                imageable_id: downloadMaterials[0].id, // First download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.bosch-stiftung.de/sites/default/files/styles/im1920/public/images/media/2025-04/16_9_Malawi%20GC%20unity%20Kopie.jpg?itok=YoSV1Syz',
                alt: 'Документ за Алумни клуб',
                imageable_id: downloadMaterials[1].id, // Second download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Healthy Aging Program download materials images
            {
                src: '/images/initiatives/exercise-guide-cover.jpg',
                alt: 'Корица на ръководството за упражнения',
                imageable_id: downloadMaterials[2].id, // Third download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Intergenerational Learning download materials images
            {
                src: '/images/initiatives/program-guide-cover.jpg',
                alt: 'Корица на ръководството',
                imageable_id: downloadMaterials[3].id, // Fourth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Digital Literacy download materials images
            {
                src: '/images/initiatives/digital-guide-cover.jpg',
                alt: 'Корица на ръководството за дигитални умения',
                imageable_id: downloadMaterials[4].id, // Fifth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/initiatives/safety-tips-cover.jpg',
                alt: 'Съвети за онлайн безопасност',
                imageable_id: downloadMaterials[5].id, // Sixth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Community Gardening download materials images
            {
                src: '/images/initiatives/gardening-guide-cover.jpg',
                alt: 'Корица на ръководството за градинарство',
                imageable_id: downloadMaterials[6].id, // Seventh download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/initiatives/calendar-cover.jpg',
                alt: 'Календар за засаждане',
                imageable_id: downloadMaterials[7].id, // Eighth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Senior Buddy System download materials images
            {
                src: '/images/initiatives/buddy-handbook-cover.jpg',
                alt: 'Корица на наръчника за приятели',
                imageable_id: downloadMaterials[8].id, // Ninth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Arts & Crafts download materials images
            {
                src: '/images/initiatives/art-guide-cover.jpg',
                alt: 'Корица на ръководството за изкуство',
                imageable_id: downloadMaterials[9].id, // Tenth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/initiatives/patterns-cover.jpg',
                alt: 'Колекция шарки',
                imageable_id: downloadMaterials[10].id, // Eleventh download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Projects for all initiatives
        await queryInterface.bulkInsert('projects', [
            // Projects for Initiative 1 (Pensa Club)
            {
                title_slug: 'pensa-digital-platform',
                slug: 'pensa-digital-platform',
                title: 'Дигитална платформа Pensa Club',
                description: 'Разработка на уеб платформа за свързване на възрастни хора с общи интереси.',
                status: 'in-progress',
                image: 'https://activatedinsights.com/wp-content/uploads/2015/06/Older-couple-using-laptop-mb.jpg',
                link: '/projects/pensa-digital-platform',
                lat: 42.6951,
                lng: 23.3274,
                initiative_id: initiatives[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'pensa-bosch-partnership',
                slug: 'pensa-bosch-partnership',
                title: 'Партньорство с Роберт Бош',
                description: 'Установяване на партньорство с Фондация Роберт Бош за създаване на Алумни клуб.',
                status: 'planned',
                image: 'https://www.spot.uz/media/img/2022/08/hxj2CB16611736277606_l.jpg',
                link: '/projects/pensa-bosch-partnership',
                lat: 42.7025,
                lng: 23.3156,
                initiative_id: initiatives[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'pensa-intergenerational-bridge',
                slug: 'pensa-intergenerational-bridge',
                title: 'Междупоколенчески мост',
                description: 'Програма за свързване на възрастни хора с младежи чрез технологии.',
                status: 'active',
                image: 'https://media.azpm.org/master/image/2018/5/21/spot/teeniors_2.jpg',
                link: '/projects/pensa-intergenerational-bridge',
                lat: 42.6913,
                lng: 23.3298,
                initiative_id: initiatives[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Projects for Healthy Aging Program
            {
                title_slug: 'health-community-gardens',
                slug: 'health-community-gardens',
                title: 'Общностни градини',
                description: 'Създаване на градини за възрастни хора за физическа активност и социализация.',
                status: 'active',
                image: '/images/projects/community-gardens.jpg',
                link: '/projects/health-community-gardens',
                lat: 42.1398,
                lng: 24.7512,
                initiative_id: initiatives[1].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'health-fitness-centers',
                slug: 'health-fitness-centers',
                title: 'Фитнес центрове за възрастни',
                description: 'Специализирани фитнес центрове с оборудване за възрастни хора.',
                status: 'planned',
                image: '/images/projects/fitness-centers.jpg',
                link: '/projects/health-fitness-centers',
                lat: 42.1311,
                lng: 24.7389,
                initiative_id: initiatives[1].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Projects for Intergenerational Learning
            {
                title_slug: 'inter-tech-mentoring',
                slug: 'inter-tech-mentoring',
                title: 'Технологично менторство',
                description: 'Младежи обучават възрастни в използването на смартфони и таблети.',
                status: 'active',
                image: '/images/projects/tech-mentoring.jpg',
                link: '/projects/inter-tech-mentoring',
                lat: 43.2089,
                lng: 27.9095,
                initiative_id: initiatives[2].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'inter-cultural-exchange',
                slug: 'inter-cultural-exchange',
                title: 'Културен обмен',
                description: 'Програма за споделяне на традиции и култура между поколенията.',
                status: 'in-progress',
                image: '/images/projects/cultural-exchange.jpg',
                link: '/projects/inter-cultural-exchange',
                lat: 43.2195,
                lng: 27.9201,
                initiative_id: initiatives[2].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Projects for Digital Literacy
            {
                title_slug: 'digital-tablet-program',
                slug: 'digital-tablet-program',
                title: 'Програма за таблети',
                description: 'Предоставяне на таблети на курсистите за практически упражнения у дома.',
                status: 'active',
                image: '/images/projects/tablet-program.jpg',
                link: '/projects/digital-tablet-program',
                lat: 42.5012,
                lng: 27.4578,
                initiative_id: initiatives[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'digital-helpers',
                slug: 'digital-helpers',
                title: 'Дигитални помощници',
                description: 'Програма за обучение на млади доброволци да помагат на възрастни с технологиите.',
                status: 'in-progress',
                image: '/images/projects/digital-helpers.jpg',
                link: '/projects/digital-helpers',
                lat: 42.5089,
                lng: 27.4681,
                initiative_id: initiatives[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'digital-library-centers',
                slug: 'digital-library-centers',
                title: 'Дигитални центрове в библиотеки',
                description: 'Създаване на компютърни зони в местните библиотеки за обучение.',
                status: 'planned',
                image: '/images/projects/library-centers.jpg',
                link: '/projects/digital-library-centers',
                lat: 42.4995,
                lng: 27.4702,
                initiative_id: initiatives[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Projects for Community Gardening
            {
                title_slug: 'garden-seed-library',
                slug: 'garden-seed-library',
                title: 'Библиотека от семена',
                description: 'Създаване на общностна банка семена за размяна между градинарите.',
                status: 'active',
                image: '/images/projects/seed-library.jpg',
                link: '/projects/garden-seed-library',
                lat: 42.4289,
                lng: 25.6385,
                initiative_id: initiatives[4].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'garden-expansion',
                slug: 'garden-expansion',
                title: 'Разширяване на градините',
                description: 'Създаване на нови общностни градини в други квартали на града.',
                status: 'planned',
                image: '/images/projects/garden-expansion.jpg',
                link: '/projects/garden-expansion',
                lat: 42.4221,
                lng: 25.6298,
                initiative_id: initiatives[4].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'garden-composting-center',
                slug: 'garden-composting-center',
                title: 'Компостиращ център',
                description: 'Центр за компостиране на органични отпадъци от квартала.',
                status: 'in-progress',
                image: '/images/projects/composting-center.jpg',
                link: '/projects/garden-composting-center',
                lat: 42.4315,
                lng: 25.6412,
                initiative_id: initiatives[4].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Projects for Senior Buddy System
            {
                title_slug: 'buddy-app',
                slug: 'buddy-app',
                title: 'Мобилно приложение',
                description: 'Разработка на приложение за лесна комуникация между приятелите и организиране на срещи.',
                status: 'planned',
                image: '/images/projects/buddy-app.jpg',
                link: '/projects/buddy-app',
                lat: 43.4112,
                lng: 24.6234,
                initiative_id: initiatives[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'buddy-volunteer-network',
                slug: 'buddy-volunteer-network',
                title: 'Мрежа от доброволци',
                description: 'Обучение на доброволци които да координират и подкрепят системата приятели.',
                status: 'in-progress',
                image: '/images/projects/volunteer-network.jpg',
                link: '/projects/buddy-volunteer-network',
                lat: 43.4068,
                lng: 24.6125,
                initiative_id: initiatives[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'buddy-meeting-centers',
                slug: 'buddy-meeting-centers',
                title: 'Центрове за срещи',
                description: 'Създаване на комфортни места за срещи между приятелите.',
                status: 'planned',
                image: '/images/projects/meeting-centers.jpg',
                link: '/projects/buddy-meeting-centers',
                lat: 43.4145,
                lng: 24.6289,
                initiative_id: initiatives[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Projects for Arts & Crafts
            {
                title_slug: 'arts-community-mural',
                slug: 'arts-community-mural',
                title: 'Обществена стенопис',
                description: 'Създаване на голям стенопис в центъра на града с участието на всички творци.',
                status: 'completed',
                image: '/images/projects/community-mural.jpg',
                link: '/projects/arts-community-mural',
                lat: 43.8512,
                lng: 25.9658,
                initiative_id: initiatives[6].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'arts-mentorship',
                slug: 'arts-mentorship',
                title: 'Художествено менторство',
                description: 'Програма където опитни художници обучават начинаещи възрастни творци.',
                status: 'active',
                image: '/images/projects/art-mentorship.jpg',
                link: '/projects/arts-mentorship',
                lat: 43.8621,
                lng: 25.9753,
                initiative_id: initiatives[6].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title_slug: 'arts-gallery-space',
                slug: 'arts-gallery-space',
                title: 'Галерийно пространство',
                description: 'Постоянна галерия за показване на творбите на участниците.',
                status: 'planned',
                image: '/images/projects/gallery-space.jpg',
                link: '/projects/arts-gallery-space',
                lat: 43.8489,
                lng: 25.9631,
                initiative_id: initiatives[6].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Contacts for all initiatives
        const contacts = await queryInterface.bulkInsert('contacts', [
            // Main contacts
            {
                name: 'Валери Кекевски',
                position: 'Ръководител проект Pensa Club',
                email: 'valeri.kekevski@pensaclub.bg',
                phone: '+359 888 123 456',
                image: 'https://derma-act.bg/wp-content/uploads/2024/01/IMG_1818.jpg',
                is_main_contact: true,
                initiative_id: initiatives[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Д-р Елена Иванова',
                position: 'Координатор програма',
                email: 'elena.ivanova@healthyaging.bg',
                phone: '+359 888 765 432',
                image: '/images/contacts/elena-ivanova.jpg',
                is_main_contact: true,
                initiative_id: initiatives[1].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Мария Стоянова',
                position: 'Програмен мениджър',
                email: 'maria.stoyanova@intergenerational.bg',
                phone: '+359 888 654 321',
                image: '/images/contacts/maria-stoyanova.jpg',
                is_main_contact: true,
                initiative_id: initiatives[2].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Иван Петров',
                position: 'Инструктор по дигитални умения',
                email: 'ivan.petrov@digitalseniors.bg',
                phone: '+359 888 111 222',
                image: '/images/contacts/ivan-petrov.jpg',
                is_main_contact: true,
                initiative_id: initiatives[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Петя Георгиева',
                position: 'Координатор общностни градини',
                email: 'petya.georgieva@garden.bg',
                phone: '+359 888 333 444',
                image: '/images/contacts/petya-georgieva.jpg',
                is_main_contact: true,
                initiative_id: initiatives[4].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Димитър Стоянов',
                position: 'Социален работник и координатор',
                email: 'dimitar.stoyanov@buddy.bg',
                phone: '+359 888 555 666',
                image: '/images/contacts/dimitar-stoyanov.jpg',
                is_main_contact: true,
                initiative_id: initiatives[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Анна Николова',
                position: 'Художничка и координатор',
                email: 'anna.nikolova@arts.bg',
                phone: '+359 888 777 888',
                image: '/images/contacts/anna-nikolova.jpg',
                is_main_contact: true,
                initiative_id: initiatives[6].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Additional contacts
            {
                name: 'Виргиния Драгиева',
                phone: '+359 888 932 578',
                email: 'virginia.dragieva@pensaclub.bg',
                is_main_contact: false,
                initiative_id: initiatives[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Георги Георгиев',
                phone: '+359 888 475 421',
                email: 'georgi.georgiev@pensaclub.bg',
                is_main_contact: false,
                initiative_id: initiatives[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Мила Стоянова',
                phone: '+359 888 111 223',
                email: 'mila.stoyanova@digitalseniors.bg',
                is_main_contact: false,
                initiative_id: initiatives[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Стефан Николов',
                phone: '+359 888 333 445',
                email: 'stefan.nikolov@garden.bg',
                is_main_contact: false,
                initiative_id: initiatives[4].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Анелия Петрова',
                phone: '+359 888 555 667',
                email: 'anelia.petrova@buddy.bg',
                is_main_contact: false,
                initiative_id: initiatives[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Васил Димитров',
                phone: '+359 888 777 889',
                email: 'vasil.dimitrov@arts.bg',
                is_main_contact: false,
                initiative_id: initiatives[6].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('initiatives', null, {});
    },
};
