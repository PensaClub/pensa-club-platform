'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const articles = await queryInterface.bulkInsert(
            'articles',
            [
                {
                    title: 'Дигитална грамотност за възрастни хора: първи стъпки в света на технологиите',
                    slug: 'digital-literacy-first-steps',
                    summary: 'Как възрастните хора могат да започнат безопасно и уверено своето пътешествие в дигиталния свят',
                    author: 'Мария Петрова',
                    tags: ['дигитална грамотност', 'възрастни хора', 'технологии', 'обучение', 'интернет'],
                    updatedBy: 'Мария Петрова',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Социални мрежи за поддържане на активни връзки с близки и приятели',
                    slug: 'social-networks-family-connections',
                    summary: 'Как социалните мрежи могат да помогнат на възрастните хора да поддържат връзка с близки и приятели',
                    author: 'Иван Димитров',
                    tags: ['социални мрежи', 'възрастни хора', 'общуване', 'Facebook', 'WhatsApp'],
                    updatedBy: 'Иван Димитров',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Онлайн сигурност: как да се предпазим от интернет измами',
                    slug: 'online-security-protection',
                    summary: 'Практически съвети за защита от най-честите онлайн заплахи, насочени към възрастни хора',
                    author: 'Петър Иванов',
                    tags: ['онлайн сигурност', 'фишинг', 'пароли', 'лични данни', 'измами'],
                    updatedBy: 'Петър Иванов',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Онлайн образование за възрастни: достъпни курсове и ресурси',
                    slug: 'online-education-seniors',
                    summary: 'Какви са възможностите за онлайн обучение, подходящи за възрастни хора, и как да се възползвате от тях',
                    author: 'Силвия Георгиева',
                    tags: ['онлайн образование', 'възрастни хора', 'курсове', 'учене през целия живот'],
                    updatedBy: 'Силвия Георгиева',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'YouTube за начинаещи: как да намерите полезно съдържание',
                    slug: 'youtube-for-beginners',
                    summary: 'Ръководство за начинаещи как да използват YouTube за намиране на полезно и образователно съдържание',
                    author: 'Георги Стоянов',
                    tags: ['YouTube', 'видео платформи', 'образование', 'дигитална грамотност'],
                    updatedBy: 'Георги Стоянов',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Здравни приложения и онлайн консултации за възрастни хора',
                    slug: 'health-apps-online-consultations',
                    summary: 'Как да използвате модерните технологии за подобряване на здравословното си състояние и достъп до медицински услуги',
                    author: 'Мария Петрова',
                    tags: ['здраве', 'телемедицина', 'приложения', 'онлайн консултации'],
                    updatedBy: 'Мария Петрова',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Онлайн пазаруване: съвети за безопасност и удобство',
                    slug: 'online-shopping-safety-tips',
                    summary: 'Практическо ръководство за безопасно онлайн пазаруване и избягване на често срещани капани',
                    author: 'Иван Димитров',
                    tags: ['онлайн пазаруване', 'електронна търговия', 'сигурност', 'съвети'],
                    updatedBy: 'Иван Димитров',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Дигитални развлечения за активен ум',
                    slug: 'digital-entertainment-active-mind',
                    summary: 'Открийте забавни и полезни начини за поддържане на ума активен чрез дигитални игри и приложения',
                    author: 'Силвия Георгиева',
                    tags: ['игри', 'развлечения', 'мозъчна активност', 'приложения'],
                    updatedBy: 'Силвия Георгиева',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Виртуални пътешествия и културни преживявания',
                    slug: 'virtual-travel-cultural-experiences',
                    summary: 'Как да посетите музеи, галерии и забележителности от целия свят без да напускате дома си',
                    author: 'Петър Иванов',
                    tags: ['виртуални турове', 'култура', 'музеи', 'пътешествия'],
                    updatedBy: 'Петър Иванов',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Дигитално банкиране за възрастни: сигурност и удобство',
                    slug: 'digital-banking-seniors',
                    summary: 'Как да управлявате финансите си онлайн безопасно и ефективно',
                    author: 'Георги Стоянов',
                    tags: ['онлайн банкиране', 'финанси', 'сигурност', 'мобилно банкиране'],
                    updatedBy: 'Георги Стоянов',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Видео разговори: как да общувате с близките си онлайн',
                    slug: 'video-calls-guide',
                    summary: 'Научете как да използвате различни приложения за видео разговори, за да поддържате връзка с вашите близки',
                    author: 'Мария Петрова',
                    tags: ['видео разговори', 'Skype', 'Zoom', 'комуникация', 'семейство'],
                    updatedBy: 'Мария Петрова',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Дигитална фотография за начинаещи',
                    slug: 'digital-photography-basics',
                    summary: 'Основни съвети за правене и споделяне на снимки с вашия смартфон или таблет',
                    author: 'Иван Димитров',
                    tags: ['фотография', 'смартфон', 'снимки', 'споделяне', 'албуми'],
                    updatedBy: 'Иван Димитров',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Умен дом: технологии за по-удобен живот',
                    slug: 'smart-home-for-seniors',
                    summary: 'Как интелигентните домашни устройства могат да направят ежедневието ви по-лесно и по-безопасно',
                    author: 'Петър Иванов',
                    tags: ['умен дом', 'автоматизация', 'сигурност', 'удобство', 'технологии'],
                    updatedBy: 'Петър Иванов',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Настройки за поверителност: защита на личната информация онлайн',
                    slug: 'privacy-settings-guide',
                    summary: 'Как да управлявате настройките за поверителност на вашите акаунти и устройства',
                    author: 'Силвия Георгиева',
                    tags: ['поверителност', 'настройки', 'сигурност', 'лични данни', 'защита'],
                    updatedBy: 'Силвия Георгиева',
                    publishDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {
                returning: ['id', 'title', 'slug'],
            }
        );

        await queryInterface.bulkInsert('mainImages', [
            {
                type: 'image',
                sources: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'],
                alt: 'Възрастна жена използва таблет с усмивка',
                articleId: articles[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'slider',
                sources: [
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                ],
                alt: 'Възрастни хора използват социални мрежи',
                articleId: articles[1].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=sdpxddDzXfE'],
                thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                alt: 'Видео за онлайн сигурност и защита',
                articleId: articles[2].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'],
                alt: 'Възрастни хора участват в онлайн обучение',
                articleId: articles[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=Xa5lZoKlpDs'],
                thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                alt: 'Видео урок за използване на YouTube',
                articleId: articles[4].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e'],
                alt: 'Възрастен човек използва здравно приложение',
                articleId: articles[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'slider',
                sources: [
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                ],
                alt: 'Безопасно онлайн пазаруване',
                articleId: articles[6].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'],
                alt: 'Възрастни хора играят дигитални игри',
                articleId: articles[7].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=sRyqmzFVLV4'],
                thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                alt: 'Виртуална разходка в музей',
                articleId: articles[8].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'],
                alt: 'Възрастен човек използва онлайн банкиране',
                articleId: articles[9].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=xk_8c7hqh_4'],
                thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                alt: 'Как да провеждате видео разговори',
                articleId: articles[10].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'slider',
                sources: [
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                ],
                alt: 'Основи на дигиталната фотография',
                articleId: articles[11].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=LJ9XhyFUX6k'],
                thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                alt: 'Ръководство за умен дом',
                articleId: articles[12].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'],
                alt: 'Настройки за поверителност',
                articleId: articles[13].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const sections = await queryInterface.bulkInsert(
            'sections',
            [
                {
                    title: 'Защо дигиталната грамотност е важна за възрастните хора?',
                    content:
                        'В съвременния свят, дигиталните технологии промениха начина, по който комуникираме, пазаруваме и получаваме информация. За възрастните хора, овладяването на тези технологии може да донесе множество ползи, включително поддържане на връзка със семейството, достъп до здравни услуги онлайн, и възможности за учене през целия живот...',
                    order: 1,
                    sectionable_id: articles[0].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Избор на подходящо устройство',
                    content:
                        'Първата стъпка в дигиталния свят е изборът на подходящо устройство. Таблетите често са предпочитан избор за начинаещи поради техния по-голям екран и интуитивен интерфейс с докосване. Смартфоните са по-компактни и винаги под ръка, но по-малкият им екран може да бъде предизвикателство. Лаптопите предлагат пълна функционалност, но имат по-стръмна крива на обучение...',
                    order: 2,
                    sectionable_id: articles[0].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни умения за навигация',
                    content:
                        'След като имате устройство, следващата стъпка е да усвоите основните жестове и команди за навигация. При устройства с докосване, това включва докосване, плъзгане, щипване за увеличаване и намаляване. За компютри, важно е да се научите да използвате мишка и клавиатура ефективно...',
                    order: 3,
                    sectionable_id: articles[0].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Какви са ползите от социалните мрежи за възрастните хора?',
                    content:
                        'Социалните мрежи предлагат уникални възможности за свързване и общуване, особено за възрастните хора, които може да имат ограничена мобилност или да живеят далеч от семейството си. Изследванията показват, че активното социално взаимодействие може да намали риска от депресия и да подобри когнитивното функциониране при възрастните хора...',
                    order: 1,
                    sectionable_id: articles[1].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Кои платформи са най-подходящи?',
                    content:
                        'Съществуват различни социални платформи, всяка със своит предимства. Facebook е популярен избор с интуитивен интерфейс и функции като групи и събития. WhatsApp и Viber предлагат лесни за използване опции за съобщения и видео разговори. Instagram е идеален за споделяне на снимки с близки...',
                    order: 2,
                    sectionable_id: articles[1].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Разпознаване на фишинг атаки',
                    content:
                        'Фишинг атаките са един от най-честите методи, използвани от измамниците онлайн. Те включват имейли, съобщения или обаждания, претендиращи да са от легитимни организации, с цел да се сдобият с лична информация като пароли или банкови данни...',
                    order: 1,
                    sectionable_id: articles[2].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Създаване на сигурни пароли',
                    content:
                        'Силните пароли са вашата първа линия на защита в дигиталния свят. Научете как да създавате и управлявате сигурни пароли, които са лесни за запомняне, но трудни за отгатване. Използвайте уникални пароли за различните си акаунти и никога не ги споделяйте с други хора...',
                    order: 2,
                    sectionable_id: articles[2].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Безплатни образователни платформи',
                    content:
                        'Съществуват множество безплатни онлайн платформи, които предлагат курсове в различни области - от изкуство и история до технологии и езици. Платформи като Coursera, Khan Academy и EdX предлагат курсове от световни университети, които можете да следвате със собствено темпо...',
                    order: 1,
                    sectionable_id: articles[3].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Какво представлява YouTube?',
                    content:
                        'YouTube е най-голямата платформа за споделяне на видео съдържание в света. Тя предлага милиони видеоклипове на различни теми - от развлекателни до образователни. За възрастните хора, YouTube може да бъде ценен ресурс за учене на нови умения, гледане на документални филми, или просто за забавление...',
                    order: 1,
                    sectionable_id: articles[4].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Мобилни приложения за здравословен начин на живот',
                    content:
                        'Съвременните здравни приложения предлагат разнообразни функции - от проследяване на физическата активност до напомняне за прием на лекарства. Научете как да използвате тези инструменти за подобряване на здравословното си състояние...',
                    order: 1,
                    sectionable_id: articles[5].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни правила за безопасно онлайн пазаруване',
                    content:
                        'Преди да започнете да пазарувате онлайн, важно е да знаете как да разпознавате надеждните търговци и да защитавате финансовата си информация. Научете за сигурните методи на плащане и как да избягвате често срещани измами...',
                    order: 1,
                    sectionable_id: articles[6].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Игри за развиване на паметта и концентрацията',
                    content:
                        'Дигиталните игри могат да бъдат чудесен начин за поддържане на мозъка активен. От класически пъзели до модерни приложения за трениране на паметта, съществуват множество забавни опции за всички възрасти...',
                    order: 1,
                    sectionable_id: articles[7].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Виртуални обиколки на световни музеи',
                    content:
                        'Благодарение на модерните технологии, вече можете да разглеждате най-известните музеи и галерии в света от удобството на вашия дом. Научете как да достъпвате тези виртуални турове и да се наслаждавате на изкуството и културата онлайн...',
                    order: 1,
                    sectionable_id: articles[8].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основи на онлайн банкирането',
                    content:
                        'Онлайн банкирането може значително да улесни управлението на финансите ви. Научете как да проверявате баланса си, да извършвате преводи и да плащате сметки онлайн по сигурен начин...',
                    order: 1,
                    sectionable_id: articles[9].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Избор на приложение за видео разговори',
                    content:
                        'Съществуват множество приложения за видео разговори, всяко със свои предимства. Zoom е популярен избор за групови разговори, докато Skype е отлично решение за разговори между двама души. WhatsApp и Viber също предлагат качествени видео разговори и са лесни за използване...',
                    order: 1,
                    sectionable_id: articles[10].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Подготовка за видео разговор',
                    content:
                        'За успешен видео разговор е важно да имате добра интернет връзка и подходящо осветление. Изберете тихо място с минимален фонов шум. Проверете дали камерата и микрофонът на вашето устройство работят правилно преди започване на разговора...',
                    order: 2,
                    sectionable_id: articles[10].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни функции на камерата',
                    content:
                        'Съвременните смартфони разполагат с мощни камери и множество функции за заснемане. Научете как да правите качествени снимки, да използвате различните режими на снимане и да редактирате вашите фотографии директно на устройството...',
                    order: 1,
                    sectionable_id: articles[11].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Споделяне и организиране на снимки',
                    content:
                        'След като направите снимки, е важно да знаете как да ги организирате в албуми и да ги споделяте с близките си. Научете за различните опции за съхранение в облака и как да изпращате снимки чрез съобщения или социални мрежи...',
                    order: 2,
                    sectionable_id: articles[11].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Въведение в умния дом',
                    content:
                        'Умният дом включва различни устройства, които могат да се управляват дистанционно и да автоматизират ежедневни задачи. От интелигентни осветителни системи до термостати и системи за сигурност - всички те могат да направят живота ви по-удобен и по-сигурен...',
                    order: 1,
                    sectionable_id: articles[12].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Избор на умни устройства',
                    content:
                        'При избора на умни устройства е важно да се съобразите с вашите нужди и възможности. Започнете с прости устройства като умни крушки или контакти, и постепенно добавяйте по-сложни системи като термостати или системи за сигурност...',
                    order: 2,
                    sectionable_id: articles[12].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основи на онлайн поверителността',
                    content:
                        'Разберете защо е важно да контролирате своята онлайн поверителност и какви са основните настройки, които трябва да познавате. Научете за различните нива на поверителност и как те влияят на вашата онлайн безопасност...',
                    order: 1,
                    sectionable_id: articles[13].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Настройки за поверителност в социалните мрежи',
                    content:
                        'Всяка социална мрежа има свои специфични настройки за поверителност. Научете как да контролирате кой вижда вашите публикации, как да управлявате заявките за приятелство и как да защитите личната си информация в различните платформи...',
                    order: 2,
                    sectionable_id: articles[13].id,
                    section_link_connection: 'article',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {
                returning: ['id', 'sectionable_id'],
            }
        );

        await queryInterface.bulkInsert('images', [
            {
                src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
                alt: 'Възрастни хора учат дигитални умения',
                caption: 'Дигиталната грамотност отваря нови възможности за възрастните хора',
                imageable_id: sections[0].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
                alt: 'Различни видове таблети и смартфони',
                caption: 'Изборът на подходящо устройство е важен първи етап',
                imageable_id: sections[1].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
                alt: 'Възрастни хора използват социални медии',
                caption: 'Социалните мрежи помагат за поддържане на активни връзки',
                imageable_id: sections[3].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019230-a1abed86a175',
                alt: 'Пример за фишинг имейл',
                caption: 'Научете как да разпознавате подозрителни имейли',
                imageable_id: sections[5].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
                alt: 'Онлайн образователни платформи',
                caption: 'Множество платформи предлагат безплатно обучение',
                imageable_id: sections[7].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
                alt: 'YouTube интерфейс',
                caption: 'YouTube предлага богато разнообразие от образователно съдържание',
                imageable_id: sections[8].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
                alt: 'Здравни приложения на смартфон',
                caption: 'Модерните приложения помагат за по-добро здравословно състояние',
                imageable_id: sections[9].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019230-a1abed86a175',
                alt: 'Безопасно онлайн пазаруване',
                caption: 'Научете как да пазарувате онлайн безопасно',
                imageable_id: sections[10].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
                alt: 'Дигитални игри за възрастни',
                caption: 'Игрите поддържат ума активен и подобряват концентрацията',
                imageable_id: sections[11].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
                alt: 'Виртуална разходка в музей',
                caption: 'Разгледайте световни музеи от вкъщи',
                imageable_id: sections[12].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
                alt: 'Онлайн банкиране интерфейс',
                caption: 'Управлявайте финансите си лесно и сигурно онлайн',
                imageable_id: sections[13].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019230-a1abed86a175',
                alt: 'Сравнение на приложения за видео разговори',
                caption: 'Популярни приложения за видео разговори и техните предимства',
                imageable_id: sections[14].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
                alt: 'Подготовка за видео разговор',
                caption: 'Правилна настройка за качествен видео разговор',
                imageable_id: sections[15].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
                alt: 'Основни функции на камерата',
                caption: 'Запознайте се с основните функции на вашата камера',
                imageable_id: sections[16].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
                alt: 'Споделяне на снимки',
                caption: 'Различни начини за споделяне на вашите снимки',
                imageable_id: sections[17].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019230-a1abed86a175',
                alt: 'Основи на умния дом',
                caption: 'Въведение в технологиите за умен дом',
                imageable_id: sections[18].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
                alt: 'Избор на умни устройства',
                caption: 'Как да изберете подходящите умни устройства',
                imageable_id: sections[19].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
                alt: 'Основи на онлайн поверителността',
                caption: 'Разберете основите на онлайн поверителността',
                imageable_id: sections[20].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
                alt: 'Настройки за поверителност в социални мрежи',
                caption: 'Управление на поверителността в социалните мрежи',
                imageable_id: sections[21].id,
                image_link_connection: 'section',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        await queryInterface.sequelize.query(`
            UPDATE articles
            SET "relatedArticleId" = CASE
                WHEN id = ${articles[0].id} THEN ${articles[1].id}  -- Digital Literacy -> Social Networks
                WHEN id = ${articles[1].id} THEN ${articles[2].id}  -- Social Networks -> Online Security
                WHEN id = ${articles[2].id} THEN ${articles[3].id}  -- Online Security -> Online Education
                WHEN id = ${articles[3].id} THEN ${articles[4].id}  -- Online Education -> YouTube Guide
                WHEN id = ${articles[4].id} THEN ${articles[5].id}  -- YouTube -> Health Apps
                WHEN id = ${articles[5].id} THEN ${articles[6].id}  -- Health Apps -> Online Shopping
                WHEN id = ${articles[6].id} THEN ${articles[9].id}  -- Online Shopping -> Digital Banking
                WHEN id = ${articles[7].id} THEN NULL               -- Digital Entertainment -> (none)
                WHEN id = ${articles[8].id} THEN ${articles[10].id} -- Virtual Travel -> Video Calls
                WHEN id = ${articles[9].id} THEN ${articles[11].id} -- Digital Banking -> Photography
                WHEN id = ${articles[10].id} THEN NULL              -- Video Calls -> (none)
                WHEN id = ${articles[11].id} THEN NULL              -- Photography -> (none)
                WHEN id = ${articles[12].id} THEN ${articles[8].id} -- Smart Home -> Virtual Travel
                WHEN id = ${articles[13].id} THEN NULL              -- Privacy Settings -> (none)
            END,
            "nextArticleId" = CASE
                WHEN id = ${articles[0].id} THEN ${articles[1].id}
                WHEN id = ${articles[1].id} THEN ${articles[2].id}
                WHEN id = ${articles[2].id} THEN ${articles[3].id}
                WHEN id = ${articles[3].id} THEN ${articles[4].id}
                WHEN id = ${articles[4].id} THEN ${articles[5].id}
                WHEN id = ${articles[5].id} THEN ${articles[6].id}
                WHEN id = ${articles[6].id} THEN ${articles[7].id}
                WHEN id = ${articles[7].id} THEN ${articles[8].id}
                WHEN id = ${articles[8].id} THEN ${articles[9].id}
                WHEN id = ${articles[9].id} THEN ${articles[10].id}
                WHEN id = ${articles[10].id} THEN ${articles[11].id}
                WHEN id = ${articles[11].id} THEN ${articles[12].id}
                WHEN id = ${articles[12].id} THEN ${articles[13].id}
                WHEN id = ${articles[13].id} THEN NULL
            END,
            "previousArticleId" = CASE
                WHEN id = ${articles[0].id} THEN NULL
                WHEN id = ${articles[1].id} THEN ${articles[0].id}
                WHEN id = ${articles[2].id} THEN ${articles[1].id}
                WHEN id = ${articles[3].id} THEN ${articles[2].id}
                WHEN id = ${articles[4].id} THEN ${articles[3].id}
                WHEN id = ${articles[5].id} THEN ${articles[4].id}
                WHEN id = ${articles[6].id} THEN ${articles[5].id}
                WHEN id = ${articles[7].id} THEN ${articles[6].id}
                WHEN id = ${articles[8].id} THEN ${articles[7].id}
                WHEN id = ${articles[9].id} THEN ${articles[8].id}
                WHEN id = ${articles[10].id} THEN ${articles[9].id}
                WHEN id = ${articles[11].id} THEN ${articles[10].id}
                WHEN id = ${articles[12].id} THEN ${articles[11].id}
                WHEN id = ${articles[13].id} THEN ${articles[12].id}
            END
        `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('images', null, {});
        await queryInterface.bulkDelete('sections', null, {});
        await queryInterface.bulkDelete('mainImages', null, {});
        await queryInterface.bulkDelete('articles', null, {});
    },
};
