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
                sources: ['https://www.ictc-ctic.ca/wp-content/uploads/2020/07/Seniors_Digital_Literacy.jpeg'],
                alt: 'Възрастна жена използва таблет с усмивка',
                articleId: articles[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'slider',
                sources: [
                    'https://www.aarp.org/content/dam/aarp/home-and-family/personal-technology/2019/05/1140-social-media-phones.jpg',
                    'https://www.ncoa.org/wp-content/uploads/2021/07/older-adults-using-social-media.jpg',
                    'https://www.nia.nih.gov/sites/default/files/2021-03/staying-connected-social-media.jpg',
                ],
                alt: 'Възрастни хора използват социални мрежи',
                articleId: articles[1].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=sdpxddDzXfE'],
                thumbnail: 'https://www.ncsc.gov.uk/images/social-older.jpg',
                alt: 'Видео за онлайн сигурност и защита',
                articleId: articles[2].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://www.seniorcare2share.com/wp-content/uploads/2021/03/How-To-Use-Online-Learning-Platforms-For-Seniors.jpg'],
                alt: 'Възрастни хора участват в онлайн обучение',
                articleId: articles[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=Xa5lZoKlpDs'],
                thumbnail: 'https://i.ytimg.com/vi/Xa5lZoKlpDs/maxresdefault.jpg',
                alt: 'Видео урок за използване на YouTube',
                articleId: articles[4].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://www.healthcareitnews.com/sites/hitn/files/digital-health-senior-care-1200.jpg'],
                alt: 'Възрастен човек използва здравно приложение',
                articleId: articles[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'slider',
                sources: [
                    'https://www.ncoa.org/wp-content/uploads/2021/05/online-shopping-safety.jpg',
                    'https://www.aarp.org/content/dam/aarp/money/scams_fraud/2020/07/1140-safe-online-shopping.jpg',
                    'https://www.ageuk.org.uk/bp-assets/globalassets/images/online-shopping.jpg',
                ],
                alt: 'Безопасно онлайн пазаруване',
                articleId: articles[6].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://www.ncoa.org/wp-content/uploads/2021/03/brain-games-seniors.jpg'],
                alt: 'Възрастни хора играят дигитални игри',
                articleId: articles[7].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=sRyqmzFVLV4'],
                thumbnail: 'https://www.artsandcollections.com/wp-content/uploads/2020/04/Virtual-Museum-Tours.jpg',
                alt: 'Виртуална разходка в музей',
                articleId: articles[8].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://www.bankrate.com/2020/08/28134427/Senior-using-online-banking.jpg'],
                alt: 'Възрастен човек използва онлайн банкиране',
                articleId: articles[9].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=xk_8c7hqh_4'],
                thumbnail: 'https://www.seniorcare.com/wp-content/uploads/2021/05/video-calls-seniors-1.jpg',
                alt: 'Как да провеждате видео разговори',
                articleId: articles[10].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'slider',
                sources: [
                    'https://www.seniorcare.com/wp-content/uploads/2021/06/smartphone-photography-1.jpg',
                    'https://www.seniorcare.com/wp-content/uploads/2021/06/smartphone-photography-2.jpg',
                    'https://www.seniorcare.com/wp-content/uploads/2021/06/smartphone-photography-3.jpg',
                ],
                alt: 'Основи на дигиталната фотография',
                articleId: articles[11].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'video',
                sources: ['https://www.youtube.com/watch?v=LJ9XhyFUX6k'],
                thumbnail: 'https://www.smarthome.com/wp-content/uploads/2021/07/smart-home-seniors.jpg',
                alt: 'Ръководство за умен дом',
                articleId: articles[12].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                type: 'image',
                sources: ['https://www.privacy.org/wp-content/uploads/2021/08/privacy-settings-guide.jpg'],
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
                    articleId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Избор на подходящо устройство',
                    content:
                        'Първата стъпка в дигиталния свят е изборът на подходящо устройство. Таблетите често са предпочитан избор за начинаещи поради техния по-голям екран и интуитивен интерфейс с докосване. Смартфоните са по-компактни и винаги под ръка, но по-малкият им екран може да бъде предизвикателство. Лаптопите предлагат пълна функционалност, но имат по-стръмна крива на обучение...',
                    order: 2,
                    articleId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни умения за навигация',
                    content:
                        'След като имате устройство, следващата стъпка е да усвоите основните жестове и команди за навигация. При устройства с докосване, това включва докосване, плъзгане, щипване за увеличаване и намаляване. За компютри, важно е да се научите да използвате мишка и клавиатура ефективно...',
                    order: 3,
                    articleId: articles[0].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Какви са ползите от социалните мрежи за възрастните хора?',
                    content:
                        'Социалните мрежи предлагат уникални възможности за свързване и общуване, особено за възрастните хора, които може да имат ограничена мобилност или да живеят далеч от семейството си. Изследванията показват, че активното социално взаимодействие може да намали риска от депресия и да подобри когнитивното функциониране при възрастните хора...',
                    order: 1,
                    articleId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Кои платформи са най-подходящи?',
                    content:
                        'Съществуват различни социални платформи, всяка със своит предимства. Facebook е популярен избор с интуитивен интерфейс и функции като групи и събития. WhatsApp и Viber предлагат лесни за използване опции за съобщения и видео разговори. Instagram е идеален за споделяне на снимки с близки...',
                    order: 2,
                    articleId: articles[1].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Разпознаване на фишинг атаки',
                    content:
                        'Фишинг атаките са един от най-честите методи, използвани от измамниците онлайн. Те включват имейли, съобщения или обаждания, претендиращи да са от легитимни организации, с цел да се сдобият с лична информация като пароли или банкови данни...',
                    order: 1,
                    articleId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Създаване на сигурни пароли',
                    content:
                        'Силните пароли са вашата първа линия на защита в дигиталния свят. Научете как да създавате и управлявате сигурни пароли, които са лесни за запомняне, но трудни за отгатване. Използвайте уникални пароли за различните си акаунти и никога не ги споделяйте с други хора...',
                    order: 2,
                    articleId: articles[2].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Безплатни образователни платформи',
                    content:
                        'Съществуват множество безплатни онлайн платформи, които предлагат курсове в различни области - от изкуство и история до технологии и езици. Платформи като Coursera, Khan Academy и EdX предлагат курсове от световни университети, които можете да следвате със собствено темпо...',
                    order: 1,
                    articleId: articles[3].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Какво представлява YouTube?',
                    content:
                        'YouTube е най-голямата платформа за споделяне на видео съдържание в света. Тя предлага милиони видеоклипове на различни теми - от развлекателни до образователни. За възрастните хора, YouTube може да бъде ценен ресурс за учене на нови умения, гледане на документални филми, или просто за забавление...',
                    order: 1,
                    articleId: articles[4].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Мобилни приложения за здравословен начин на живот',
                    content:
                        'Съвременните здравни приложения предлагат разнообразни функции - от проследяване на физическата активност до напомняне за прием на лекарства. Научете как да използвате тези инструменти за подобряване на здравословното си състояние...',
                    order: 1,
                    articleId: articles[5].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни правила за безопасно онлайн пазаруване',
                    content:
                        'Преди да започнете да пазарувате онлайн, важно е да знаете как да разпознавате надеждните търговци и да защитавате финансовата си информация. Научете за сигурните методи на плащане и как да избягвате често срещани измами...',
                    order: 1,
                    articleId: articles[6].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Игри за развиване на паметта и концентрацията',
                    content:
                        'Дигиталните игри могат да бъдат чудесен начин за поддържане на мозъка активен. От класически пъзели до модерни приложения за трениране на паметта, съществуват множество забавни опции за всички възрасти...',
                    order: 1,
                    articleId: articles[7].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Виртуални обиколки на световни музеи',
                    content:
                        'Благодарение на модерните технологии, вече можете да разглеждате най-известните музеи и галерии в света от удобството на вашия дом. Научете как да достъпвате тези виртуални турове и да се наслаждавате на изкуството и културата онлайн...',
                    order: 1,
                    articleId: articles[8].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основи на онлайн банкирането',
                    content:
                        'Онлайн банкирането може значително да улесни управлението на финансите ви. Научете как да проверявате баланса си, да извършвате преводи и да плащате сметки онлайн по сигурен начин...',
                    order: 1,
                    articleId: articles[9].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Избор на приложение за видео разговори',
                    content:
                        'Съществуват множество приложения за видео разговори, всяко със свои предимства. Zoom е популярен избор за групови разговори, докато Skype е отлично решение за разговори между двама души. WhatsApp и Viber също предлагат качествени видео разговори и са лесни за използване...',
                    order: 1,
                    articleId: articles[10].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Подготовка за видео разговор',
                    content:
                        'За успешен видео разговор е важно да имате добра интернет връзка и подходящо осветление. Изберете тихо място с минимален фонов шум. Проверете дали камерата и микрофонът на вашето устройство работят правилно преди започване на разговора...',
                    order: 2,
                    articleId: articles[10].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основни функции на камерата',
                    content:
                        'Съвременните смартфони разполагат с мощни камери и множество функции за заснемане. Научете как да правите качествени снимки, да използвате различните режими на снимане и да редактирате вашите фотографии директно на устройството...',
                    order: 1,
                    articleId: articles[11].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Споделяне и организиране на снимки',
                    content:
                        'След като направите снимки, е важно да знаете как да ги организирате в албуми и да ги споделяте с близките си. Научете за различните опции за съхранение в облака и как да изпращате снимки чрез съобщения или социални мрежи...',
                    order: 2,
                    articleId: articles[11].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Въведение в умния дом',
                    content:
                        'Умният дом включва различни устройства, които могат да се управляват дистанционно и да автоматизират ежедневни задачи. От интелигентни осветителни системи до термостати и системи за сигурност - всички те могат да направят живота ви по-удобен и по-сигурен...',
                    order: 1,
                    articleId: articles[12].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Избор на умни устройства',
                    content:
                        'При избора на умни устройства е важно да се съобразите с вашите нужди и възможности. Започнете с прости устройства като умни крушки или контакти, и постепенно добавяйте по-сложни системи като термостати или системи за сигурност...',
                    order: 2,
                    articleId: articles[12].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Основи на онлайн поверителността',
                    content:
                        'Разберете защо е важно да контролирате своята онлайн поверителност и какви са основните настройки, които трябва да познавате. Научете за различните нива на поверителност и как те влияят на вашата онлайн безопасност...',
                    order: 1,
                    articleId: articles[13].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    title: 'Настройки за поверителност в социалните мрежи',
                    content:
                        'Всяка социална мрежа има свои специфични настройки за поверителност. Научете как да контролирате кой вижда вашите публикации, как да управлявате заявките за приятелство и как да защитите личната си информация в различните платформи...',
                    order: 2,
                    articleId: articles[13].id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {
                returning: ['id', 'articleId'],
            }
        );

        await queryInterface.bulkInsert('sectionImages', [
            {
                src: 'https://www.ageuk.org.uk/bp-assets/globalassets/images/digital-inclusion.jpg',
                alt: 'Възрастни хора учат дигитални умения',
                caption: 'Дигиталната грамотност отваря нови възможности за възрастните хора',
                sectionId: sections[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.seniorcare2share.com/wp-content/uploads/2021/03/How-To-Choose-A-Tablet-For-Seniors.jpg',
                alt: 'Различни видове таблети и смартфони',
                caption: 'Изборът на подходящо устройство е важен първи етап',
                sectionId: sections[1].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.ncoa.org/wp-content/uploads/2021/07/social-media-benefits-seniors.jpg',
                alt: 'Възрастни хора използват социални медии',
                caption: 'Социалните мрежи помагат за поддържане на активни връзки',
                sectionId: sections[3].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.ncsc.gov.uk/images/phishing-example.jpg',
                alt: 'Пример за фишинг имейл',
                caption: 'Научете как да разпознавате подозрителни имейли',
                sectionId: sections[5].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.ncoa.org/wp-content/uploads/2021/03/online-learning-platforms.jpg',
                alt: 'Онлайн образователни платформи',
                caption: 'Множество платформи предлагат безплатно обучение',
                sectionId: sections[7].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.ageuk.org.uk/bp-assets/globalassets/images/youtube-guide.jpg',
                alt: 'YouTube интерфейс',
                caption: 'YouTube предлага богато разнообразие от образователно съдържание',
                sectionId: sections[8].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.healthcareitnews.com/sites/hitn/files/health-apps-seniors.jpg',
                alt: 'Здравни приложения на смартфон',
                caption: 'Модерните приложения помагат за по-добро здравословно състояние',
                sectionId: sections[9].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.ncoa.org/wp-content/uploads/2021/05/safe-online-shopping.jpg',
                alt: 'Безопасно онлайн пазаруване',
                caption: 'Научете как да пазарувате онлайн безопасно',
                sectionId: sections[10].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.ncoa.org/wp-content/uploads/2021/03/digital-games-seniors.jpg',
                alt: 'Дигитални игри за възрастни',
                caption: 'Игрите поддържат ума активен и подобряват концентрацията',
                sectionId: sections[11].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.artsandcollections.com/wp-content/uploads/2020/04/virtual-museum-tour.jpg',
                alt: 'Виртуална разходка в музей',
                caption: 'Разгледайте световни музеи от вкъщи',
                sectionId: sections[12].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.bankrate.com/2020/08/28134427/online-banking-guide.jpg',
                alt: 'Онлайн банкиране интерфейс',
                caption: 'Управлявайте финансите си лесно и сигурно онлайн',
                sectionId: sections[13].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.seniortech.com/wp-content/uploads/2021/05/video-call-apps-comparison.jpg',
                alt: 'Сравнение на приложения за видео разговори',
                caption: 'Популярни приложения за видео разговори и техните предимства',
                sectionId: sections[14].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.seniortech.com/wp-content/uploads/2021/05/video-call-setup.jpg',
                alt: 'Подготовка за видео разговор',
                caption: 'Правилна настройка за качествен видео разговор',
                sectionId: sections[15].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.photoguide.com/wp-content/uploads/2021/06/smartphone-camera-basics.jpg',
                alt: 'Основни функции на камерата',
                caption: 'Запознайте се с основните функции на вашата камера',
                sectionId: sections[16].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.photoguide.com/wp-content/uploads/2021/06/photo-sharing-guide.jpg',
                alt: 'Споделяне на снимки',
                caption: 'Различни начини за споделяне на вашите снимки',
                sectionId: sections[17].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.smarthome.com/wp-content/uploads/2021/07/smart-home-basics.jpg',
                alt: 'Основи на умния дом',
                caption: 'Въведение в технологиите за умен дом',
                sectionId: sections[18].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.smarthome.com/wp-content/uploads/2021/07/smart-devices-selection.jpg',
                alt: 'Избор на умни устройства',
                caption: 'Как да изберете подходящите умни устройства',
                sectionId: sections[19].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.privacyguide.com/wp-content/uploads/2021/08/online-privacy-basics.jpg',
                alt: 'Основи на онлайн поверителността',
                caption: 'Разберете основите на онлайн поверителността',
                sectionId: sections[20].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                src: 'https://www.privacyguide.com/wp-content/uploads/2021/08/social-media-privacy.jpg',
                alt: 'Настройки за поверителност в социални мрежи',
                caption: 'Управление на поверителността в социалните мрежи',
                sectionId: sections[21].id,
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
            WHERE id IN (${articles.map((a) => a.id).join(',')})
        `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('sectionImages', null, {});
        await queryInterface.bulkDelete('sections', null, {});
        await queryInterface.bulkDelete('mainImages', null, {});
        await queryInterface.bulkDelete('articles', null, {});
    },
};
