// data/mockClubsData.js
export const mockClubsData = [
    {
        // 🏛️ КЛУБ 1: София - голям активен клуб
        id: "club-1",
        slug: "klub-zlatna-esenta-sofia",
        name: "Клуб на пенсионера 'Златна есента'",
        shortDescription: "Най-активният клуб за пенсионери в кв. Лозенец с богата културна програма",
        fullDescription: "Клуб 'Златна есента' е основан през 2010 г. и обединява над 60 активни пенсионери от кв. Лозенец. Нашата мисия е да създадем топла и приветлива среда за социализация, творчество и активно прекарване на времето. Предлагаме разнообразни дейности - от хор и народни танци до компютърни курсове и здравни лекции.",
        foundedYear: 2010,
        status: "active", // ОПЦИИ: "active"/"inactive"/"suspended"
        logo: "https://picsum.photos/200/200?random=1",
        mainImage: "https://picsum.photos/800/400?random=11",
        gallery: [
            "https://picsum.photos/600/400?random=21",
            "https://picsum.photos/600/400?random=22",
            "https://picsum.photos/600/400?random=23",
            "https://picsum.photos/600/400?random=24"
        ],
        category: "cultural", // ОПЦИИ: "cultural"/"sports"/"social"/"educational"/"general"

        location: {
            address: "ул. Витоша 127, ет. 2",
            city: "София",
            municipality: "Столична",
            region: "София-град",
            postalCode: "1463",
            coordinates: { lat: 42.6777, lng: 23.3219 },
            venue: {
                type: "municipal", // ОПЦИИ: "municipal"/"rented"/"owned"/"sports_complex"/"private"
                size: "180 кв.м",
                capacity: 80,
                facilities: ["голяма зала", "кухня", "библиотека", "сцена", "пиано"],
                accessibility: true
            }
        },

        membership: {
            totalMembers: 67,
            ageGroups: {
                "60-70": 25,
                "70-80": 32,
                "80+": 10
            },
            membershipFee: {
                monthly: 15,
                yearly: 150,
                currency: "BGN" // ОПЦИИ: "BGN"/"EUR"/"USD"
            },
            requirements: [
                "навършени 60 години",
                "живеещ в София или околностите",
                "желание за активно участие"
            ],
            benefits: [
                "участие във всички събития",
                "безплатни екскурзии",
                "здравни консултации",
                "компютърни курсове",
                "празнични вечери"
            ]
        },
        members: [
            {
                id: "member-1-1",
                firstName: "Анка",
                lastName: "Димитрова",
                phone: "0888567123",
                email: "anka.dimitrova@gmail.com",
                address: "ул. Витоша 45, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1001",
                    alt: "Снимка на Анка Димитрова"
                },
                joinDate: "2020-03-15",
                isActive: true,
                role: "председател"
            },
            {
                id: "member-1-2",
                firstName: "Васил",
                lastName: "Георгиев",
                phone: "0877234567",
                email: "vasil.georgiev@abv.bg",
                address: "ул. Раковски 12, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1002",
                    alt: "Снимка на Васил Георгиев"
                },
                joinDate: "2019-07-22",
                isActive: true,
                role: "секретар"
            },
            {
                id: "member-1-3",
                firstName: "Мария",
                lastName: "Петкова",
                phone: "0899345678",
                email: "maria.petkova@yahoo.com",
                address: "бул. Стамболийски 78, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1003",
                    alt: "Снимка на Мария Петкова"
                },
                joinDate: "2018-11-10",
                isActive: true,
                role: "касиер"
            },
            {
                id: "member-1-4",
                firstName: "Иван",
                lastName: "Стоянов",
                phone: "0888111222",
                email: "ivan.stoyanov@dir.bg",
                address: "ул. Граф Игнатиев 25, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1004",
                    alt: "Снимка на Иван Стоянов"
                },
                joinDate: "2021-01-18",
                isActive: true,
                role: "заместник-председател"
            },
            {
                id: "member-1-5",
                firstName: "Елка",
                lastName: "Николова",
                phone: "0877333444",
                email: "elka.nikolova@gmail.com",
                address: "ул. Шипка 33, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1005",
                    alt: "Снимка на Елка Николова"
                },
                joinDate: "2020-09-05",
                isActive: true,
                role: "културен деец"
            },
            {
                id: "member-1-6",
                firstName: "Петър",
                lastName: "Василев",
                phone: "0889777888",
                email: "petko.vasilev@mail.bg",
                address: "ул. Цар Борис III 67, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1006",
                    alt: "Снимка на Петър Василев"
                },
                joinDate: "2019-05-20",
                isActive: true,
                role: "член"
            },
            {
                id: "member-1-7",
                firstName: "Надежда",
                lastName: "Кирова",
                phone: "0878456789",
                email: "nadezhda.kirova@abv.bg",
                address: "ул. Македония 89, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1007",
                    alt: "Снимка на Надежда Кирова"
                },
                joinDate: "2021-06-12",
                isActive: true,
                role: "член"
            },
            {
                id: "member-1-8",
                firstName: "Стефан",
                lastName: "Младенов",
                phone: "0887654321",
                email: "stefan.mladenov@gmail.com",
                address: "бул. Витоша 234, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1008",
                    alt: "Снимка на Стефан Младенов"
                },
                joinDate: "2020-12-03",
                isActive: true,
                role: "член"
            },
            {
                id: "member-1-9",
                firstName: "Роза",
                lastName: "Божинова",
                phone: "0899123456",
                email: "roza.bozhinova@dir.bg",
                address: "ул. Дунав 45, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1009",
                    alt: "Снимка на Роза Божинова"
                },
                joinDate: "2022-02-14",
                isActive: true,
                role: "член"
            },
            {
                id: "member-1-10",
                firstName: "Тодор",
                lastName: "Христов",
                phone: "0876987654",
                email: "todor.hristov@yahoo.com",
                address: "ул. Гурко 78, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1010",
                    alt: "Снимка на Тодор Христов"
                },
                joinDate: "2021-08-25",
                isActive: true,
                role: "член"
            },
            {
                id: "member-1-11",
                firstName: "Венета",
                lastName: "Ангелова",
                phone: "0888345678",
                email: "veneta.angelova@gmail.com",
                address: "ул. Искър 123, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1011",
                    alt: "Снимка на Венета Ангелова"
                },
                joinDate: "2023-01-10",
                isActive: true,
                role: "член"
            },
            {
                id: "member-1-12",
                firstName: "Димитър",
                lastName: "Костов",
                phone: "0877555666",
                email: "dimitar.kostov@abv.bg",
                address: "бул. Сливница 234, София",
                photo: {
                    src: "https://picsum.photos/150/150?random=1012",
                    alt: "Снимка на Димитър Костов"
                },
                joinDate: "2019-10-30",
                isActive: true,
                role: "член"
            }
        ],
        media: {
            videos: [
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    alt: "Въвеждащо видео на клуба",
                    caption: "Кратко представяне на нашите дейности",
                    type: "intro", // ОПЦИИ: "intro"/"event"/"cultural"/"social"/"fitness"/"aqua_fitness"/"yoga"/"charity"
                    duration: "2:30",
                    thumbnail: "https://picsum.photos/400/225?random=101"
                },
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    alt: "Коледен концерт 2023",
                    caption: "Записи от коледния ни концерт",
                    type: "event",
                    duration: "15:45",
                    thumbnail: "https://picsum.photos/400/225?random=102"
                }
            ],
            virtualTour: "https://example.com/virtual-tour-zlatna-esenta",
            audioFiles: [
                {
                    src: "https://example.com/audio/hor-sample.mp3",
                    alt: "Примерна песен от хора",
                    caption: "Родопски звуци - Излел е Дельо хайдутин",
                    duration: "3:45"
                }
            ]
        },

        stats: {
            totalMembers: 67,
            programs: 15,
            events: 28,
            performances: 12,
            yearsActive: 14
        },
        management: {
            board: [
                {
                    name: "Анка Димитрова",
                    role: "председател", // ОПЦИИ: "председател"/"заместник-председател"/"секретар"/"касиер"/"културен деец"/"треньор-координатор"/"инструктор йога"/"координатор проекти"/"член"
                    phone: "0888567123",
                    email: "anka.dimitrova@zlatnaesenta.bg",
                    address: "ул. Витоша 45, София",
                    avatar: "https://picsum.photos/100/100?random=101",
                    bio: "Пенсионирана учителка по история с 35-годишен стаж. Председател на клуба от 2022 г."
                },
                {
                    name: "Васил Георгиев",
                    role: "секретар",
                    phone: "0877234567",
                    email: "secretary@zlatnaesenta.bg",
                    address: "ул. Раковски 12, София",
                    avatar: "https://picsum.photos/100/100?random=102",
                    bio: "Бивш счетоводител, отговаря за документооборота и комуникацията"
                },
                {
                    name: "Мария Петкова",
                    role: "касиер",
                    phone: "0899345678",
                    email: "treasurer@zlatnaesenta.bg",
                    address: "бул. Стамболийски 78, София",
                    avatar: "https://picsum.photos/100/100?random=103",
                    bio: "Пенсионирана банкерка, управлява финансите на клуба"
                },
                {
                    name: "Иван Стоянов",
                    role: "заместник-председател",
                    phone: "0888111222",
                    email: "ivan.stoyanov@zlatnaesenta.bg",
                    address: "ул. Граф Игнатиев 25, София",
                    avatar: "https://picsum.photos/100/100?random=104",
                    bio: "Пенсиониран инженер, замества председателя при нужда"
                },
                {
                    name: "Елка Николова",
                    role: "културен деец",
                    phone: "0877333444",
                    email: "elka.nikolova@zlatnaesenta.bg",
                    address: "ул. Шипка 33, София",
                    avatar: "https://picsum.photos/100/100?random=105",
                    bio: "Организира културните събития и празници на клуба"
                },
                {
                    name: "Георги Петров",
                    role: "член",
                    phone: "0899555666",
                    email: "georgi.petrov@zlatnaesenta.bg",
                    address: "ул. Оборище 15, София",
                    avatar: "https://picsum.photos/100/100?random=106",
                    bio: "Активен член, помага при организацията на екскурзии"
                }
            ]
        },

        activities: {
            regular: [
                {
                    name: "Хор 'Родопски звуци'",
                    day: "понеделник", // ОПЦИИ: "понеделник"/"вторник"/"сряда"/"четвъртък"/"петък"/"събота"/"неделя"/"всеки ден"/"понеделник, сряда, петък"
                    time: "16:00-18:00",
                    instructor: "Мария Димитрова",
                    participants: 24,
                    description: "Традиционни български песни и класическа музика"
                },
                {
                    name: "Народни танци",
                    day: "сряда",
                    time: "17:00-19:00",
                    instructor: "Георги Стойков",
                    participants: 18,
                    description: "Български народни танци за начинаещи и напреднали"
                },
                {
                    name: "Компютърни курсове",
                    day: "петък",
                    time: "14:00-16:00",
                    instructor: "Студенти доброволци",
                    participants: 12,
                    description: "Основи на работа с компютър, интернет и социални мрежи"
                },
                {
                    name: "Здравни лекции",
                    day: "вторник",
                    time: "15:00-16:00",
                    instructor: "Д-р Петя Маринова",
                    participants: 35,
                    description: "Месечни лекции за здравословен начин на живот"
                }
            ],
            events: [
                {
                    id: "event-1",
                    title: "Коледен концерт 2024",
                    date: "2024-12-20",
                    time: "18:00",
                    type: "cultural",
                    participants: 120,
                    description: "Традиционен коледен концерт с участието на хора и танцова група",
                    location: "Основна зала на клуба",
                    organizer: "Елка Николова",
                    highlights: ["Хор 'Родопски звуци'", "Танцова група", "Коледни песни", "Топли напитки", "Подаръци за деца"],
                    featured: true,
                    price: "безплатно",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=301",
                            alt: "Коледен концерт - основна сцена",
                            caption: "Хор 'Родопски звуци' изпълнява коледни песни",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=302",
                            alt: "Танцова група",
                            caption: "Танцовата група в традиционни носии"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=303",
                            alt: "Публика",
                            caption: "Засмени лица в публиката"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=304",
                            alt: "Коледно дърво",
                            caption: "Красиво украсена зала с коледни декорации"
                        }
                    ],
                    videos: [
                        {
                            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                            alt: "Коледен концерт 2024 - запис",
                            caption: "Пълен запис от коледния концерт",
                            duration: "45:30",
                            thumbnail: "https://picsum.photos/400/225?random=351"
                        }
                    ]
                },
                {
                    id: "event-2",
                    title: "Великденски базар",
                    date: "2024-04-28",
                    time: "10:00",
                    type: "traditional",
                    participants: 80,
                    description: "Базар с домашно приготвени лакомства и занаятчийски изделия",
                    location: "Клубна зала и тераса",
                    organizer: "Мария Петкова",
                    highlights: ["Домашни лакомства", "Занаятчийски изделия", "Великденски украси", "Детски кътче"],
                    featured: false,
                    price: "безплатен вход",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=305",
                            alt: "Великденски базар",
                            caption: "Щандове с домашни лакомства",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=306",
                            alt: "Боядисани яйца",
                            caption: "Красиво боядисани великденски яйца"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=307",
                            alt: "Детски кътче",
                            caption: "Деца се забавляват с великденски игри"
                        }
                    ]
                }
            ],
            trips: [
                {
                    destination: "Копривщица",
                    date: "2024-09-15",
                    participants: 35,
                    price: 45,
                    description: "Еднодневна екскурзия до Копривщица с обяд"
                },
                {
                    destination: "Мелник и Роженски манастир",
                    date: "2024-10-12",
                    participants: 28,
                    price: 55,
                    description: "Екскурзия с дегустация на вино"
                }
            ],
            courses: [
                {
                    name: "Основи на дигиталните технологии",
                    duration: "8 седмици", // ОПЦИИ: "X седмици"/"X месеца"/"X часа"
                    participants: 15,
                    instructor: "Млади доброволци",
                    description: "Как да използваме смартфон, имейл и онлайн услуги"
                }
            ]
        },

        contacts: {
            phone: "02/856-4321",
            mobile: "0888567123",
            email: "info@zlatnaesenta.bg",
            website: "www.zlatnaesenta-sofia.bg",
            socialMedia: {
                facebook: "facebook.com/zlatnaesenta.sofia", // опционално
                instagram: null, // опционално
                youtube: null // опционално
            },
            workingHours: {
                monday: "09:00-17:00", // ОПЦИИ: "ЧЧ:ММ-ЧЧ:ММ"/"closed"
                tuesday: "09:00-17:00",
                wednesday: "09:00-17:00",
                thursday: "09:00-17:00",
                friday: "09:00-17:00",
                saturday: "10:00-15:00",
                sunday: "closed"
            }
        },

        finances: {
            budget: {
                yearly: 12000,
                currency: "BGN"
            },
            funding: [
                {
                    source: "Столичната община",
                    amount: 5000,
                    type: "subsidy" // ОПЦИИ: "subsidy"/"membership"/"donations"/"events"/"sponsorship"
                },
                {
                    source: "Членски внос",
                    amount: 6000,
                    type: "membership"
                },
                {
                    source: "Дарения",
                    amount: 1000,
                    type: "donations"
                }
            ],
            sponsors: [
                {
                    name: "Аптека 'Здраве'",
                    contribution: "безплатни здравни консултации",
                    type: "services",
                    contact: "02/123-456",
                    address: "ул. Витоша 132, София",
                    website: "www.apteka-zdrave.bg",
                    workingHours: "Пн-Нд: 8:00-22:00",
                    discount: null,
                    description: "Безплатни консултации и измерване на кръвно налягане за членове на клуба"
                },
                {
                    name: "Пекарна 'Дунав'",
                    contribution: "отстъпки за събития",
                    type: "discounts",
                    contact: "02/987-321",
                    address: "ул. Граф Игнатиев 15, София",
                    website: null,
                    workingHours: "Пн-Сб: 6:00-20:00",
                    discount: "15%",
                    description: "Отстъпки за хляб и сладкиши при организиране на събития"
                }
            ],
        },

        metadata: {
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-12-15T14:30:00Z",
            createdBy: "admin-sofia-1",
            isVerified: true,
            isPublic: true,
            tags: ["хор", "танци", "екскурзии", "компютърни курсове", "здраве"],
            rating: 4.8,
            views: 2150,
            followers: 45
        },

        regionalInfo: {
            isCentralClub: true,          // true/false - дали е централен клуб за района
            centralClubId: null,          // null ако е централен, иначе ID на централния клуб
            affiliatedClubs: ["club-2", "club-3"], // масив с ID-та на свързани клубове
            coverageArea: "кв. Лозенец и околностите", // текст описание на зоната
            regionalRole: "central"       // ОПЦИИ: "local"/"central"/"branch"
        },

        achievements: {
            awards: [                     // масив с награди
                {
                    name: "Най-активен клуб на годината",
                    year: 2023,
                    awardedBy: "Столична община",
                    description: "За изключителна дейност и принос към общността"
                },
                {
                    name: "Приз за културна дейност",
                    year: 2022,
                    awardedBy: "Министерство на културата",
                    description: "За запазване на българската културна традиция"
                }
            ],
            certificates: [               // сертификати и удостоверения
                {
                    name: "Регистрация НПО",
                    issueDate: "2010-03-15",
                    validUntil: "2025-03-15",
                    issuedBy: "Софийски градски съд"
                }
            ],
            recognitions: [               // признания и отличия - масив от strings
                "Благодарствено писмо от кмета на София (2023)",
                "Почетен плакет от БЧК (2022)",
                "Грамота за обществена дейност (2021)"
            ]
        },

        socialImpact: {
            volunteering: [               // доброволческа дейност
                {
                    project: "Помощ за самотни пенсионери",
                    participants: 15,
                    hoursPerMonth: 40, // опционално
                    coordinator: "Анка Димитрова", // опционално
                    description: null, // опционално
                    frequency: null, // опционално
                    duration: null // опционално
                },
                {
                    project: "Почистване на парк Лозенец",
                    participants: 25,
                    frequency: "месечно",
                    duration: "3 години"
                }
            ],
            communityProjects: [          // проекти за общността
                {
                    name: "Междупоколенческа програма",
                    description: "Свързване на пенсионери с ученици",
                    beneficiaries: 50, // опционално
                    status: "активен", // ОПЦИИ: "активен"/"завършен"/"планиран"/"спрян"/"сезонен"
                    budget: null // опционално
                }
            ],
            partnerships: [               // партньорства
                {
                    partner: "ОУ 'Христо Ботев'",
                    type: "образователно", // ОПЦИИ: "социално"/"образователно"/"здравно"/"културно"/"спортно"/"благотворително"
                    description: "Съвместни културни мероприятия"
                },
                {
                    partner: "Университет за трети възраст",
                    type: "образователно",
                    description: "Лекции и семинари"
                }
            ]
        },

        pensionersSpecific: {
            healthServices: {
                regularCheckups: true,      // true/false - редовни здравни прегледи
                bloodPressureMonitoring: true, // true/false - измерване на кръвно
                healthLectures: [
                    {
                        topic: "Диабет във възрастта",
                        lecturer: "Д-р Петя Маринова",
                        frequency: "месечно",     // ОПЦИИ: "дневно"/"седмично"/"двуседмично"/"месечно"/"тримесечно"/"годишно"/"24/7"
                        nextDate: "2025-01-15",
                        duration: "1 час"
                    },
                    {
                        topic: "Здравословно хранене",
                        lecturer: "Диетолог Мария Иванова",
                        frequency: "тримесечно",
                        nextDate: "2025-02-20",
                        duration: "1.5 часа"
                    }
                ],
                medicalPartners: [          // медицински партньори
                    {
                        name: "Аптека 'Здраве'",
                        service: "безплатни консултации и измерване на кръвно",
                        contact: "02/123-456",
                        address: "ул. Витоша 130", // опционално
                        workingHours: "Пн-Пт: 8:00-20:00", // опционално
                        discount: null // опционално - процент или сума
                    },
                    {
                        name: "Поликлиника 'Лозенец'",
                        service: "отстъпки за прегледи",
                        contact: "02/987-654",
                        discount: "20%"
                    }
                ],
                emergencyProtocol: {
                    hasEmergencyPlan: true,   // true/false - има ли спешен план
                    emergencyContacts: [      // спешни контакти - масив от strings
                        "150", // Спешна помощ
                        "0888567123" // Председател на клуба
                    ],
                    nearestHospital: "УМБАЛ 'Александровска'",
                    specialNeeds: [           // специални нужди - масив от strings
                        "дефибрилатор в сградата",
                        "обучен персонал за първа помощ"
                    ]
                }
            },

            supportServices: {
                // ВСИЧКИ ОПЦИИ СА true/false
                homeVisits: true,           // домашни посещения
                shoppingAssistance: false, // помощ при пазаруване  
                documentHelp: true,         // помощ с документи
                companionship: true,        // придружаване
                transportService: false,    // транспорт до клуба
                mealDelivery: false,       // доставка на храна
                cleaningHelp: false,       // помощ за почистване
                techSupport: true          // техническа помощ (компютри и др.)
            },

            accessibility: {
                // ВСИЧКИ ОПЦИИ СА true/false
                wheelchairAccess: true,     // достъп с инвалидна количка
                elevatorAccess: true,       // достъп до етаж с асансьор
                hearingLoop: false,         // слухово оборудване
                largeTextMaterials: true,   // материали с едър шрифт
                handrails: true,            // парапети и опори
                nonSlipFloors: true,        // нехлъзгащи подове
                goodLighting: true,         // добро осветление
                restingAreas: true         // места за почивка
            },

            specialPrograms: {
                memoryActivities: [         // дейности за памет и ум
                    {
                        name: "Тренировка на паметта",
                        frequency: "седмично",   // ОПЦИИ: "дневно"/"седмично"/"месечно"/"два пъти седмично"/"три пъти седмично"
                        description: "Упражнения за запазване на остротата на ума",
                        instructor: "Психолог Анна Стоянова", // опционално
                        participants: 20 // опционално
                    },
                    {
                        name: "Интелектуални игри",
                        frequency: "три пъти седмично",
                        description: "Шах, скрабъл, кръстословици",
                        participants: 15
                    }
                ],
                intergenerationalPrograms: [ // програми с млади хора
                    {
                        name: "Внуци учители",
                        description: "Младежи помагат с компютри и технологии",
                        frequency: "седмично",
                        participants: 25, // опционално
                        ageRange: "16-25 години", // опционално
                        coordinator: "Елка Николова", // опционално
                        venue: null // опционално - къде се провежда
                    },
                    {
                        name: "Споделени истории",
                        description: "Пенсионери разказват на деца за миналото",
                        frequency: "месечно",
                        venue: "ОУ Христо Ботев"
                    }
                ],
                volunteerPrograms: [        // доброволчески програми
                    {
                        name: "Помощ в дома",
                        volunteers: 8, // опционално - брой доброволци
                        coordinator: "Мария Петкова", // опционално
                        description: "Доброволци помагат на самотни пенсионери",
                        hoursPerWeek: 20, // опционално
                        training: null // опционално - обучение
                    },
                    {
                        name: "Придружаване до лекар",
                        volunteers: 5,
                        description: "Помощ при посещения в болница"
                    }
                ],
                mentalHealthSupport: [      // психологическа подкрепа
                    {
                        type: "групова терапия",     // ОПЦИИ: "индивидуална"/"групова"/"семейна"/"кризисна интервенция"/"подкрепителни групи"/"спортна психология"
                        frequency: "седмично",
                        therapist: "Психолог Анна Стоянова", // опционално
                        participants: 12, // опционално
                        focus: "справяне с депресия и тревожност", // опционално
                        availability: null, // опционално - за кризисни услуги "24/7"
                        contact: null // опционално - за кризисни контакти
                    },
                    {
                        type: "подкрепителни групи",
                        frequency: "два пъти месечно",
                        focus: "загуба на близки, самота"
                    }
                ]
            },

            ageSpecificNeeds: {
                lowImpactActivities: [      // дейности с ниско натоварване
                    {
                        name: "Лека йога",
                        intensity: "ниска",     // ОПЦИИ: "ниска"/"средна"/"висока"/"ниска до средна"
                        suitableFor: ["проблеми със ставите", "сърдечни заболявания"], // опционално - масив
                        duration: null // опционално
                    },
                    {
                        name: "Разходки в парка",
                        intensity: "ниска",
                        duration: "30-45 минути"
                    }
                ],
                cognitiveStimulation: [     // когнитивна стимулация - масив от strings
                    "четене и дискусии",
                    "пъзели и кръстословици",
                    "изучаване на нови умения",
                    "творчески дейности"
                ],
                socialIsolationPrevention: [ // превенция на изолацията - масив от strings
                    "ежедневни срещи в клуба",
                    "телефонни обаждания до самотни членове",
                    "домашни посещения",
                    "общи празненства"
                ],
                nutritionSupport: [         // хранителна подкрепа
                    {
                        service: "съвети за здравословно хранене",
                        provider: "диетолог", // опционално
                        frequency: "месечно", // опционално
                        price: null, // опционално
                        coverage: null, // опционално - кого покрива
                        volunteers: null // опционално - брой доброволци
                    },
                    {
                        service: "общи обяди",
                        frequency: "два пъти седмично",
                        price: "5 лв."
                    }
                ],
                medicationReminders: true,  // true/false - напомняния за лекарства
                fallPrevention: [           // превенция на падания - масив от strings
                    "упражнения за баланс",
                    "проверка на зрението",
                    "безопасна среда в клуба",
                    "обучение за използване на помощни средства"
                ]
            }
        },

        template: "cultural",           // ОПЦИИ: "cultural"/"sports"/"traditional"/"social"/"educational"/"active"

        preferences: {
            showFinances: false,          // true/false - показвай ли финансите публично
            showMembersList: false,       // true/false - показвай ли списък с членове
            allowOnlineRegistration: true, // true/false - онлайн записване
            showContactForm: true,        // true/false - форма за контакт
            enableCalendar: true,         // true/false - календар с събития
            showTestimonials: true,       // true/false - отзиви от членове
            publicGallery: true,          // true/false - публична галерия
            showStatistics: true,         // true/false - показвай статистики
            allowComments: false,         // true/false - коментари върху събития
            showNewsSection: true         // true/false - новини и обявления
        }
    },

    {
        // 🏛️ КЛУБ 2: Пловдив - среден клуб
        id: "club-2",
        slug: "klub-sarnena-mladost-plovdiv",
        name: "Клуб 'Сърнена младост'",
        shortDescription: "Уютен клуб в сърцето на Пловдив с фокус върху традициите и приятелството",
        fullDescription: "Клуб 'Сърнена младост' е дом на 35 сърчани пенсионери от центъра на Пловдив. Основан през 2015 г., клубът се отличава с топлата семейна атмосфера и силните приятелства. Специализираме се в запазване на българските традиции, домашно готвене и взаимопомощ между членовете.",
        foundedYear: 2015,
        status: "active",
        logo: "https://picsum.photos/200/200?random=2",
        mainImage: "https://picsum.photos/800/400?random=12",
        gallery: [
            "https://picsum.photos/600/400?random=25",
            "https://picsum.photos/600/400?random=26",
            "https://picsum.photos/600/400?random=27"
        ],
        category: "general",

        location: {
            address: "ул. Княз Александър I №42",
            city: "Пловдив",
            municipality: "Пловдив",
            region: "Пловдив",
            postalCode: "4000",
            coordinates: { lat: 42.1354, lng: 24.7453 },
            venue: {
                type: "rented",
                size: "85 кв.м",
                capacity: 40,
                facilities: ["основна зала", "мини кухня", "тераса"],
                accessibility: false
            }
        },

        membership: {
            totalMembers: 35,
            ageGroups: {
                "60-70": 12,
                "70-80": 18,
                "80+": 5
            },
            membershipFee: {
                monthly: 10,
                yearly: 100,
                currency: "BGN"
            },
            requirements: [
                "навършени 60 години",
                "живеещ в Пловдив"
            ],
            benefits: [
                "участие в събития",
                "групови екскурзии",
                "празненства",
                "взаимопомощ"
            ]
        },
        members: [
            {
                id: "member-2-1",
                firstName: "Стоян",
                lastName: "Иванов",
                phone: "0876432111",
                email: "stoyan.ivanov@sarnena.bg",
                address: "ул. Цар Борис III №23, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2001",
                    alt: "Снимка на Стоян Иванов"
                },
                joinDate: "2015-06-15",
                isActive: true,
                role: "председател"
            },
            {
                id: "member-2-2",
                firstName: "Невена",
                lastName: "Георгиева",
                phone: "0887123456",
                email: "nevena@sarnena.bg",
                address: "ул. Гладстон №15, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2002",
                    alt: "Снимка на Невена Георгиева"
                },
                joinDate: "2016-02-20",
                isActive: true,
                role: "секретар"
            },
            {
                id: "member-2-3",
                firstName: "Димитър",
                lastName: "Петков",
                phone: "0899876543",
                email: "dimitar@sarnena.bg",
                address: "бул. Марица №67, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2003",
                    alt: "Снимка на Димитър Петков"
                },
                joinDate: "2015-09-10",
                isActive: true,
                role: "касиер"
            },
            {
                id: "member-2-4",
                firstName: "Величка",
                lastName: "Димитрова",
                phone: "0878654321",
                email: "velichka.dimitrova@abv.bg",
                address: "ул. Дунав 34, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2004",
                    alt: "Снимка на Величка Димитрова"
                },
                joinDate: "2017-03-25",
                isActive: true,
                role: "член"
            },
            {
                id: "member-2-5",
                firstName: "Мария",
                lastName: "Стоянова",
                phone: "0889234567",
                email: "maria.stoyanova@dir.bg",
                address: "ул. Шипка 89, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2005",
                    alt: "Снимка на Мария Стоянова"
                },
                joinDate: "2018-07-12",
                isActive: true,
                role: "член"
            },
            {
                id: "member-2-6",
                firstName: "Петър",
                lastName: "Николов",
                phone: "0876789123",
                email: "petar.nikolov@gmail.com",
                address: "ул. Васил Левски 56, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2006",
                    alt: "Снимка на Петър Николов"
                },
                joinDate: "2019-01-18",
                isActive: true,
                role: "член"
            },
            {
                id: "member-2-7",
                firstName: "Красимира",
                lastName: "Йорданова",
                phone: "0888567890",
                email: "krasimira.yordanova@yahoo.com",
                address: "бул. България 123, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2007",
                    alt: "Снимка на Красимира Йорданова"
                },
                joinDate: "2020-05-22",
                isActive: true,
                role: "член"
            },
            {
                id: "member-2-8",
                firstName: "Иван",
                lastName: "Христов",
                phone: "0877456789",
                email: "ivan.hristov@mail.bg",
                address: "ул. Хан Кубрат 67, Пловдив",
                photo: {
                    src: "https://picsum.photos/150/150?random=2008",
                    alt: "Снимка на Иван Христов"
                },
                joinDate: "2021-09-14",
                isActive: true,
                role: "член"
            }
        ],
        media: {
            videos: [
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    alt: "Традиционен танц",
                    caption: "Демонстрация на тракийски народни танци",
                    type: "cultural",
                    duration: "4:15",
                    thumbnail: "https://picsum.photos/400/225?random=201"
                }
            ],
            virtualTour: null,
            audioFiles: []
        },

        stats: {
            totalMembers: 35,
            programs: 8,
            events: 12,
            performances: 6,
            yearsActive: 9
        },
        management: {
            board: [
                {
                    name: "Стоян Иванов",
                    role: "председател",
                    phone: "0876432111",
                    email: "stoyan.ivanov@sarnena.bg",
                    address: "ул. Цар Борис III №23, Пловдив",
                    avatar: "https://picsum.photos/100/100?random=201",
                    bio: "Пенсиониран инженер, ентусиаст на българската история и традиции"
                },
                {
                    name: "Невена Георгиева",
                    role: "секретар",
                    phone: "0887123456",
                    email: "nevena@sarnena.bg",
                    address: "ул. Гладстон №15, Пловдив",
                    avatar: "https://picsum.photos/100/100?random=202",
                    bio: "Бивша библиотекарка, отговаря за организацията на събития"
                },
                {
                    name: "Димитър Петков",
                    role: "касиер",
                    phone: "0899876543",
                    email: "dimitar@sarnena.bg",
                    address: "бул. Марица №67, Пловдив",
                    avatar: "https://picsum.photos/100/100?random=203",
                    bio: "Пенсиониран търговец, управлява клубните финанси"
                }
            ]
        },

        activities: {
            regular: [
                {
                    name: "Тракийски хор",
                    day: "четвъртък",
                    time: "16:30-18:00",
                    instructor: "Величка Димитрова",
                    participants: 16,
                    description: "Тракийски народни песни и обреди"
                },
                {
                    name: "Занаяти и рукоделие",
                    day: "понеделник",
                    time: "15:00-17:00",
                    instructor: "Мария Стоянова",
                    participants: 12,
                    description: "Плетене, шиене и традиционни занаяти"
                }
            ],
            events: [
                {
                    id: "event-3",
                    title: "Трифон Зарезан 2024",
                    date: "2024-02-14",
                    time: "12:00",
                    type: "traditional",
                    participants: 50,
                    description: "Традиционно празнуване на Трифон Зарезан с вино и песни",
                    location: "Централен градски парк",
                    organizer: "Стоян Иванов",
                    highlights: ["Тракийски танци", "Дегустация на вино", "Народни песни", "Традиционни ястия"],
                    featured: true,
                    price: "5 лв за дегустация",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=308",
                            alt: "Трифон Зарезан празник",
                            caption: "Традиционно подрязване на лозата",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=309",
                            alt: "Тракийски танци",
                            caption: "Участници в тракийски народни танци"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=310",
                            alt: "Дегустация вино",
                            caption: "Дегустация на местно вино"
                        }
                    ],
                    videos: [
                        {
                            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                            alt: "Тракийски танци",
                            caption: "Изпълнение на автентични тракийски танци",
                            duration: "8:15",
                            thumbnail: "https://picsum.photos/400/225?random=352"
                        }
                    ]
                }
            ],
            trips: [
                {
                    destination: "Бачковски манастир",
                    date: "2024-05-18",
                    participants: 25,
                    price: 25,
                    description: "Поклонническа екскурзия до Бачковския манастир"
                }
            ],
            courses: []
        },

        contacts: {
            phone: "032/626-789",
            mobile: "0876432111",
            email: "info@sarnena-plovdiv.bg",
            website: null,
            socialMedia: {
                facebook: "facebook.com/sarnena.plovdiv"
            },
            workingHours: {
                monday: "14:00-18:00",
                tuesday: "closed",
                wednesday: "14:00-18:00",
                thursday: "14:00-18:00",
                friday: "14:00-18:00",
                saturday: "10:00-14:00",
                sunday: "closed"
            }
        },

        finances: {
            budget: {
                yearly: 4200,
                currency: "BGN"
            },
            funding: [
                {
                    source: "Община Пловдив",
                    amount: 1500,
                    type: "subsidy"
                },
                {
                    source: "Членски внос",
                    amount: 2400,
                    type: "membership"
                },
                {
                    source: "Събития",
                    amount: 300,
                    type: "events"
                }
            ],
            sponsors: [
                {
                    name: "Ресторант 'Старият Пловдив'",
                    contribution: "отстъпки за групови обяди",
                    type: "discounts",
                    contact: "032/555-777",
                    address: "ул. Княз Александър I №58, Пловдив",
                    website: "www.stariyat-plovdiv.bg",
                    workingHours: "Пн-Нд: 11:00-23:00",
                    discount: "20%",
                    description: "Специални цени за групови обяди и празненства на клуба"
                },
                {
                    name: "Магазин за занаяти 'Тракия'",
                    contribution: "материали за рукоделие",
                    type: "goods",
                    contact: "032/444-888",
                    address: "ул. Гладстон №22, Пловдив",
                    website: null,
                    workingHours: "Пн-Пт: 9:00-18:00, Сб: 9:00-14:00",
                    discount: "25%",
                    description: "Прежди, плат и материали за традиционни занаяти"
                }
            ]
        },

        metadata: {
            createdAt: "2024-02-10T09:00:00Z",
            updatedAt: "2024-12-10T16:20:00Z",
            createdBy: "admin-plovdiv-1",
            isVerified: true,
            isPublic: true,
            tags: ["традиции", "хор", "рукоделие", "готварство", "приятелство"],
            rating: 4.6,
            views: 890,
            followers: 22
        },

        regionalInfo: {
            isCentralClub: false,
            centralClubId: "club-1",
            affiliatedClubs: [],
            coverageArea: "централен Пловдив",
            regionalRole: "local"
        },

        achievements: {
            awards: [],
            certificates: [
                {
                    name: "Регистрация НПО",
                    issueDate: "2015-06-10",
                    validUntil: "2026-06-10",
                    issuedBy: "Пловдивски окръжен съд"
                }
            ],
            recognitions: [
                "Благодарност от кмета на Пловдив (2022)"
            ]
        },

        socialImpact: {
            volunteering: [
                {
                    project: "Грижа за възрастни хора",
                    participants: 8,
                    hoursPerMonth: 20,
                    coordinator: "Невена Георгиева"
                }
            ],
            communityProjects: [],
            partnerships: [
                {
                    partner: "Библиотека 'Иван Вазов'",
                    type: "културно",
                    description: "Четения и литературни вечери"
                }
            ]
        },

        pensionersSpecific: {
            healthServices: {
                regularCheckups: false,
                bloodPressureMonitoring: false,
                healthLectures: [],
                medicalPartners: [],
                emergencyProtocol: {
                    hasEmergencyPlan: false,
                    emergencyContacts: ["150"],
                    nearestHospital: "УМБАЛ 'Св. Георги'",
                    specialNeeds: []
                }
            },
            supportServices: {
                homeVisits: true,
                shoppingAssistance: false,
                documentHelp: true,
                companionship: true,
                transportService: false,
                mealDelivery: false,
                cleaningHelp: false,
                techSupport: false
            },
            accessibility: {
                wheelchairAccess: false,
                elevatorAccess: false,
                hearingLoop: false,
                largeTextMaterials: false,
                handrails: true,
                nonSlipFloors: false,
                goodLighting: true,
                restingAreas: true
            },
            specialPrograms: {
                memoryActivities: [],
                intergenerationalPrograms: [],
                volunteerPrograms: [],
                mentalHealthSupport: []
            },
            ageSpecificNeeds: {
                lowImpactActivities: [
                    {
                        name: "Разходки до старият град",
                        intensity: "ниска",
                        suitableFor: ["всички възрасти"]
                    }
                ],
                cognitiveStimulation: [
                    "дискусии за традиции",
                    "споделяне на спомени"
                ],
                socialIsolationPrevention: [
                    "ежедневни срещи",
                    "общи обяди"
                ],
                nutritionSupport: [
                    {
                        service: "готвене на традиционни ястия",
                        frequency: "седмично"
                    }
                ],
                medicationReminders: false,
                fallPrevention: []
            }
        },

        template: "general",

        preferences: {
            showFinances: false,
            showMembersList: false,
            allowOnlineRegistration: false,
            showContactForm: true,
            enableCalendar: false,
            showTestimonials: false,
            publicGallery: true,
            showStatistics: false,
            allowComments: false,
            showNewsSection: false
        }
    },

    {
        // 🏛️ КЛУБ 3: Малко село - скромен клуб
        id: "club-3",
        slug: "klub-nadezhda-etropole",
        name: "Клуб на пенсионера 'Надежда'",
        shortDescription: "Малък семеен клуб в Етрополе, обединяващ местните пенсионери",
        fullDescription: "Клуб 'Надежда' е сърцето на пенсионерската общност в Етрополе. Въпреки скромните си размери, клубът е място за срещи, разговори и взаимопомощ. Нашите 18 члена се познават от години и създават истинска семейна атмосфера.",
        foundedYear: 2018,
        status: "active",
        logo: "https://picsum.photos/200/200?random=3",
        mainImage: "https://picsum.photos/800/400?random=13",
        gallery: [
            "https://picsum.photos/600/400?random=28",
            "https://picsum.photos/600/400?random=29"
        ],
        category: "general",

        location: {
            address: "ул. Освобождение №12",
            city: "Етрополе",
            municipality: "Етрополе",
            region: "София",
            postalCode: "2180",
            coordinates: { lat: 42.8258, lng: 24.0142 },
            venue: {
                type: "municipal",
                size: "45 кв.м",
                capacity: 25,
                facilities: ["основна стая", "мини кухня"],
                accessibility: false
            }
        },

        membership: {
            totalMembers: 18,
            ageGroups: {
                "60-70": 6,
                "70-80": 9,
                "80+": 3
            },
            membershipFee: {
                monthly: 5,
                yearly: 50,
                currency: "BGN"
            },
            requirements: [
                "навършени 60 години",
                "живеещ в Етрополе или село от общината"
            ],
            benefits: [
                "ежедневно прекарване на време заедно",
                "взаимопомощ",
                "общи обяди"
            ]
        },
        members: [
            {
                id: "member-3-1",
                firstName: "Дечка",
                lastName: "Георгиева",
                phone: "0888345612",
                email: "dechka@nadezhda-etropole.bg",
                address: "ул. Васил Левски №8, Етрополе",
                photo: {
                    src: "https://picsum.photos/150/150?random=3001",
                    alt: "Снимка на Дечка Георгиева"
                },
                joinDate: "2018-04-10",
                isActive: true,
                role: "председател"
            },
            {
                id: "member-3-2",
                firstName: "Тодор",
                lastName: "Методиев",
                phone: "0877654321",
                email: "todor@nadezhda-etropole.bg",
                address: "ул. Иван Вазов №14, Етрополе",
                photo: {
                    src: "https://picsum.photos/150/150?random=3002",
                    alt: "Снимка на Тодор Методиев"
                },
                joinDate: "2018-05-22",
                isActive: true,
                role: "секретар"
            },
            {
                id: "member-3-3",
                firstName: "Стоянка",
                lastName: "Петрова",
                phone: "0889123456",
                email: "stoyanka.petrova@abv.bg",
                address: "ул. Освобождение №25, Етрополе",
                photo: {
                    src: "https://picsum.photos/150/150?random=3003",
                    alt: "Снимка на Стоянка Петрова"
                },
                joinDate: "2019-02-14",
                isActive: true,
                role: "член"
            },
            {
                id: "member-3-4",
                firstName: "Иван",
                lastName: "Станков",
                phone: "0876234567",
                email: "ivan.stankov@gmail.com",
                address: "ул. Христо Ботев №7, Етрополе",
                photo: {
                    src: "https://picsum.photos/150/150?random=3004",
                    alt: "Снимка на Иван Станков"
                },
                joinDate: "2020-06-30",
                isActive: true,
                role: "член"
            },
            {
                id: "member-3-5",
                firstName: "Мария",
                lastName: "Димитрова",
                phone: "0888789123",
                email: "maria.dimitrova@dir.bg",
                address: "ул. Цар Симеон №12, Етрополе",
                photo: {
                    src: "https://picsum.photos/150/150?random=3005",
                    alt: "Снимка на Мария Димитрова"
                },
                joinDate: "2021-03-18",
                isActive: true,
                role: "член"
            },
            {
                id: "member-3-6",
                firstName: "Стефан",
                lastName: "Георгиев",
                phone: "0877345678",
                email: "stefan.georgiev@yahoo.com",
                address: "ул. Стара планина №19, Етрополе",
                photo: {
                    src: "https://picsum.photos/150/150?random=3006",
                    alt: "Снимка на Стефан Георгиев"
                },
                joinDate: "2022-01-25",
                isActive: true,
                role: "член"
            }
        ],
        media: {
            videos: [],
            virtualTour: null,
            audioFiles: []
        },

        stats: {
            totalMembers: 18,
            programs: 3,
            events: 4,
            performances: 1,
            yearsActive: 6
        },
        management: {
            board: [
                {
                    name: "Дечка Георгиева",
                    role: "председател",
                    phone: "0888345612",
                    email: "dechka@nadezhda-etropole.bg",
                    address: "ул. Васил Левски №8, Етрополе",
                    avatar: "https://picsum.photos/100/100?random=301",
                    bio: "Пенсионирана медицинска сестра, обича да се грижи за хората"
                },
                {
                    name: "Тодор Методиев",
                    role: "секретар",
                    phone: "0877654321",
                    email: "todor@nadezhda-etropole.bg",
                    address: "ул. Иван Вазов №14, Етрополе",
                    avatar: "https://picsum.photos/100/100?random=302",
                    bio: "Бивш работник, помага с организацията"
                }
            ]
        },

        activities: {
            regular: [
                {
                    name: "Ежедневни срещи",
                    day: "всеки ден",
                    time: "14:00-17:00",
                    instructor: null,
                    participants: 12,
                    description: "Свободно прекарване на време - домино, карти, разговори"
                }
            ],
            // КЛУБ 3: Етрополе - 'Надежда'
            events: [
                {
                    id: "event-4",
                    title: "Летен празник",
                    date: "2024-08-15",
                    time: "16:00",
                    type: "social",
                    participants: 30,
                    description: "Ежегоден летен празник с гости от съседни села",
                    location: "Градски парк Етрополе",
                    organizer: "Дечка Георгиева",
                    highlights: ["Семейна атмосфера", "Домашно готвене", "Музика на живо", "Игри за деца"],
                    featured: true,
                    price: "безплатно",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=311",
                            alt: "Летен празник Етрополе",
                            caption: "Семейна атмосфера в парка",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=312",
                            alt: "Домашно готвене",
                            caption: "Приготвяне на традиционни ястия"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=313",
                            alt: "Детски игри",
                            caption: "Деца играят традиционни игри"
                        }
                    ]
                }
            ],
            trips: [],
            courses: []
        },

        contacts: {
            phone: "0720/62-345",
            mobile: "0888345612",
            email: "nadezhda.etropole@gmail.com",
            website: null,
            socialMedia: {},
            workingHours: {
                monday: "14:00-17:00",
                tuesday: "14:00-17:00",
                wednesday: "14:00-17:00",
                thursday: "14:00-17:00",
                friday: "12:00-17:00",
                saturday: "closed",
                sunday: "closed"
            }
        },

        finances: {
            budget: {
                yearly: 1200,
                currency: "BGN"
            },
            funding: [
                {
                    source: "Община Етрополе",
                    amount: 600,
                    type: "subsidy"
                },
                {
                    source: "Членски внос",
                    amount: 600,
                    type: "membership"
                }
            ],
            sponsors: []
        },

        metadata: {
            createdAt: "2024-03-20T11:00:00Z",
            updatedAt: "2024-11-25T10:15:00Z",
            createdBy: "admin-etropole-1",
            isVerified: true,
            isPublic: true,
            tags: ["местна общност", "взаимопомощ", "семейна атмосфера"],
            rating: 4.9,
            views: 234,
            followers: 8
        },

        regionalInfo: {
            isCentralClub: false,
            centralClubId: null,
            affiliatedClubs: [],
            coverageArea: "град Етрополе",
            regionalRole: "local"
        },

        achievements: {
            awards: [],
            certificates: [],
            recognitions: []
        },

        socialImpact: {
            volunteering: [],
            communityProjects: [],
            partnerships: []
        },

        pensionersSpecific: {
            healthServices: {
                regularCheckups: false,
                bloodPressureMonitoring: false,
                healthLectures: [],
                medicalPartners: [],
                emergencyProtocol: {
                    hasEmergencyPlan: false,
                    emergencyContacts: ["150"],
                    nearestHospital: "Болница Етрополе",
                    specialNeeds: []
                }
            },
            supportServices: {
                homeVisits: true,
                shoppingAssistance: true,
                documentHelp: true,
                companionship: true,
                transportService: false,
                mealDelivery: false,
                cleaningHelp: true,
                techSupport: false
            },
            accessibility: {
                wheelchairAccess: false,
                elevatorAccess: false,
                hearingLoop: false,
                largeTextMaterials: false,
                handrails: false,
                nonSlipFloors: false,
                goodLighting: true,
                restingAreas: true
            },
            specialPrograms: {
                memoryActivities: [],
                intergenerationalPrograms: [],
                volunteerPrograms: [],
                mentalHealthSupport: []
            },
            ageSpecificNeeds: {
                lowImpactActivities: [],
                cognitiveStimulation: [
                    "разказване на истории",
                    "споделяне на спомени"
                ],
                socialIsolationPrevention: [
                    "ежедневни срещи",
                    "взаимни посещения"
                ],
                nutritionSupport: [
                    {
                        service: "общи обяди",
                        frequency: "петък",
                        price: "безплатно"
                    }
                ],
                medicationReminders: false,
                fallPrevention: []
            }
        },

        template: "social",

        preferences: {
            showFinances: false,
            showMembersList: false,
            allowOnlineRegistration: false,
            showContactForm: true,
            enableCalendar: false,
            showTestimonials: false,
            publicGallery: false,
            showStatistics: false,
            allowComments: false,
            showNewsSection: false
        }
    },
    {
        // 🤝 КЛУБ 4: Варна - социален клуб
        id: "club-4",
        slug: "klub-dobroto-sartse-varna",
        name: "Клуб 'Доброто сърце'",
        shortDescription: "Клуб за взаимопомощ и социални инициативи във Варна",
        fullDescription: "Клуб 'Доброто сърце' е създаден през 2012 г. с мисията да обединява пенсионери около благородни каузи. Нашите 45 члена активно участват в социални проекти, благотворителни инициативи и взаимопомощ в общността. Вярваме, че възрастта не е пречка за полезна дейност и че заедно можем да направим света по-добър.",
        foundedYear: 2012,
        status: "active",
        logo: "https://picsum.photos/200/200?random=4",
        mainImage: "https://picsum.photos/800/400?random=14",
        gallery: [
            "https://picsum.photos/600/400?random=30",
            "https://picsum.photos/600/400?random=31",
            "https://picsum.photos/600/400?random=32",
            "https://picsum.photos/600/400?random=33"
        ],
        category: "social",

        location: {
            address: "ул. Шипка №85, ет. 1",
            city: "Варна",
            municipality: "Варна",
            region: "Варна",
            postalCode: "9000",
            coordinates: { lat: 43.2141, lng: 27.9147 },
            venue: {
                type: "municipal",
                size: "120 кв.м",
                capacity: 60,
                facilities: ["конферентна зала", "кухня", "склад за дарения", "офис"],
                accessibility: true
            }
        },

        membership: {
            totalMembers: 45,
            ageGroups: {
                "60-70": 20,
                "70-80": 18,
                "80+": 7
            },
            membershipFee: {
                monthly: 12,
                yearly: 120,
                currency: "BGN"
            },
            requirements: [
                "навършени 60 години",
                "желание за доброволческа работа",
                "положителна нагласа към помощ на други"
            ],
            benefits: [
                "участие в социални проекти",
                "организирани благотворителни събития",
                "психологическа подкрепа",
                "възможност за полезна дейност",
                "нови приятелства",
                "безплатни консултации с психолог"
            ]
        },
        members: [
            {
                id: "member-4-1",
                firstName: "Милка",
                lastName: "Стефанова",
                phone: "0889123456",
                email: "milka.stefanova@dobroto-sartse.bg",
                address: "ул. Македония №15, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4001",
                    alt: "Снимка на Милка Стефанова"
                },
                joinDate: "2012-05-25",
                isActive: true,
                role: "председател"
            },
            {
                id: "member-4-2",
                firstName: "Петко",
                lastName: "Василев",
                phone: "0876987654",
                email: "petko.vasilev@dobroto-sartse.bg",
                address: "ул. Сливница №22, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4002",
                    alt: "Снимка на Петко Василев"
                },
                joinDate: "2013-02-10",
                isActive: true,
                role: "заместник-председател"
            },
            {
                id: "member-4-3",
                firstName: "Розалия",
                lastName: "Димитрова",
                phone: "0887654321",
                email: "rozalia@dobroto-sartse.bg",
                address: "бул. Владислав Варненчик №45, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4003",
                    alt: "Снимка на Розалия Димитрова"
                },
                joinDate: "2014-07-18",
                isActive: true,
                role: "секретар"
            },
            {
                id: "member-4-4",
                firstName: "Иван",
                lastName: "Петров",
                phone: "0899333444",
                email: "ivan.petrov@dobroto-sartse.bg",
                address: "ул. Граф Игнатиев №8, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4004",
                    alt: "Снимка на Иван Петров"
                },
                joinDate: "2015-01-22",
                isActive: true,
                role: "касиер"
            },
            {
                id: "member-4-5",
                firstName: "Надежда",
                lastName: "Георгиева",
                phone: "0877222333",
                email: "nadezhda@dobroto-sartse.bg",
                address: "ул. Цар Освободител №18, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4005",
                    alt: "Снимка на Надежда Георгиева"
                },
                joinDate: "2016-06-12",
                isActive: true,
                role: "координатор проекти"
            },
            {
                id: "member-4-6",
                firstName: "Стоян",
                lastName: "Кирилов",
                phone: "0888777888",
                email: "stoyan.kirilov@gmail.com",
                address: "ул. Дунав №67, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4006",
                    alt: "Снимка на Стоян Кирилов"
                },
                joinDate: "2017-03-28",
                isActive: true,
                role: "член"
            },
            {
                id: "member-4-7",
                firstName: "Елена",
                lastName: "Маринова",
                phone: "0876543210",
                email: "elena.marinova@abv.bg",
                address: "бул. Черно море №123, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4007",
                    alt: "Снимка на Елена Маринова"
                },
                joinDate: "2018-09-15",
                isActive: true,
                role: "член"
            },
            {
                id: "member-4-8",
                firstName: "Васил",
                lastName: "Христов",
                phone: "0889456789",
                email: "vasil.hristov@dir.bg",
                address: "ул. Шипка №89, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4008",
                    alt: "Снимка на Васил Христов"
                },
                joinDate: "2019-12-05",
                isActive: true,
                role: "член"
            },
            {
                id: "member-4-9",
                firstName: "Мария",
                lastName: "Ангелова",
                phone: "0877123456",
                email: "maria.angelova@yahoo.com",
                address: "ул. Възраждане №34, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4009",
                    alt: "Снимка на Мария Ангелова"
                },
                joinDate: "2020-04-20",
                isActive: true,
                role: "член"
            },
            {
                id: "member-4-10",
                firstName: "Тодор",
                lastName: "Младенов",
                phone: "0888234567",
                email: "todor.mladenov@mail.bg",
                address: "ул. Преслав №56, Варна",
                photo: {
                    src: "https://picsum.photos/150/150?random=4010",
                    alt: "Снимка на Тодор Младенов"
                },
                joinDate: "2021-08-14",
                isActive: true,
                role: "член"
            }
        ],
        media: {
            videos: [
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                    alt: "Доброволческа акция в старчески дом",
                    caption: "Нашите доброволци посещават старчески дом",
                    type: "social",
                    duration: "6:20",
                    thumbnail: "https://picsum.photos/400/225?random=401"
                },
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                    alt: "Благотворителен базар",
                    caption: "Годишен благотворителен базар за нуждаещи се семейства",
                    type: "charity",
                    duration: "8:15",
                    thumbnail: "https://picsum.photos/400/225?random=402"
                }
            ],
            virtualTour: "https://example.com/virtual-tour-dobroto-sartse",
            audioFiles: [
                {
                    src: "https://example.com/audio/testimonials.mp3",
                    alt: "Отзиви от помогнати семейства",
                    caption: "Истории на благодарност от хората, които сме подкрепили",
                    duration: "12:30"
                }
            ]
        },

        stats: {
            totalMembers: 45,
            programs: 12,
            events: 35,
            projectsBeneficiaries: 180,
            yearsActive: 12,
            donationsDistributed: 25000
        },

        management: {
            board: [
                {
                    name: "Милка Стефанова",
                    role: "председател",
                    phone: "0889123456",
                    email: "milka.stefanova@dobroto-sartse.bg",
                    address: "ул. Македония №15, Варна",
                    avatar: "https://picsum.photos/100/100?random=401",
                    bio: "Пенсионирана социална работничка с 30-годишен опит в помощ на нуждаещи се"
                },
                {
                    name: "Петко Василев",
                    role: "заместник-председател",
                    phone: "0876987654",
                    email: "petko.vasilev@dobroto-sartse.bg",
                    address: "ул. Сливница №22, Варна",
                    avatar: "https://picsum.photos/100/100?random=402",
                    bio: "Бивш директор на училище, координира образователните проекти"
                },
                {
                    name: "Розалия Димитрова",
                    role: "секретар",
                    phone: "0887654321",
                    email: "rozalia@dobroto-sartse.bg",
                    address: "бул. Владислав Варненчик №45, Варна",
                    avatar: "https://picsum.photos/100/100?random=403",
                    bio: "Пенсионирана журналистка, отговаря за връзките с обществеността"
                },
                {
                    name: "Иван Петров",
                    role: "касиер",
                    phone: "0899333444",
                    email: "ivan.petrov@dobroto-sartse.bg",
                    address: "ул. Граф Игнатиев №8, Варна",
                    avatar: "https://picsum.photos/100/100?random=404",
                    bio: "Пенсиониран счетоводител, управлява благотворителните средства"
                },
                {
                    name: "Надежда Георгиева",
                    role: "координатор проекти",
                    phone: "0877222333",
                    email: "nadezhda@dobroto-sartse.bg",
                    address: "ул. Цар Освободител №18, Варна",
                    avatar: "https://picsum.photos/100/100?random=405",
                    bio: "Организира и координира всички социални проекти на клуба"
                }
            ]
        },

        activities: {
            regular: [
                {
                    name: "Доброволчески понеделници",
                    day: "понеделник",
                    time: "14:00-17:00",
                    instructor: "Милка Стефанова",
                    participants: 15,
                    description: "Посещения на самотни пенсионери и помощ в домакинството"
                },
                {
                    name: "Работилница за дарения",
                    day: "сряда",
                    time: "15:00-18:00",
                    instructor: "Надежда Георгиева",
                    participants: 20,
                    description: "Подготовка на пакети с храна и дрехи за нуждаещи се"
                },
                {
                    name: "Групова психологическа подкрепа",
                    day: "петък",
                    time: "16:00-17:30",
                    instructor: "Психолог Анна Христова",
                    participants: 12,
                    description: "Групови сесии за справяне със самота и депресия"
                },
                {
                    name: "Готвене за възрастни",
                    day: "четвъртък",
                    time: "13:00-16:00",
                    instructor: "Доброволци",
                    participants: 8,
                    description: "Приготвяне на топла храна за самотни пенсионери"
                }
            ],
            events: [
                {
                    id: "event-5",
                    title: "Коледна благотворителна кампания",
                    date: "2024-12-15",
                    time: "10:00",
                    type: "charity",
                    participants: 200,
                    description: "Раздаване на коледни пакети на 50 нуждаещи се семейства",
                    location: "Клубна зала и околностите",
                    organizer: "Милка Стефанова",
                    highlights: ["Коледни пакети", "50 семейства", "Доброволци", "Топла храна", "Подаръци за деца"],
                    featured: true,
                    price: "безплатно",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=314",
                            alt: "Благотворителна кампания",
                            caption: "Доброволци подготвят коледни пакети",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=315",
                            alt: "Коледни пакети",
                            caption: "Красиво опаковани коледни подаръци"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=316",
                            alt: "Щастливи семейства",
                            caption: "Семейства получават коледните пакети"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=317",
                            alt: "Деца с подаръци",
                            caption: "Щастливи деца с коледните си подаръци"
                        }
                    ],
                    videos: [
                        {
                            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                            alt: "Коледна благотворителна кампания",
                            caption: "Как протече коледната ни благотворителна кампания",
                            duration: "12:45",
                            thumbnail: "https://picsum.photos/400/225?random=353"
                        }
                    ]
                },
                {
                    id: "event-6",
                    title: "Ден на възрастните хора",
                    date: "2024-10-01",
                    time: "14:00",
                    type: "social",
                    participants: 80,
                    description: "Празничен обяд и програма за всички възрастни в квартала",
                    location: "Основна зала",
                    organizer: "Петко Василев",
                    highlights: ["Празничен обяд", "Музикална програма", "Награди", "Социализация"],
                    featured: false,
                    price: "безплатно",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=318",
                            alt: "Ден на възрастните хора",
                            caption: "Празничен обяд за възрастните",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=319",
                            alt: "Музикална програма",
                            caption: "Музикално изпълнение по време на празника"
                        }
                    ]
                },
                {
                    id: "event-7",
                    title: "Пролетно почистване",
                    date: "2024-04-20",
                    time: "09:00",
                    type: "community",
                    participants: 35,
                    description: "Доброволческа акция за почистване на парк Морската градина",
                    location: "Парк Морската градина",
                    organizer: "Надежда Георгиева",
                    highlights: ["Доброволци", "Почистване", "Озеленяване", "Обща кауза"],
                    featured: false,
                    price: "безплатно",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=320",
                            alt: "Пролетно почистване",
                            caption: "Доброволци почистват парка",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=321",
                            alt: "Засаждане на дървета",
                            caption: "Засаждане на нови дървета и цветя"
                        }
                    ]
                }
            ],
            trips: [
                {
                    destination: "Социален център 'Надежда' - Шумен",
                    date: "2024-11-10",
                    participants: 25,
                    price: 0,
                    description: "Посещение и размяна на опит с друг социален клуб"
                }
            ],
            courses: [
                {
                    name: "Първа помощ за възрастни",
                    duration: "6 седмици",
                    participants: 18,
                    instructor: "Медицинска сестра Венета Иванова",
                    description: "Основни умения за оказване на първа помощ"
                },
                {
                    name: "Как да помагаме на други",
                    duration: "4 седмици",
                    participants: 22,
                    instructor: "Социален работник Мария Петкова",
                    description: "Техники за ефективна помощ и подкрепа"
                }
            ]
        },

        contacts: {
            phone: "052/612-789",
            mobile: "0889123456",
            email: "info@dobroto-sartse-varna.bg",
            website: "www.dobroto-sartse.bg",
            socialMedia: {
                facebook: "facebook.com/dobroto.sartse.varna",
                instagram: "instagram.com/dobroto_sartse_varna"
            },
            workingHours: {
                monday: "09:00-18:00",
                tuesday: "09:00-18:00",
                wednesday: "09:00-18:00",
                thursday: "09:00-18:00",
                friday: "09:00-18:00",
                saturday: "10:00-16:00",
                sunday: "closed"
            }
        },

        finances: {
            budget: {
                yearly: 18000,
                currency: "BGN"
            },
            funding: [
                {
                    source: "Община Варна",
                    amount: 8000,
                    type: "subsidy"
                },
                {
                    source: "Членски внос",
                    amount: 5400,
                    type: "membership"
                },
                {
                    source: "Дарения от граждани",
                    amount: 4600,
                    type: "donations"
                }
            ],
            sponsors: [
                {
                    name: "Верига магазини 'Фантастико'",
                    contribution: "месечни дарения на храна",
                    type: "goods",
                    contact: "052/300-400",
                    address: "бул. Владислав Варненчик №120, Варна",
                    website: "www.fantastico.bg",
                    workingHours: "Пн-Нд: 8:00-22:00",
                    discount: null,
                    description: "Ежемесечни дарения на храна за нуждаещи се семейства"
                },
                {
                    name: "Аптечна верига 'Субра'",
                    contribution: "безплатни лекарства за нуждаещи се",
                    type: "services",
                    contact: "052/222-333",
                    address: "ул. Цар Освободител №85, Варна",
                    website: "www.subra.bg",
                    workingHours: "Пн-Пт: 8:00-20:00, Сб-Нд: 9:00-18:00",
                    discount: "30%",
                    description: "Безплатни лекарства и консултации за социално слаби граждани"
                },
                {
                    name: "Транспортна компания 'Варна Транс'",
                    contribution: "безплатен транспорт за акции",
                    type: "services",
                    contact: "052/111-222",
                    address: "ул. Девня №45, Варна",
                    website: "www.varna-trans.bg",
                    workingHours: "Пн-Пт: 7:00-19:00",
                    discount: null,
                    description: "Безплатен автобусен транспорт за благотворителни акции"
                }
            ],
        },

        metadata: {
            createdAt: "2024-01-08T12:00:00Z",
            updatedAt: "2024-12-14T15:45:00Z",
            createdBy: "admin-varna-1",
            isVerified: true,
            isPublic: true,
            tags: ["благотворителност", "взаимопомощ", "доброволчество", "социални проекти", "подкрепа"],
            rating: 4.9,
            views: 1680,
            followers: 67
        },

        regionalInfo: {
            isCentralClub: true,
            centralClubId: null,
            affiliatedClubs: ["club-5", "club-6"],
            coverageArea: "централна Варна и крайморските квартали",
            regionalRole: "central"
        },

        achievements: {
            awards: [
                {
                    name: "Награда за социална отговорност",
                    year: 2023,
                    awardedBy: "Община Варна",
                    description: "За изключителен принос към социалните каузи в града"
                },
                {
                    name: "Златен медал за доброволчество",
                    year: 2022,
                    awardedBy: "Български червен кръст",
                    description: "За активна доброволческа дейност през пандемията"
                }
            ],
            certificates: [
                {
                    name: "Регистрация НПО",
                    issueDate: "2012-05-20",
                    validUntil: "2027-05-20",
                    issuedBy: "Варненски окръжен съд"
                },
                {
                    name: "Сертификат за благотворителна организация",
                    issueDate: "2020-01-15",
                    validUntil: "2025-01-15",
                    issuedBy: "Министерство на правосъдието"
                }
            ],
            recognitions: [
                "Благодарствено писмо от кмета на Варна (2023)",
                "Почетна грамота от Областна управа Варна (2022)",
                "Признание от Български червен кръст (2021)",
                "Медиен приз за социална отговорност (2020)"
            ]
        },

        socialImpact: {
            volunteering: [
                {
                    project: "Грижа за самотни възрастни",
                    participants: 25,
                    hoursPerMonth: 120,
                    coordinator: "Милка Стефанова",
                    description: "Редовни посещения и помощ на 40 самотни пенсионери"
                },
                {
                    project: "Храна за нуждаещи се",
                    participants: 15,
                    hoursPerMonth: 80,
                    coordinator: "Надежда Георгиева",
                    description: "Приготвяне и раздаване на топла храна"
                },
                {
                    project: "Помощ с лекарства",
                    participants: 8,
                    hoursPerMonth: 30,
                    coordinator: "Иван Петров",
                    description: "Осигуряване на жизненоважни лекарства"
                }
            ],
            communityProjects: [
                {
                    name: "Топъл дом за зимата",
                    description: "Отопление и храна за бездомни през зимните месеци",
                    beneficiaries: 30,
                    status: "активен",
                    budget: 8000
                },
                {
                    name: "Образование без граници",
                    description: "Помощ за деца от социално слаби семейства",
                    beneficiaries: 45,
                    status: "активен",
                    budget: 5000
                },
                {
                    name: "Здрави усмивки",
                    description: "Безплатни зъболекарски прегледи за пенсионери",
                    beneficiaries: 80,
                    status: "сезонен",
                    budget: 3000
                }
            ],
            partnerships: [
                {
                    partner: "Социален патронаж Варна",
                    type: "социално",
                    description: "Съвместна грижа за възрастни хора"
                },
                {
                    partner: "Училище 'Св. Климент Охридски'",
                    type: "образователно",
                    description: "Программа за подкрепа на деца в риск"
                },
                {
                    partner: "МБАЛ 'Св. Анна'",
                    type: "здравно",
                    description: "Безплатни здравни прегледи и консултации"
                },
                {
                    partner: "Ротари клуб Варна",
                    type: "благотворително",
                    description: "Съвместни социални проекти и кампании"
                }
            ]
        },

        pensionersSpecific: {
            healthServices: {
                regularCheckups: true,
                bloodPressureMonitoring: true,
                healthLectures: [
                    {
                        topic: "Психично здраве в старостта",
                        lecturer: "Психиатър д-р Иван Стойчев",
                        frequency: "месечно",
                        nextDate: "2025-01-20",
                        duration: "2 часа"
                    },
                    {
                        topic: "Социална изолация и как да я преодолеем",
                        lecturer: "Психолог Анна Христова",
                        frequency: "двуседмично",
                        nextDate: "2025-01-10",
                        duration: "1.5 часа"
                    }
                ],
                medicalPartners: [
                    {
                        name: "МБАЛ 'Св. Анна'",
                        service: "безплатни прегледи за членове",
                        contact: "052/987-654",
                        address: "бул. Цар Освободител №100",
                        workingHours: "Пн-Пт: 8:00-17:00"
                    },
                    {
                        name: "Дентален център 'Усмивка'",
                        service: "50% отстъпка за зъболекарски услуги",
                        contact: "052/123-789",
                        discount: "50%"
                    }
                ],
                emergencyProtocol: {
                    hasEmergencyPlan: true,
                    emergencyContacts: ["150", "0889123456", "052/612-789"],
                    nearestHospital: "УМБАЛ 'Св. Марина'",
                    specialNeeds: [
                        "обучен персонал за кризисна интервенция",
                        "протокол за работа с депресивни състояния"
                    ]
                }
            },

            supportServices: {
                homeVisits: true,
                shoppingAssistance: true,
                documentHelp: true,
                companionship: true,
                transportService: true,
                mealDelivery: true,
                cleaningHelp: true,
                techSupport: false
            },

            accessibility: {
                wheelchairAccess: true,
                elevatorAccess: true,
                hearingLoop: true,
                largeTextMaterials: true,
                handrails: true,
                nonSlipFloors: true,
                goodLighting: true,
                restingAreas: true
            },

            specialPrograms: {
                memoryActivities: [
                    {
                        name: "Споделени спомени",
                        frequency: "седмично",
                        description: "Групи за споделяне и съхраняване на лични истории",
                        instructor: "Психолог Анна Христова",
                        participants: 18
                    }
                ],
                intergenerationalPrograms: [
                    {
                        name: "Мъдрост и младост",
                        description: "Среща на поколения - споделяне на опит и знания",
                        frequency: "месечно",
                        participants: 30,
                        ageRange: "15-80 години",
                        coordinator: "Розалия Димитрова"
                    }
                ],
                volunteerPrograms: [
                    {
                        name: "Пенсионери помагат на пенсионери",
                        volunteers: 25,
                        coordinator: "Милка Стефанова",
                        description: "Взаимопомощ между членовете на клуба",
                        hoursPerWeek: 120
                    },
                    {
                        name: "Приятел в нужда",
                        volunteers: 12,
                        description: "Емоционална подкрепа за хора в криза",
                        training: "40-часов курс за консултиране"
                    }
                ],
                mentalHealthSupport: [
                    {
                        type: "групова терапия",
                        frequency: "седмично",
                        therapist: "Психолог Анна Христова",
                        participants: 15,
                        focus: "справяне със загуба и самота"
                    },
                    {
                        type: "кризисна интервенция",
                        availability: "24/7",
                        contact: "0889123456",
                        focus: "спешна психологическа помощ"
                    },
                    {
                        type: "подкрепителни групи",
                        frequency: "два пъти седмично",
                        focus: "депресия, тревожност, загуба на близки"
                    }
                ]
            },

            ageSpecificNeeds: {
                lowImpactActivities: [
                    {
                        name: "Лечебна гимнастика",
                        intensity: "ниска",
                        suitableFor: ["артрит", "остеопороза", "сърдечни проблеми"]
                    },
                    {
                        name: "Медитация и релаксация",
                        intensity: "ниска",
                        duration: "45 минути"
                    }
                ],
                cognitiveStimulation: [
                    "решаване на социални проблеми",
                    "планиране на благотворителни акции",
                    "организация на събития",
                    "обучение в доброволческа работа"
                ],
                socialIsolationPrevention: [
                    "ежедневни групови дейности",
                    "система за приятелство (buddy system)",
                    "редовни домашни посещения",
                    "кризисна телефонна линия",
                    "общи празненства и събития"
                ],
                nutritionSupport: [
                    {
                        service: "безплатни обяди за нуждаещи се",
                        frequency: "ежедневно",
                        price: "безплатно"
                    },
                    {
                        service: "консултации с диетолог",
                        provider: "Диетолог Мария Николова",
                        frequency: "месечно"
                    },
                    {
                        service: "доставка на храна в дома",
                        coverage: "самотни и болни членове",
                        volunteers: 8
                    }
                ],
                medicationReminders: true,
                fallPrevention: [
                    "проверка на дома за безопасност",
                    "упражнения за баланс и координация",
                    "обучение за използване на бастуни и проходилки",
                    "спешен медальон за самотно живеещи"
                ]
            }
        },

        template: "social",

        preferences: {
            showFinances: true,
            showMembersList: false,
            allowOnlineRegistration: true,
            showContactForm: true,
            enableCalendar: true,
            showTestimonials: true,
            publicGallery: true,
            showStatistics: true,
            allowComments: true,
            showNewsSection: true
        }
    },
    {
        // 🏃‍♂️ КЛУБ 5: Бургас - спортен клуб
        id: "club-5",
        slug: "klub-aktivna-energiya-burgas",
        name: "Клуб 'Активна енергия'",
        shortDescription: "Спортен клуб за активни пенсионери в Бургас с фокус върху здравето и фитнеса",
        fullDescription: "Клуб 'Активна енергия' е създаден през 2016 г. с мисията да промотира активен и здравословен начин на живот сред пенсионерите в Бургас. Нашите 52 члена участват в разнообразни спортни дейности - от утринна гимнастика и водна аеробика до групови разходки и йога. Вярваме, че движението е живот и че възрастта не е пречка за поддържане на добра физическа форма.",
        foundedYear: 2016,
        status: "active",
        logo: "https://picsum.photos/200/200?random=5",
        mainImage: "https://picsum.photos/800/400?random=15",
        gallery: [
            "https://picsum.photos/600/400?random=34",
            "https://picsum.photos/600/400?random=35",
            "https://picsum.photos/600/400?random=36",
            "https://picsum.photos/600/400?random=37",
            "https://picsum.photos/600/400?random=38"
        ],
        category: "sports",

        location: {
            address: "бул. Богориди №45, комплекс 'Спорт'",
            city: "Бургас",
            municipality: "Бургас",
            region: "Бургас",
            postalCode: "8000",
            coordinates: { lat: 42.4939, lng: 27.4721 },
            venue: {
                type: "sports_complex",
                size: "350 кв.м",
                capacity: 70,
                facilities: ["фитнес зала", "басейн", "спортен салон", "съблекални", "сауна", "терапевтична зона"],
                accessibility: true
            }
        },

        membership: {
            totalMembers: 52,
            ageGroups: {
                "60-70": 28,
                "70-80": 20,
                "80+": 4
            },
            membershipFee: {
                monthly: 25,
                yearly: 250,
                currency: "BGN"
            },
            requirements: [
                "навършени 60 години",
                "медицински преглед за спортни дейности",
                "желание за активен начин на живот"
            ],
            benefits: [
                "достъп до всички спортни съоръжения",
                "безплатни групови тренировки",
                "персонални консултации с треньор",
                "здравни прегледи",
                "спортни екипировки с отстъпка",
                "участие в състезания"
            ]
        },
        members: [
            {
                id: "member-5-1",
                firstName: "Добринка",
                lastName: "Петрова",
                phone: "0887654987",
                email: "dobrinka.petrova@aktivna-energiya.bg",
                address: "ул. Александровска №28, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5001",
                    alt: "Снимка на Добринка Петрова"
                },
                joinDate: "2016-03-15",
                isActive: true,
                role: "председател"
            },
            {
                id: "member-5-2",
                firstName: "Стефан",
                lastName: "Христов",
                phone: "0899123789",
                email: "stefan.hristov@aktivna-energiya.bg",
                address: "ул. Цар Симеон №15, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5002",
                    alt: "Снимка на Стефан Христов"
                },
                joinDate: "2016-05-20",
                isActive: true,
                role: "треньор-координатор"
            },
            {
                id: "member-5-3",
                firstName: "Елена",
                lastName: "Димитрова",
                phone: "0876543210",
                email: "elena.dimitrova@aktivna-energiya.bg",
                address: "бул. Демокрация №67, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5003",
                    alt: "Снимка на Елена Димитрова"
                },
                joinDate: "2017-01-10",
                isActive: true,
                role: "секретар"
            },
            {
                id: "member-5-4",
                firstName: "Васил",
                lastName: "Георгиев",
                phone: "0888765432",
                email: "vasil.georgiev@aktivna-energiya.bg",
                address: "ул. Княз Борис I №22, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5004",
                    alt: "Снимка на Васил Георгиев"
                },
                joinDate: "2017-08-25",
                isActive: true,
                role: "касиер"
            },
            {
                id: "member-5-5",
                firstName: "Мария",
                lastName: "Иванова",
                phone: "0877345678",
                email: "maria.ivanova@aktivna-energiya.bg",
                address: "ул. Гладстон №8, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5005",
                    alt: "Снимка на Мария Иванова"
                },
                joinDate: "2018-02-14",
                isActive: true,
                role: "инструктор йога"
            },
            {
                id: "member-5-6",
                firstName: "Петър",
                lastName: "Станков",
                phone: "0889567890",
                email: "petar.stankov@gmail.com",
                address: "ул. Морска №45, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5006",
                    alt: "Снимка на Петър Станков"
                },
                joinDate: "2018-07-30",
                isActive: true,
                role: "член"
            },
            {
                id: "member-5-7",
                firstName: "Надежда",
                lastName: "Кирова",
                phone: "0876987654",
                email: "nadezhda.kirova@abv.bg",
                address: "бул. Богориди №123, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5007",
                    alt: "Снимка на Надежда Кирова"
                },
                joinDate: "2019-03-18",
                isActive: true,
                role: "член"
            },
            {
                id: "member-5-8",
                firstName: "Иван",
                lastName: "Младенов",
                phone: "0888123456",
                email: "ivan.mladenov@dir.bg",
                address: "ул. Стефан Стамболов №67, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5008",
                    alt: "Снимка на Иван Младенов"
                },
                joinDate: "2019-10-22",
                isActive: true,
                role: "член"
            },
            {
                id: "member-5-9",
                firstName: "Росица",
                lastName: "Ангелова",
                phone: "0877654321",
                email: "rositsa.angelova@yahoo.com",
                address: "ул. Христо Ботев №89, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5009",
                    alt: "Снимка на Росица Ангелова"
                },
                joinDate: "2020-05-12",
                isActive: true,
                role: "член"
            },
            {
                id: "member-5-10",
                firstName: "Георги",
                lastName: "Костов",
                phone: "0889234567",
                email: "georgi.kostov@mail.bg",
                address: "ул. Волга №34, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5010",
                    alt: "Снимка на Георги Костов"
                },
                joinDate: "2021-02-28",
                isActive: true,
                role: "член"
            },
            {
                id: "member-5-11",
                firstName: "Венета",
                lastName: "Николова",
                phone: "0876345678",
                email: "veneta.nikolova@gmail.com",
                address: "бул. Алеко Богориди №156, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5011",
                    alt: "Снимка на Венета Николова"
                },
                joinDate: "2021-09-15",
                isActive: true,
                role: "член"
            },
            {
                id: "member-5-12",
                firstName: "Тодор",
                lastName: "Христов",
                phone: "0888456789",
                email: "todor.hristov@abv.bg",
                address: "ул. Индустриална №78, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5012",
                    alt: "Снимка на Тодор Христов"
                },
                joinDate: "2022-04-10",
                isActive: true,
                role: "член"
            },
            {
                id: "member-5-13",
                firstName: "Красимира",
                lastName: "Петкова",
                phone: "0877567890",
                email: "krasimira.petkova@dir.bg",
                address: "ул. Луиза №23, Бургас",
                photo: {
                    src: "https://picsum.photos/150/150?random=5013",
                    alt: "Снимка на Красимира Петкова"
                },
                joinDate: "2022-11-20",
                isActive: true,
                role: "член"
            }
        ],

        media: {
            videos: [
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                    alt: "Сутрешна гимнастика",
                    caption: "Ежедневна сутрешна гимнастика в парка",
                    type: "fitness",
                    duration: "8:30",
                    thumbnail: "https://picsum.photos/400/225?random=501"
                },
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                    alt: "Водна аеробика",
                    caption: "Водна аеробика в басейна на комплекса",
                    type: "aqua_fitness",
                    duration: "12:15",
                    thumbnail: "https://picsum.photos/400/225?random=502"
                },
                {
                    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                    alt: "Йога за възрастни",
                    caption: "Йога сесия за гъвкавост и баланс",
                    type: "yoga",
                    duration: "25:45",
                    thumbnail: "https://picsum.photos/400/225?random=503"
                }
            ],
            virtualTour: "https://example.com/virtual-tour-aktivna-energiya",
            audioFiles: [
                {
                    src: "https://example.com/audio/relaxation-music.mp3",
                    alt: "Релаксираща музика за упражнения",
                    caption: "Музика за медитация и йога",
                    duration: "30:00"
                }
            ]
        },

        stats: {
            totalMembers: 52,
            programs: 18,
            events: 42,
            competitions: 8,
            yearsActive: 8,
            avgWeeklyWorkouts: 156
        },

        management: {
            board: [
                {
                    name: "Добринка Петрова",
                    role: "председател",
                    phone: "0887654987",
                    email: "dobrinka.petrova@aktivna-energiya.bg",
                    address: "ул. Александровска №28, Бургас",
                    avatar: "https://picsum.photos/100/100?random=501",
                    bio: "Пенсионирана учителка по физическо възпитание с 30-годишен стаж. Запалена по здравословния начин на живот."
                },
                {
                    name: "Стефан Христов",
                    role: "треньор-координатор",
                    phone: "0899123789",
                    email: "stefan.hristov@aktivna-energiya.bg",
                    address: "ул. Цар Симеон №15, Бургас",
                    avatar: "https://picsum.photos/100/100?random=502",
                    bio: "Професионален кинезитерапевт и фитнес треньор, специализиран в работа с възрастни хора"
                },
                {
                    name: "Елена Димитрова",
                    role: "секретар",
                    phone: "0876543210",
                    email: "elena.dimitrova@aktivna-energiya.bg",
                    address: "бул. Демокрация №67, Бургас",
                    avatar: "https://picsum.photos/100/100?random=503",
                    bio: "Бивша медицинска сестра, координира здравните програми на клуба"
                },
                {
                    name: "Васил Георгиев",
                    role: "касиер",
                    phone: "0888765432",
                    email: "vasil.georgiev@aktivna-energiya.bg",
                    address: "ул. Княз Борис I №22, Бургас",
                    avatar: "https://picsum.photos/100/100?random=504",
                    bio: "Пенсиониран счетоводител и аматьорски плувец"
                },
                {
                    name: "Мария Иванова",
                    role: "инструктор йога",
                    phone: "0877345678",
                    email: "maria.ivanova@aktivna-energiya.bg",
                    address: "ул. Гладстон №8, Бургас",
                    avatar: "https://picsum.photos/100/100?random=505",
                    bio: "Сертифициран йога инструктор с опит в работа със сениори"
                }
            ]
        },

        activities: {
            regular: [
                {
                    name: "Сутрешна гимнастика",
                    day: "всеки ден",
                    time: "08:00-09:00",
                    instructor: "Добринка Петрова",
                    participants: 35,
                    description: "Ежедневна сутрешна гимнастика в парка или залата според времето"
                },
                {
                    name: "Водна аеробика",
                    day: "понеделник, сряда, петък",
                    time: "10:30-11:30",
                    instructor: "Стефан Христов",
                    participants: 18,
                    description: "Щадящи упражнения във вода за подвижност на ставите"
                },
                {
                    name: "Йога за сениори",
                    day: "вторник, четвъртък",
                    time: "17:00-18:00",
                    instructor: "Мария Иванова",
                    participants: 22,
                    description: "Йога поза и дишане за гъвкавост и вътрешно равновесие"
                },
                {
                    name: "Разходки с щъки",
                    day: "събота",
                    time: "09:00-11:00",
                    instructor: "Васил Георгиев",
                    participants: 15,
                    description: "Групови разходки с нордически щъки по морския бряг"
                },
                {
                    name: "Силови упражнения",
                    day: "понеделник, сряда",
                    time: "16:00-17:00",
                    instructor: "Стефан Христов",
                    participants: 12,
                    description: "Леки силови упражнения за поддържане на мускулна маса"
                },
                {
                    name: "Танцова терапия",
                    day: "петък",
                    time: "18:00-19:00",
                    instructor: "Елена Димитрова",
                    participants: 25,
                    description: "Лек танц и движение за радост и кардио натоварване"
                }
            ],
            events: [
                {
                    id: "event-8",
                    title: "Пролетен мини маратон",
                    date: "2024-04-25",
                    time: "09:00",
                    type: "sports_competition",
                    participants: 45,
                    description: "5км пеша разходка/бягане по морския бряг с награди за всички участници",
                    location: "Морски бряг Бургас",
                    organizer: "Добринка Петрова",
                    highlights: ["5км дистанция", "Морски бряг", "Награди за всички", "Здравословно състезание"],
                    featured: true,
                    price: "10 лв стартов номер",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=322",
                            alt: "Пролетен мини маратон",
                            caption: "Старт на мини маратона по морския бряг",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=323",
                            alt: "Бегачи по морския бряг",
                            caption: "Участници бягат по красивия морски бряг"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=324",
                            alt: "Финиш и награди",
                            caption: "Церемония по награждаване на участниците"
                        }
                    ],
                    videos: [
                        {
                            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                            alt: "Мини маратон Бургас",
                            caption: "Моменти от пролетния мини маратон",
                            duration: "15:20",
                            thumbnail: "https://picsum.photos/400/225?random=354"
                        }
                    ]
                },
                {
                    id: "event-9",
                    title: "Международен ден на йогата",
                    date: "2024-06-21",
                    time: "07:00",
                    type: "wellness_event",
                    participants: 60,
                    description: "Масова йога сесия на плажа при изгрев слънце",
                    location: "Централен плаж Бургас",
                    organizer: "Мария Иванова",
                    highlights: ["Йога при изгрев", "Морски бряг", "Всички нива", "Безплатни килимчета"],
                    featured: true,
                    price: "безплатно",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=325",
                            alt: "Йога на плажа",
                            caption: "Йога сесия при изгрев слънце",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=326",
                            alt: "Изгрев слънце",
                            caption: "Красив изгрев над Черно море"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=327",
                            alt: "Групова медитация",
                            caption: "Групова медитация на плажа"
                        }
                    ],
                    videos: [
                        {
                            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                            alt: "Йога при изгрев",
                            caption: "Релаксираща йога сесия при изгрев слънце",
                            duration: "25:10",
                            thumbnail: "https://picsum.photos/400/225?random=355"
                        }
                    ]
                },
                {
                    id: "event-10",
                    title: "Есенни спортни игри",
                    date: "2024-09-28",
                    time: "10:00",
                    type: "sports_festival",
                    participants: 80,
                    description: "Спортен празник с различни дисциплини и здравословно хранене",
                    location: "Спортен комплекс",
                    organizer: "Стефан Христов",
                    highlights: ["Множество дисциплини", "Здравословна храна", "Награди", "Семейно събитие"],
                    featured: false,
                    price: "5 лв участие",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=328",
                            alt: "Есенни спортни игри",
                            caption: "Различни спортни дисциплини",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=329",
                            alt: "Здравословна храна",
                            caption: "Щанд със здравословни храни"
                        },
                        {
                            src: "https://picsum.photos/800/600?random=330",
                            alt: "Семейно участие",
                            caption: "Семейства участват заедно в игрите"
                        }
                    ]
                },
                {
                    id: "event-11",
                    title: "Зимна плувна надпревара",
                    date: "2024-12-10",
                    time: "11:00",
                    type: "swimming_competition",
                    participants: 25,
                    description: "Плувна надпревара в топъл басейн с топли напитки след това",
                    location: "Басейн на комплекса",
                    organizer: "Васил Георгиев",
                    highlights: ["Топъл басейн", "Различни дистанции", "Топли напитки", "Медали"],
                    featured: false,
                    price: "безплатно за членове",
                    images: [
                        {
                            src: "https://picsum.photos/800/600?random=331",
                            alt: "Плувна надпревара",
                            caption: "Състезание в топлия басейн",
                            isMain: true
                        },
                        {
                            src: "https://picsum.photos/800/600?random=332",
                            alt: "Награждаване",
                            caption: "Церемония по награждаване с медали"
                        }
                    ]
                }
            ],
            trips: [
                {
                    destination: "Велинград - СПА уикенд",
                    date: "2024-10-05",
                    participants: 30,
                    price: 120,
                    description: "Двудневен релакс уикенд с балнео процедури и планински разходки"
                },
                {
                    destination: "Спортен лагер Боровец",
                    date: "2024-07-15",
                    participants: 20,
                    price: 180,
                    description: "Тридневен активен лагер с планински туризъм и йога"
                }
            ],
            courses: [
                {
                    name: "Основи на здравословното хранене",
                    duration: "6 седмици",
                    participants: 28,
                    instructor: "Диетолог Анна Костова",
                    description: "Как да се храним правилно за активна старост"
                },
                {
                    name: "Първа помощ при спорт",
                    duration: "4 седмици",
                    participants: 15,
                    instructor: "Д-р Петър Стойчев",
                    description: "Основни умения за оказване на първа помощ при спортни травми"
                },
                {
                    name: "Медитация и дишане",
                    duration: "8 седмици",
                    participants: 20,
                    instructor: "Мария Иванова",
                    description: "Техники за релаксация и управление на стреса"
                }
            ]
        },

        contacts: {
            phone: "056/845-123",
            mobile: "0887654987",
            email: "info@aktivna-energiya-burgas.bg",
            website: "www.aktivna-energiya.bg",
            socialMedia: {
                facebook: "facebook.com/aktivna.energiya.burgas",
                instagram: "instagram.com/aktivna_energiya_bg",
                youtube: "youtube.com/c/AktivnaEnergiyaBurgas"
            },
            workingHours: {
                monday: "07:00-20:00",
                tuesday: "07:00-20:00",
                wednesday: "07:00-20:00",
                thursday: "07:00-20:00",
                friday: "07:00-20:00",
                saturday: "08:00-18:00",
                sunday: "08:00-16:00"
            }
        },

        finances: {
            budget: {
                yearly: 32000,
                currency: "BGN"
            },
            funding: [
                {
                    source: "Община Бургас",
                    amount: 12000,
                    type: "subsidy"
                },
                {
                    source: "Членски внос",
                    amount: 15600,
                    type: "membership"
                },
                {
                    source: "Спортни спонсори",
                    amount: 4400,
                    type: "sponsorship"
                }
            ],
            sponsors: [
                {
                    name: "Фитнес верига 'Active Life'",
                    contribution: "безплатни тренировъчни програми",
                    type: "services",
                    contact: "056/789-456",
                    address: "бул. Богориди №67, Бургас",
                    website: "www.activelife.bg",
                    workingHours: "Пн-Нд: 6:00-23:00",
                    discount: "40%",
                    description: "Достъп до фитнес зали и персонални тренировки за членове"
                },
                {
                    name: "Спортен магазин 'Champion'",
                    contribution: "отстъпки за спортни стоки",
                    type: "discounts",
                    contact: "056/333-444",
                    address: "ул. Александровска №88, Бургас",
                    website: "www.champion-sport.bg",
                    workingHours: "Пн-Сб: 9:00-20:00, Нд: 10:00-18:00",
                    discount: "25%",
                    description: "Спортни екипи, обувки и аксесоари с отстъпка"
                },
                {
                    name: "Аптека 'Здраве+'",
                    contribution: "витамини и хранителни добавки",
                    type: "goods",
                    contact: "056/555-666",
                    address: "ул. Стефан Стамболов №15, Бургас",
                    website: "www.zdraveplus.bg",
                    workingHours: "Пн-Нд: 8:00-21:00",
                    discount: "20%",
                    description: "Витамини, протеини и хранителни добавки за спортисти"
                }
            ]
        },

        metadata: {
            createdAt: "2024-02-20T08:00:00Z",
            updatedAt: "2024-12-16T11:30:00Z",
            createdBy: "admin-burgas-1",
            isVerified: true,
            isPublic: true,
            tags: ["фитнес", "йога", "водна аеробика", "здраве", "активност", "спорт", "велнес"],
            rating: 4.9,
            views: 1420,
            followers: 89
        },

        regionalInfo: {
            isCentralClub: true,
            centralClubId: null,
            affiliatedClubs: ["club-6", "club-7"],
            coverageArea: "Бургас и Черноморието",
            regionalRole: "central"
        },
        achievements: {
            awards: [
                {
                    name: "Най-активен спортен клуб за сениори",
                    year: 2023,
                    awardedBy: "Министерство на младежта и спорта",
                    description: "За популяризиране на спорта сред възрастните хора"
                },
                {
                    name: "Награда за здравословен начин на живот",
                    year: 2022,
                    awardedBy: "Община Бургас",
                    description: "За принос към здравето на гражданите"
                }
            ],
            certificates: [
                {
                    name: "Регистрация спортен клуб",
                    issueDate: "2016-03-10",
                    validUntil: "2026-03-10",
                    issuedBy: "Министерство на младежта и спорта"
                },
                {
                    name: "Сертификат за безопасност",
                    issueDate: "2023-01-15",
                    validUntil: "2025-01-15",
                    issuedBy: "Изпълнителна агенция по безопасност на движението"
                }
            ],
            recognitions: [
                "Почетно отличие от БОК (2023)",
                "Благодарствено писмо от кмета на Бургас (2022)",
                "Плакет за спортни постижения (2021)"
            ]
        },

        socialImpact: {
            volunteering: [
                {
                    project: "Спорт в училищата",
                    participants: 12,
                    hoursPerMonth: 48,
                    coordinator: "Добринка Петрова",
                    description: "Обучение на деца в основни спортни умения"
                },
                {
                    project: "Фитнес за нуждаещи се",
                    participants: 8,
                    hoursPerMonth: 32,
                    coordinator: "Стефан Христов",
                    description: "Безплатни тренировки за хора с ниски доходи"
                }
            ],
            communityProjects: [
                {
                    name: "Активно стареене Бургас",
                    description: "Популяризиране на спорта сред всички възрастни в града",
                    beneficiaries: 200,
                    status: "активен",
                    budget: 15000
                },
                {
                    name: "Здрави сърца",
                    description: "Кардио програма за превенция на сърдечно-съдови заболявания",
                    beneficiaries: 150,
                    status: "активен",
                    budget: 8000
                }
            ],
            partnerships: [
                {
                    partner: "УМБАЛ 'Бургас'",
                    type: "здравно",
                    description: "Медицински прегледи и консултации за членовете"
                },
                {
                    partner: "СПА комплекс 'Аквa'",
                    type: "спортно",
                    description: "Достъп до балнео процедури и рехабилитация"
                },
                {
                    partner: "Спортно училище 'Васил Левски'",
                    type: "образователно",
                    description: "Съвместни тренировки и размяна на опит"
                }
            ]
        },

        pensionersSpecific: {
            healthServices: {
                regularCheckups: true,
                bloodPressureMonitoring: true,
                healthLectures: [
                    {
                        topic: "Спорт и сърдечно здраве",
                        lecturer: "Кардиолог д-р Мария Стоянова",
                        frequency: "месечно",
                        nextDate: "2025-01-25",
                        duration: "1.5 часа"
                    },
                    {
                        topic: "Хранене за спортисти сениори",
                        lecturer: "Диетолог Анна Костова",
                        frequency: "месечно",
                        nextDate: "2025-01-18",
                        duration: "2 часа"
                    },
                    {
                        topic: "Превенция на спортни травми",
                        lecturer: "Кинезитерапевт Стефан Христов",
                        frequency: "седмично",
                        nextDate: "2025-01-12",
                        duration: "1 час"
                    }
                ],
                medicalPartners: [
                    {
                        name: "УМБАЛ 'Бургас'",
                        service: "спортна медицина и консултации",
                        contact: "056/858-888",
                        address: "ул. Стефан Стамболов №73",
                        workingHours: "Пн-Пт: 8:00-18:00"
                    },
                    {
                        name: "Физиотерапевтичен център 'Движение'",
                        service: "рехабилитация и масажи",
                        contact: "056/123-456",
                        discount: "30%"
                    },
                    {
                        name: "Кардиологичен център 'Здраво сърце'",
                        service: "кардиологични прегледи за спортуващи",
                        contact: "056/987-654",
                        discount: "25%"
                    }
                ],
                emergencyProtocol: {
                    hasEmergencyPlan: true,
                    emergencyContacts: ["150", "0887654987", "056/845-123"],
                    nearestHospital: "УМБАЛ 'Бургас'",
                    specialNeeds: [
                        "дефибрилатор в спортната зала",
                        "обучен спасител на басейна",
                        "аптечка за спортни травми",
                        "процедури за сърдечни инциденти"
                    ]
                }
            },

            supportServices: {
                homeVisits: false,
                shoppingAssistance: false,
                documentHelp: true,
                companionship: true,
                transportService: true,
                mealDelivery: false,
                cleaningHelp: false,
                techSupport: true
            },

            accessibility: {
                wheelchairAccess: true,
                elevatorAccess: true,
                hearingLoop: false,
                largeTextMaterials: true,
                handrails: true,
                nonSlipFloors: true,
                goodLighting: true,
                restingAreas: true
            },

            specialPrograms: {
                memoryActivities: [
                    {
                        name: "Координация и памет",
                        frequency: "два пъти седмично",
                        description: "Упражнения комбиниращи физическа активност с когнитивни задачи",
                        instructor: "Невролог д-р Иван Петров",
                        participants: 16
                    }
                ],
                intergenerationalPrograms: [
                    {
                        name: "Спорт без граници",
                        description: "Съвместни тренировки на млади и възрастни спортисти",
                        frequency: "месечно",
                        participants: 40,
                        ageRange: "16-80 години",
                        coordinator: "Стефан Христов"
                    }
                ],
                volunteerPrograms: [
                    {
                        name: "Спортни ментори",
                        volunteers: 15,
                        coordinator: "Добринка Петрова",
                        description: "Опитни членове помагат на новодошлите",
                        hoursPerWeek: 60
                    }
                ],
                mentalHealthSupport: [
                    {
                        type: "спортна психология",
                        frequency: "седмично",
                        therapist: "Спортен психолог Елена Йорданова",
                        participants: 10,
                        focus: "мотивация и преодоляване на страхове при спорт"
                    }
                ]
            },

            ageSpecificNeeds: {
                lowImpactActivities: [
                    {
                        name: "Водна аеробика",
                        intensity: "ниска до средна",
                        suitableFor: ["артрит", "проблеми със ставите", "остеопороза"]
                    },
                    {
                        name: "Йога за сениори",
                        intensity: "ниска",
                        suitableFor: ["всички възрасти", "проблеми с гръбначния стълб"]
                    },
                    {
                        name: "Тай чи",
                        intensity: "ниска",
                        suitableFor: ["проблеми с баланса", "болест на Паркинсон"]
                    }
                ],
                cognitiveStimulation: [
                    "координационни упражнения",
                    "запомняне на танцови стъпки",
                    "планиране на тренировъчни програми",
                    "изучаване на нови спортни техники"
                ],
                socialIsolationPrevention: [
                    "групови тренировки",
                    "спортни екипи и партньорства",
                    "социални събития след тренировки",
                    "спортни празници и състезания",
                    "общи пътувания до състезания"
                ],
                nutritionSupport: [
                    {
                        service: "спортно хранене за сениори",
                        provider: "Диетолог Анна Костова",
                        frequency: "месечно"
                    },
                    {
                        service: "протеинови шейкове и витамини",
                        frequency: "ежедневно след тренировки",
                        price: "включено в членския внос"
                    }
                ],
                medicationReminders: true,
                fallPrevention: [
                    "тренировки за баланс и координация",
                    "силови упражнения за костите",
                    "проверка на екипировката за безопасност",
                    "обучение за правилно падане",
                    "упражнения за гъвкавост"
                ]
            }
        },

        template: "sports",

        preferences: {
            showFinances: true,
            showMembersList: false,
            allowOnlineRegistration: true,
            showContactForm: true,
            enableCalendar: true,
            showTestimonials: true,
            publicGallery: true,
            showStatistics: true,
            allowComments: true,
            showNewsSection: true
        }
    }
]