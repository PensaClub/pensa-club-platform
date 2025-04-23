'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            const articles = await queryInterface.bulkInsert(
                'articles',
                [
                    {
                        title: 'Първи стъпки в дигиталния свят за възрастни хора',
                        slug: 'first-steps-digital-world',
                        summary: 'Основни насоки за безопасно и уверено навлизане в света на технологиите за хора над 60 години',
                        author: 'Д-р Мария Иванова',
                        tags: ['начинаещи', 'основи', 'дигитална грамотност', 'технологии', 'възрастни хора'],
                        updatedBy: 'Д-р Мария Иванова',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Смартфон или таблет - кое е по-подходящо за вас?',
                        slug: 'smartphone-vs-tablet',
                        summary: 'Подробно сравнение на предимствата и недостатъците на различните мобилни устройства за възрастни потребители',
                        author: 'Инж. Петър Димитров',
                        tags: ['устройства', 'избор', 'смартфони', 'таблети', 'сравнение'],
                        updatedBy: 'Инж. Петър Димитров',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Безопасност в интернет за възрастни хора',
                        slug: 'internet-safety-seniors',
                        summary: 'Важни правила и съвети за защита от онлайн измами и запазване на личната информация',
                        author: 'Георги Николов',
                        tags: ['сигурност', 'защита', 'измами', 'лични данни', 'пароли'],
                        updatedBy: 'Георги Николов',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Връзка с близките чрез видео разговори',
                        slug: 'video-calls-family',
                        summary: 'Как да използвате Viber, WhatsApp и Skype за безплатни видео разговори с вашето семейство',
                        author: 'Елена Петрова',
                        tags: ['комуникация', 'видео разговори', 'семейство', 'приложения'],
                        updatedBy: 'Елена Петрова',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Дигитално здраве: онлайн консултации и здравни приложения',
                        slug: 'digital-health-apps',
                        summary: 'Ръководство за използване на телемедицина и приложения за следене на здравословното състояние',
                        author: 'Д-р Стефан Тодоров',
                        tags: ['здраве', 'телемедицина', 'приложения', 'консултации'],
                        updatedBy: 'Д-р Стефан Тодоров',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Забавление онлайн: игри за трениране на паметта',
                        slug: 'online-memory-games',
                        summary: 'Подбрани онлайн игри и приложения за поддържане на мозъка активен в напреднала възраст',
                        author: 'Д-р Анна Димитрова',
                        tags: ['игри', 'памет', 'забавление', 'мозъчна активност'],
                        updatedBy: 'Д-р Анна Димитрова',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Дигитално четене: електронни книги и аудиокниги',
                        slug: 'digital-reading',
                        summary: 'Как да четете книги на вашето устройство и да слушате аудиокниги',
                        author: 'Лилия Маркова',
                        tags: ['четене', 'книги', 'аудиокниги', 'култура'],
                        updatedBy: 'Лилия Маркова',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Виртуални разходки в музеи и галерии',
                        slug: 'virtual-museum-tours',
                        summary: 'Посетете световноизвестни музеи и галерии от комфорта на вашия дом',
                        author: 'Проф. Иван Петров',
                        tags: ['култура', 'изкуство', 'музеи', 'виртуални турове'],
                        updatedBy: 'Проф. Иван Петров',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Безопасно онлайн пазаруване за възрастни',
                        slug: 'safe-online-shopping',
                        summary: 'Практически съвети за сигурно пазаруване онлайн и избягване на измами',
                        author: 'Мария Стоянова',
                        tags: ['пазаруване', 'сигурност', 'онлайн магазини', 'плащания'],
                        updatedBy: 'Мария Стоянова',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Дигитално банкиране за начинаещи',
                        slug: 'digital-banking-basics',
                        summary: 'Как да управлявате банковата си сметка онлайн безопасно и лесно',
                        author: 'Николай Иванов',
                        tags: ['банкиране', 'финанси', 'сигурност', 'онлайн услуги'],
                        updatedBy: 'Николай Иванов',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'Социални мрежи за възрастни: Facebook ръководство',
                        slug: 'facebook-guide-seniors',
                        summary: 'Пълно ръководство за използване на Facebook - от създаване на профил до поддържане на връзка с близки',
                        author: 'Елена Димитрова',
                        tags: ['социални мрежи', 'Facebook', 'комуникация', 'снимки'],
                        updatedBy: 'Елена Димитрова',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        title: 'YouTube за възрастни: полезно съдържание и забавление',
                        slug: 'youtube-guide-seniors',
                        summary: 'Как да намирате и гледате интересно съдържание в най-голямата видео платформа',
                        author: 'Георги Петров',
                        tags: ['YouTube', 'видео', 'забавление', 'обучение'],
                        updatedBy: 'Георги Петров',
                        publishDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
                {
                    returning: true,
                }
            );

            // Add main images for each article
            await queryInterface.bulkInsert('mainImages', [
                {
                    type: 'image',
                    alt: 'Възрастен човек използващ таблет с усмивка',
                    articleId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'slider',
                    alt: 'Сравнение между смартфон и таблет с техните характеристики',
                    articleId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'slider',
                    alt: 'Илюстрация на интернет сигурност и защита на данните',
                    articleId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'video',
                    alt: 'Семейство провеждащо видео разговор',
                    thumbnail: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28',
                    articleId: articles[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'slider',
                    alt: 'Здравни приложения на смартфон и телемедицина',
                    articleId: articles[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'video',
                    alt: 'Игри за памет и мозъчна активност на таблет',
                    thumbnail: 'https://images.unsplash.com/photo-1558443957-d056622df610',
                    articleId: articles[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'slider',
                    alt: 'Електронен четец с отворена книга',
                    articleId: articles[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'video',
                    alt: 'Виртуална разходка в известен музей',
                    thumbnail: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd',
                    articleId: articles[7].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'slider',
                    alt: 'Безопасно онлайн пазаруване на компютър',
                    articleId: articles[8].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'video',
                    alt: 'Мобилно банкиране и онлайн плащания',
                    thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee9056b3c5',
                    articleId: articles[9].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'video',
                    alt: 'Facebook интерфейс за начинаещи',
                    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0',
                    articleId: articles[10].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    type: 'video',
                    alt: 'YouTube интерфейс с полезно съдържание',
                    thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb',
                    articleId: articles[11].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            // Add sections for each article
            await queryInterface.bulkInsert('sections', [
                // First Steps in Digital World
                {
                    title: 'Защо е важна дигиталната грамотност?',
                    content:
                        'В съвременния свят технологиите са неразделна част от ежедневието ни. За възрастните хора те предоставят възможности за по-лесна комуникация с близките, достъп до информация и услуги, както и начини за забавление и учене.',
                    order: 1,
                    articleId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни устройства за начинаещи',
                    content:
                        'Започнете с устройство, което ви е удобно - таблет или смартфон. Таблетът има по-голям екран и е по-лесен за използване в началото, докато смартфонът е по-компактен и винаги под ръка.',
                    order: 2,
                    articleId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Първи стъпки в интернет',
                    content:
                        'Интернет връзката е вашият път към дигиталния свят. Научете как да се свързвате безопасно с Wi-Fi мрежа и как да използвате мобилни данни.',
                    order: 3,
                    articleId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Smartphone vs Tablet
                {
                    title: 'Предимства на смартфона',
                    content:
                        'Смартфонът е компактен, винаги с вас и предлага всички основни функции - обаждания, съобщения, интернет достъп и камера. Идеален е за активни потребители.',
                    order: 1,
                    articleId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Предимства на таблета',
                    content:
                        'Таблетът има по-голям екран, което го прави идеален за четене, гледане на видео и видео разговори. По-лесен е за използване от хора с намалено зрение.',
                    order: 2,
                    articleId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Как да изберем подходящото устройство?',
                    content:
                        'Изборът зависи от вашите нужди. Помислете за: размер на екрана, мобилност, цена и предназначение. Можете да започнете с таблет и по-късно да преминете към смартфон.',
                    order: 3,
                    articleId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Internet Safety
                {
                    title: 'Основни правила за безопасност',
                    content:
                        'Създавайте сигурни пароли, не ги споделяйте с никого и използвайте различни пароли за различните си акаунти. Избягвайте публични Wi-Fi мрежи за чувствителни операции.',
                    order: 1,
                    articleId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Разпознаване на онлайн измами',
                    content:
                        'Внимавайте с имейли от непознати податели, особено такива, искащи лична информация. Проверявайте адреса на уебсайтовете, които посещавате.',
                    order: 2,
                    articleId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Защита на личните данни',
                    content: 'Бъдете внимателни каква информация споделяте онлайн. Не публикувайте лични данни и финансова информация в социалните мрежи.',
                    order: 3,
                    articleId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Video Calls
                {
                    title: 'Избор на приложение за видео разговори',
                    content: 'Viber, WhatsApp и Skype са най-популярните безплатни приложения. Изберете това, което вашите близки използват най-често.',
                    order: 1,
                    articleId: articles[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Настройка на камера и микрофон',
                    content: 'Преди разговор проверете дали камерата и микрофонът работят правилно. Изберете тихо и добре осветено място за разговора.',
                    order: 2,
                    articleId: articles[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Провеждане на видео разговор',
                    content:
                        'Научете как да започвате и приемате видео повиквания. Разберете как да включвате и изключвате камерата и микрофона по време на разговор.',
                    order: 3,
                    articleId: articles[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Digital Health
                {
                    title: 'Телемедицина и онлайн консултации',
                    content: 'Научете как да провеждате видео консултации с вашия лекар. Разберете предимствата и ограниченията на онлайн прегледите.',
                    order: 1,
                    articleId: articles[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Приложения за следене на здравето',
                    content: 'Открийте полезни приложения за проследяване на кръвно налягане, прием на лекарства и физическа активност.',
                    order: 2,
                    articleId: articles[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Съхранение на здравни данни',
                    content: 'Как да организирате и съхранявате безопасно вашите здравни записи и резултати от изследвания в дигитален формат.',
                    order: 3,
                    articleId: articles[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Memory Games
                {
                    title: 'Защо са важни игрите за памет?',
                    content: 'Редовните упражнения за мозъка помагат за поддържане на когнитивните функции и намаляват риска от деменция.',
                    order: 1,
                    articleId: articles[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Препоръчани игри и приложения',
                    content: 'Списък с подбрани безплатни игри за трениране на паметта, логическото мислене и концентрацията.',
                    order: 2,
                    articleId: articles[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Създаване на режим за упражнения',
                    content: 'Как да включите игрите в ежедневието си и колко време е препоръчително да отделяте за мозъчна гимнастика.',
                    order: 3,
                    articleId: articles[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Digital Reading
                {
                    title: 'Електронни книги и четци',
                    content:
                        'Запознайте се с предимствата на електронните книги и различните устройства за четене. Научете как да настроите размера на шрифта и яркостта.',
                    order: 1,
                    articleId: articles[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Аудиокниги и подкасти',
                    content: 'Открийте света на аудиокнигите и подкастите. Научете как да ги слушате у дома или в движение.',
                    order: 2,
                    articleId: articles[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Безплатни източници на съдържание',
                    content: 'Списък с библиотеки и платформи, предлагащи безплатни електронни и аудио книги на български език.',
                    order: 3,
                    articleId: articles[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Virtual Museums
                {
                    title: 'Какво представляват виртуалните турове?',
                    content: 'Виртуалните турове ви позволяват да разглеждате музеи и галерии от цял свят от комфорта на вашия дом.',
                    order: 1,
                    articleId: articles[7].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Как да започнете виртуална разходка?',
                    content: 'Стъпка по стъпка ръководство за достъп и навигация във виртуални турове на известни музеи.',
                    order: 2,
                    articleId: articles[7].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Препоръчани виртуални турове',
                    content: 'Селекция от най-интересните виртуални турове на музеи и галерии с български интерфейс.',
                    order: 3,
                    articleId: articles[7].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Online Shopping
                {
                    title: 'Основи на онлайн пазаруването',
                    content: 'Научете основните принципи на безопасното онлайн пазаруване. Как да разпознавате надеждни онлайн магазини.',
                    order: 1,
                    articleId: articles[8].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Методи за плащане онлайн',
                    content: 'Разберете различните начини за плащане и кои са най-сигурни. Научете за наложен платеж и онлайн банкиране.',
                    order: 2,
                    articleId: articles[8].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Права на потребителите',
                    content: 'Запознайте се с вашите права при онлайн пазаруване, включително право на връщане и замяна.',
                    order: 3,
                    articleId: articles[8].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Digital Banking
                {
                    title: 'Въведение в онлайн банкирането',
                    content: 'Какво е онлайн банкиране и какви са неговите предимства? Основни функции и възможности.',
                    order: 1,
                    articleId: articles[9].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Сигурност при онлайн банкиране',
                    content: 'Важни правила за сигурност при използване на онлайн банкиране. Как да защитите своята информация.',
                    order: 2,
                    articleId: articles[9].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни банкови операции онлайн',
                    content: 'Как да проверявате баланс, да извършвате преводи и да плащате сметки чрез онлайн банкиране.',
                    order: 3,
                    articleId: articles[9].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Facebook Guide
                {
                    title: 'Създаване на Facebook профил',
                    content: 'Стъпка по стъпка ръководство за създаване и настройка на вашия Facebook профил. Как да добавите профилна снимка.',
                    order: 1,
                    articleId: articles[10].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Свързване с приятели и близки',
                    content: 'Как да намерите и добавите приятели във Facebook. Научете за различните видове връзки и настройки за поверителност.',
                    order: 2,
                    articleId: articles[10].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Споделяне на снимки и публикации',
                    content: 'Научете как да споделяте снимки и статуси, как да коментирате и харесвате публикации на други хора.',
                    order: 3,
                    articleId: articles[10].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // YouTube Guide
                {
                    title: 'Започване с YouTube',
                    content: 'Как да намирате и гледате видеа в YouTube. Основни функции на платформата.',
                    order: 1,
                    articleId: articles[11].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Персонализиране на съдържанието',
                    content: 'Как да се абонирате за канали и да създадете списъци с любими видеа. Настройки за препоръчано съдържание.',
                    order: 2,
                    articleId: articles[11].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Полезни канали за възрастни',
                    content: 'Подбрани YouTube канали с полезно и забавно съдържание на български език, подходящо за възрастни хора.',
                    order: 3,
                    articleId: articles[11].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            // Add images for mainImages and sections
            await queryInterface.bulkInsert('images', [
                // First article - single image type
                {
                    src: 'https://images.unsplash.com/photo-1609220136736-443140cffec6',
                    alt: 'Възрастен човек използващ таблет',
                    caption: 'Начално запознанство с дигиталните технологии',
                    mainImageId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Video content (just IDs)
                {
                    src: 'jqvd9Uj7sPE',
                    alt: 'Видео разговор с близки',
                    caption: 'Как да използвате Viber за видео разговори - пълно ръководство на български',
                    mainImageId: articles[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: '8JHLYaU4gR0',
                    alt: 'Игри за памет на таблет',
                    caption: 'Упражнения за трениране на паметта - интерактивни игри за възрастни',
                    mainImageId: articles[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'vK_lEGBqh9c',
                    alt: 'Виртуална разходка в музей',
                    caption: 'Виртуална разходка в Националния исторически музей - как да разглеждате онлайн',
                    mainImageId: articles[7].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'TQJ3vGh3hRw',
                    alt: 'Онлайн банкиране на телефон',
                    caption: 'Как да използвате мобилно банкиране безопасно - стъпка по стъпка',
                    mainImageId: articles[9].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'ORXrKJWdYiY',
                    alt: 'Facebook приложение',
                    caption: 'Facebook за начинаещи - как да създадете и използвате профил',
                    mainImageId: articles[10].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'u1xMDvNwZpg',
                    alt: 'YouTube интерфейс',
                    caption: 'Как да използвате YouTube - търсене, гледане и запазване на видеа',
                    mainImageId: articles[11].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Slider images with complete captions
                {
                    src: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5',
                    alt: 'Смартфон в ръка',
                    caption: 'Модерен смартфон с интуитивен интерфейс за начинаещи потребители',
                    mainImageId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1612696733290-a2a26ec1eed6',
                    alt: 'Таблет на маса',
                    caption: 'Таблет с голям екран - идеален за четене и видео разговори',
                    mainImageId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12',
                    alt: 'Сравнение на устройства',
                    caption: 'Сравнение между размерите и функционалността на различни устройства',
                    mainImageId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Security article images
                {
                    src: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7',
                    alt: 'Защита на пароли',
                    caption: 'Визуализация на сигурна парола и методи за защита на личните данни',
                    mainImageId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
                    alt: 'Онлайн сигурност',
                    caption: 'Основни принципи на киберсигурността за възрастни потребители',
                    mainImageId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Health app images
                {
                    src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118',
                    alt: 'Здравно приложение',
                    caption: 'Мобилно приложение за проследяване на здравословното състояние',
                    mainImageId: articles[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
                    alt: 'Телемедицина',
                    caption: 'Онлайн консултация с лекар чрез видео връзка',
                    mainImageId: articles[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Digital Reading images
                {
                    src: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666',
                    alt: 'Електронен четец',
                    caption: 'Електронен четец с настройваем размер на шрифта за удобно четене',
                    mainImageId: articles[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc',
                    alt: 'Аудиокниги',
                    caption: 'Слушане на аудиокниги през смартфон с удобни слушалки',
                    mainImageId: articles[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Online Shopping images
                {
                    src: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
                    alt: 'Онлайн пазаруване',
                    caption: 'Сигурно онлайн пазаруване от надежден електронен магазин',
                    mainImageId: articles[8].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
                    alt: 'Онлайн плащане',
                    caption: 'Различни методи за безопасно онлайн плащане',
                    mainImageId: articles[8].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },

                // Section images with enhanced captions
                {
                    src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
                    alt: 'Възрастен човек учи технологии',
                    caption: 'Успешно начало в дигиталния свят с помощта на близък човек',
                    sectionId: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1585789575907-1cce3b3d8c0c',
                    alt: 'Сравнение на устройства',
                    caption: 'Практическо сравнение на различни мобилни устройства',
                    sectionId: 4,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
                    alt: 'Защита на данни',
                    caption: 'Визуализация на методите за защита на личната информация онлайн',
                    sectionId: 7,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1591686224641-69b3f4e1e2d1',
                    alt: 'Настройка на видео разговор',
                    caption: 'Правилно позициониране и настройка на камерата за видео разговори',
                    sectionId: 11,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c',
                    alt: 'Здравни приложения',
                    caption: 'Интерфейс на популярно приложение за следене на здравето',
                    sectionId: 14,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
                    alt: 'Игри за памет',
                    caption: 'Забавни и полезни игри за поддържане на паметта активна',
                    sectionId: 17,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
                    alt: 'Електронни книги',
                    caption: 'Богата библиотека от електронни книги на български език',
                    sectionId: 20,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4',
                    alt: 'Виртуален музей',
                    caption: 'Виртуална разходка в известна художествена галерия',
                    sectionId: 23,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1557821552-17105176677c',
                    alt: 'Онлайн магазин',
                    caption: 'Интерфейс на популярен български онлайн магазин',
                    sectionId: 26,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
                    alt: 'Онлайн банкиране интерфейс',
                    caption: 'Основни функции в мобилното банкиране приложение',
                    sectionId: 29,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1522159698025-071104a1ddbd',
                    alt: 'Facebook профил настройки',
                    caption: 'Настройки за поверителност във Facebook профила',
                    sectionId: 32,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    src: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0',
                    alt: 'YouTube интерфейс',
                    caption: 'Начален екран на YouTube с препоръчано съдържание',
                    sectionId: 35,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            // More natural relationships - some articles are connected, others aren't
            await queryInterface.sequelize.query(`
                UPDATE articles
                SET "nextArticleId" = CASE
                    WHEN id = ${articles[0].id} THEN ${articles[1].id}  -- First Steps -> Smartphone/Tablet (natural progression)
                    WHEN id = ${articles[1].id} THEN ${articles[2].id}  -- Smartphone/Tablet -> Internet Safety
                    WHEN id = ${articles[2].id} THEN NULL               -- Internet Safety (end of security basics sequence)
                    WHEN id = ${articles[3].id} THEN ${articles[10].id} -- Video Calls -> Facebook (communication tools sequence)
                    WHEN id = ${articles[4].id} THEN NULL               -- Digital Health (standalone)
                    WHEN id = ${articles[5].id} THEN NULL               -- Memory Games (standalone)
                    WHEN id = ${articles[6].id} THEN ${articles[7].id}  -- Digital Reading -> Virtual Museums (cultural sequence)
                    WHEN id = ${articles[7].id} THEN NULL               -- Virtual Museums (end of cultural sequence)
                    WHEN id = ${articles[8].id} THEN ${articles[9].id}  -- Online Shopping -> Digital Banking (financial sequence)
                    WHEN id = ${articles[9].id} THEN NULL               -- Digital Banking (end of financial sequence)
                    WHEN id = ${articles[10].id} THEN ${articles[11].id} -- Facebook -> YouTube (social media sequence)
                    WHEN id = ${articles[11].id} THEN NULL              -- YouTube (end of social media sequence)
                    ELSE NULL
                END,
                "previousArticleId" = CASE
                    WHEN id = ${articles[0].id} THEN NULL               -- First Steps (start of basics sequence)
                    WHEN id = ${articles[1].id} THEN ${articles[0].id}  -- Smartphone/Tablet
                    WHEN id = ${articles[2].id} THEN ${articles[1].id}  -- Internet Safety
                    WHEN id = ${articles[3].id} THEN NULL               -- Video Calls (start of communication sequence)
                    WHEN id = ${articles[4].id} THEN NULL               -- Digital Health (standalone)
                    WHEN id = ${articles[5].id} THEN NULL               -- Memory Games (standalone)
                    WHEN id = ${articles[6].id} THEN NULL               -- Digital Reading (start of cultural sequence)
                    WHEN id = ${articles[7].id} THEN ${articles[6].id}  -- Virtual Museums
                    WHEN id = ${articles[8].id} THEN NULL               -- Online Shopping (start of financial sequence)
                    WHEN id = ${articles[9].id} THEN ${articles[8].id}  -- Digital Banking
                    WHEN id = ${articles[10].id} THEN ${articles[3].id} -- Facebook
                    WHEN id = ${articles[11].id} THEN ${articles[10].id} -- YouTube
                    ELSE NULL
                END,
                "relatedArticleId" = CASE
                    WHEN id = ${articles[2].id} THEN ${articles[8].id}  -- Internet Safety related to Online Shopping (security)
                    WHEN id = ${articles[8].id} THEN ${articles[9].id}  -- Online Shopping related to Digital Banking
                    WHEN id = ${articles[3].id} THEN ${articles[10].id} -- Video Calls related to Facebook (communication)
                    WHEN id = ${articles[6].id} THEN ${articles[11].id} -- Digital Reading related to YouTube (content consumption)
                    WHEN id = ${articles[4].id} THEN ${articles[5].id}  -- Digital Health related to Memory Games (wellbeing)
                    ELSE NULL
                END
                WHERE id IN (${articles.map((a) => a.id).join(',')})
            `);
        } catch (error) {
            console.error('Seeding error:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('images', null, {});
        await queryInterface.bulkDelete('mainImages', null, {});
        await queryInterface.bulkDelete('sections', null, {});
        await queryInterface.bulkDelete('articles', null, {});
    },
};
