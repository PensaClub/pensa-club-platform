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
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 15,
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
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 15,
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
                    created_at: new Date(),
                    updated_at: new Date(),
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
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 1,
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
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 'active',
                    campaign_status: 'open',
                    comments_enabled: true,
                    creator_id: 1,
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
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 'planned',
                    campaign_status: 'closed',
                    comments_enabled: false,
                    creator_id: 15,
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
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 'completed',
                    campaign_status: 'closed',
                    comments_enabled: true,
                    creator_id: 15,
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
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://pibindia.wordpress.com/wp-content/uploads/2016/11/health-aging.jpg?w=1095',
                alt: 'Възрастни хора правят упражнения в парк',
                imageable_id: initiatives[1].id,
                image_link_connection: 'initiative_main',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.earlychildhoodireland.ie/wp-content/uploads/2024/02/Intergenerational.png',
                alt: 'Млад човек обучава възрастен на компютър',
                imageable_id: initiatives[2].id,
                image_link_connection: 'initiative_main',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://crestwoodmanoronline.org/wp-content/uploads/Crestwood-Manor-519545542.jpg',
                alt: 'Възрастни хора се обучават на компютри',
                imageable_id: initiatives[3].id,
                image_link_connection: 'initiative_main',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://civicwell.org/wp-content/uploads/2013/07/feature-cultivating-community-gardens.jpg',
                alt: 'Хора работят заедно в градина',
                imageable_id: initiatives[4].id,
                image_link_connection: 'initiative_main',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.students-care.org/wp-content/uploads/2023/10/2.jpg',
                alt: 'Двама възрастни приятели се разхождат',
                imageable_id: initiatives[5].id,
                image_link_connection: 'initiative_main',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn2.hubspot.net/hubfs/2881057/Crafts%20for%20Senior%20to%20Do%20at%20Home1000px.jpg',
                alt: 'Възрастни хора рисуват в ателие',
                imageable_id: initiatives[6].id,
                image_link_connection: 'initiative_main',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Add logo images for initiatives
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968641.png',
                alt: 'Pensa Club Logo',
                imageable_id: initiatives[0].id,
                image_link_connection: 'initiative_logo',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968642.png',
                alt: 'Healthy Aging Program Logo',
                imageable_id: initiatives[1].id,
                image_link_connection: 'initiative_logo',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968643.png',
                alt: 'Intergenerational Learning Logo',
                imageable_id: initiatives[2].id,
                image_link_connection: 'initiative_logo',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968644.png',
                alt: 'Digital Literacy Logo',
                imageable_id: initiatives[3].id,
                image_link_connection: 'initiative_logo',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968645.png',
                alt: 'Community Gardening Logo',
                imageable_id: initiatives[4].id,
                image_link_connection: 'initiative_logo',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968646.png',
                alt: 'Senior Buddy System Logo',
                imageable_id: initiatives[5].id,
                image_link_connection: 'initiative_logo',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968647.png',
                alt: 'Arts & Crafts Logo',
                imageable_id: initiatives[6].id,
                image_link_connection: 'initiative_logo',
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
                src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                alt: 'Мисия на Pensa Club',
                imageable_id: sections[0].id, // mission section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
                alt: 'За Pensa Club',
                imageable_id: sections[1].id, // about section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
                alt: 'Цели на Pensa Club',
                imageable_id: sections[2].id, // goals section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad',
                alt: 'Алумни клуб',
                imageable_id: sections[3].id, // alumni-club section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Health Center sections images
            {
                src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
                alt: 'Мисия на здравния център',
                imageable_id: sections[4].id, // health-center-mission section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Arts Studio sections images
            {
                src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
                alt: 'Визия на студиото',
                imageable_id: sections[5].id, // arts-studio-vision section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Innovation Lab sections images
            {
                src: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
                alt: 'Цели на лабораторията',
                imageable_id: sections[6].id, // innovation-lab-goals section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Healthy Aging Program sections images
            {
                src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
                alt: 'Общ преглед на програмата',
                imageable_id: sections[7].id, // overview section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
                alt: 'Физически активности',
                imageable_id: sections[8].id, // physical-activities section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Intergenerational Learning sections images
            {
                src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                alt: 'Концепция на програмата',
                imageable_id: sections[9].id, // concept section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Digital Literacy sections images
            {
                src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
                alt: 'Преглед на програмата',
                imageable_id: sections[10].id, // overview section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
                alt: 'Учебна програма',
                imageable_id: sections[11].id, // curriculum section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
                alt: 'Техническа подкрепа',
                imageable_id: sections[12].id, // support section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Community Gardening sections images
            {
                src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399',
                alt: 'Мисия на проекта',
                imageable_id: sections[13].id, // mission section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399',
                alt: 'Дейности в градината',
                imageable_id: sections[14].id, // activities section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399',
                alt: 'Ползи за общността',
                imageable_id: sections[15].id, // benefits section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Senior Buddy System sections images
            {
                src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                alt: 'Концепция на програмата',
                imageable_id: sections[16].id, // concept section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                alt: 'Подбиране на двойки',
                imageable_id: sections[17].id, // matching section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                alt: 'Общи дейности',
                imageable_id: sections[18].id, // activities section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Arts & Crafts sections images
            {
                src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
                alt: 'Творчески работилници',
                imageable_id: sections[19].id, // workshops section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
                alt: 'Изложби и събития',
                imageable_id: sections[20].id, // exhibitions section
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
                alt: 'Терапевтични ползи',
                imageable_id: sections[21].id, // therapy section
                image_link_connection: 'section',
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
                    downloadable_id: initiatives[0].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[0].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[1].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[2].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[3].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[3].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[4].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[4].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[5].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[6].id,
                    download_link_connection: 'initiative',
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
                    downloadable_id: initiatives[6].id,
                    download_link_connection: 'initiative',
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
                alt: 'Корица на提醒大家',
                imageable_id: downloadMaterials[2].id, // Third download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Intergenerational Learning download materials images
            {
                src: '/images/initiatives/program-guide-cover.jpg',
                alt: 'Корица на提醒大家',
                imageable_id: downloadMaterials[3].id, // Fourth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Digital Literacy download materials images
            {
                src: '/images/initiatives/digital-guide-cover.jpg',
                alt: 'Корица на提醒大家',
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
                alt: 'Корица на提醒大家',
                imageable_id: downloadMaterials[6].id, // Seventh download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: '/images/initiatives/calendar-cover.jpg',
                alt: 'Корица на提醒大家',
                imageable_id: downloadMaterials[7].id, // Eighth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Senior Buddy System download materials images
            {
                src: '/images/initiatives/buddy-handbook-cover.jpg',
                alt: 'Корица на提醒大家',
                imageable_id: downloadMaterials[8].id, // Ninth download material
                image_link_connection: 'downloadMaterial',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Arts & Crafts download materials images
            {
                src: '/images/initiatives/art-guide-cover.jpg',
                alt: 'Корица на提醒大家',
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
                contactable_id: initiatives[0].id,
                contact_link_connection: 'initiative',
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
                contactable_id: initiatives[1].id,
                contact_link_connection: 'initiative',
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
                contactable_id: initiatives[2].id,
                contact_link_connection: 'initiative',
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
                contactable_id: initiatives[3].id,
                contact_link_connection: 'initiative',
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
                contactable_id: initiatives[4].id,
                contact_link_connection: 'initiative',
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
                contactable_id: initiatives[5].id,
                contact_link_connection: 'initiative',
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
                contactable_id: initiatives[6].id,
                contact_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Additional contacts
            {
                name: 'Виргиния Драгиева',
                phone: '+359 888 932 578',
                email: 'virginia.dragieva@pensaclub.bg',
                is_main_contact: false,
                contactable_id: initiatives[0].id,
                contact_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Георги Георгиев',
                phone: '+359 888 475 421',
                email: 'georgi.georgiev@pensaclub.bg',
                is_main_contact: false,
                contactable_id: initiatives[0].id,
                contact_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Мила Стоянова',
                phone: '+359 888 111 223',
                email: 'mila.stoyanova@digitalseniors.bg',
                is_main_contact: false,
                contactable_id: initiatives[3].id,
                contact_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Стефан Николов',
                phone: '+359 888 333 445',
                email: 'stefan.nikolov@garden.bg',
                is_main_contact: false,
                contactable_id: initiatives[4].id,
                contact_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Анелия Петрова',
                phone: '+359 888 555 667',
                email: 'anelia.petrova@buddy.bg',
                is_main_contact: false,
                contactable_id: initiatives[5].id,
                contact_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Васил Димитров',
                phone: '+359 888 777 889',
                email: 'vasil.dimitrov@arts.bg',
                is_main_contact: false,
                contactable_id: initiatives[6].id,
                contact_link_connection: 'initiative',
                createdAt: new Date(),
                updatedAt: new Date(),
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
                // Sponsors for Healthy Aging Program
                {
                    name: 'Health Plus Insurance',
                    amount: 7500.0,
                    currency: 'BGN',
                    sponsorship_type: 'Platinum',
                    is_visible: true,
                    website: 'https://healthplus.bg',
                    sponsorable_id: initiatives[1].id,
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
                // Partners for Healthy Aging Program
                {
                    name: 'Wellness Center Sofia',
                    description: 'Leading wellness and health center',
                    website: 'https://wellness.sofia',
                    partnership_type: 'Healthcare',
                    is_visible: true,
                    partnerable_id: initiatives[1].id,
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
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968652.png',
                alt: 'Digital Future Foundation Logo',
                imageable_id: sponsors[1].id,
                image_link_connection: 'sponsor',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968653.png',
                alt: 'Health Plus Insurance Logo',
                imageable_id: sponsors[2].id,
                image_link_connection: 'sponsor',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Add logo images for partners
        await queryInterface.bulkInsert('images', [
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968661.png',
                alt: 'Senior Care Association Logo',
                imageable_id: partners[0].id,
                image_link_connection: 'partner',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968662.png',
                alt: 'Digital Skills Academy Logo',
                imageable_id: partners[1].id,
                image_link_connection: 'partner',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://cdn-icons-png.flaticon.com/512/1968/1968663.png',
                alt: 'Wellness Center Sofia Logo',
                imageable_id: partners[2].id,
                image_link_connection: 'partner',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Comments
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

            // Comments for Healthy Aging Program
            {
                content: 'Участвах в йога занятията и съм много доволна! Препоръчвам на всички възрастни хора да се включат.',
                user_id: 5,
                commentable_id: initiatives[1].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['ivan@example.com', 'petra@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Кога ще има нови групи за начинаещи? Искам да започна с по-леки упражнения.',
                user_id: 6,
                commentable_id: initiatives[1].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Здравейте Иван! Следващите групи стартират на 15 април. Запишете се на телефона в контактите.',
                user_id: 4,
                commentable_id: initiatives[1].id,
                comment_link_connection: 'initiative',
                parent_id: 7,
                likes: ['ivan@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },

            // Comments for Digital Literacy
            {
                content: 'Благодарение на курса вече мога да пиша имейли на внуците си! Страхотни преподаватели.',
                user_id: 7,
                commentable_id: initiatives[3].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['milka@example.com', 'ivan@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Радвам се да чуя това, Стояне! Това е целта ни - да свързваме семействата.',
                user_id: 6,
                commentable_id: initiatives[3].id,
                comment_link_connection: 'initiative',
                parent_id: 9,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Има ли курсове и за социални мрежи? Искам да науча как да ползвам Facebook.',
                user_id: 8,
                commentable_id: initiatives[3].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['stoyan@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Много полезни курсове! Препоръчвам на всички да се запишат.',
                user_id: 9,
                commentable_id: initiatives[3].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },

            // Comments for Community Gardening
            {
                content: 'Градината вече е готова за новия сезон! Очакваме ви всички да се включите в засаждането.',
                user_id: 10,
                commentable_id: initiatives[4].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['stefan@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Отлична работа! Кога ще засадим доматите?',
                user_id: 11,
                commentable_id: initiatives[4].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: Sequelize.literal('ARRAY[]::text[]'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Доматите ще засадим в края на април когато мине студът.',
                user_id: 10,
                commentable_id: initiatives[4].id,
                comment_link_connection: 'initiative',
                parent_id: 14,
                likes: ['stefan@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },

            // Comments for Arts & Crafts
            {
                content: 'Работилниците бяха невероятни! Научих се да правя керамика и се запознах с прекрасни хора.',
                user_id: 12,
                commentable_id: initiatives[6].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['vasil@example.com'],
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                content: 'Благодаря на всички участници! Беше чудесна група за работа.',
                user_id: 13,
                commentable_id: initiatives[6].id,
                comment_link_connection: 'initiative',
                parent_id: null,
                likes: ['anna@example.com'],
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
        await queryInterface.bulkDelete('sponsors', null, {});
        await queryInterface.bulkDelete('partners', null, {});
        await queryInterface.bulkDelete('initiatives', null, {});
    },
};
