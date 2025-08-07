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
    status: "active",
    logo: "https://picsum.photos/200/200?random=1",
    mainImage: "https://picsum.photos/800/400?random=11",
    gallery: [
      "https://picsum.photos/600/400?random=21",
      "https://picsum.photos/600/400?random=22",
      "https://picsum.photos/600/400?random=23",
      "https://picsum.photos/600/400?random=24"
    ],
    category: "cultural",

    location: {
      address: "ул. Витоша 127, ет. 2",
      city: "София",
      municipality: "Столична",
      region: "София-град",
      postalCode: "1463",
      coordinates: { lat: 42.6777, lng: 23.3219 },
      venue: {
        type: "municipal",
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
        currency: "BGN"
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

    management: {
      board: [
        {
          name: "Анка Димитрова",
          role: "председател",
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
          day: "понеделник",
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
          description: "Традиционен коледен концерт с участието на хора и танцова група"
        },
        {
          id: "event-2", 
          title: "Великденски базар",
          date: "2024-04-28",
          time: "10:00",
          type: "social",
          participants: 80,
          description: "Базар с домашно приготвени лакомства и занаятчийски изделия"
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
          duration: "8 седмици",
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
        facebook: "facebook.com/zlatnaesenta.sofia"
      },
      workingHours: {
        monday: "09:00-17:00",
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
          type: "subsidy"
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
          type: "services"
        },
        {
          name: "Пекарна 'Дунав'",
          contribution: "отстъпки за събития",
          type: "discounts"
        }
      ]
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
        },
        {
          name: "Рада Стоянова",
          role: "културен деец",
          phone: "0888765432",
          email: "rada@sarnena.bg",
          address: "ул. Съединение №34, Пловдив",
          avatar: "https://picsum.photos/100/100?random=204",
          bio: "Бивша музикална учителка, организира културни събития"
        },
        {
          name: "Петко Николов",
          role: "член",
          phone: "0877987654",
          email: "petko@sarnena.bg",
          address: "ул. Васил Кънчов №18, Пловдив",
          avatar: "https://picsum.photos/100/100?random=205",
          bio: "Активен член, помага при поддръжката на помещението"
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
        },
        {
          name: "Готварски курс",
          day: "сряда",
          time: "14:00-16:00",
          instructor: "Бабка Рада",
          participants: 8,
          description: "Традиционни български ястия и домашна кухня"
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
          description: "Традиционно празнуване на Трифон Зарезан с вино и песни"
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
          type: "discounts"
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
        },
        {
          name: "Стойка Димитрова",
          role: "касиер",
          phone: "0899123789",
          email: "stoyka@nadezhda-etropole.bg",
          address: "ул. Христо Ботев №22, Етрополе",
          avatar: "https://picsum.photos/100/100?random=303",
          bio: "Пенсионирана учителка, води сметките на клуба"
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
        },
        {
          name: "Общ обяд",
          day: "петък",
          time: "12:00-14:00",
          instructor: "Различни членове",
          participants: 15,
          description: "Всеки петък готвим и ядем заедно"
        }
      ],
      events: [
        {
          id: "event-4",
          title: "Летен празник",
          date: "2024-08-15",
          time: "16:00",
          type: "social",
          participants: 30,
          description: "Ежегоден летен празник с гости от съседни села"
        }
      ],
      trips: [
        {
          destination: "Правешки манастир",
          date: "2024-06-20",
          participants: 12,
          price: 15,
          description: "Къса екскурзия до близкия манастир"
        }
      ],
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
    }
  },
  {
  // 🏛️ КЛУБ 4: Варна - морски клуб
  id: "club-4",
  slug: "klub-morska-sirena-varna",
  name: "Клуб 'Морска сирена'",
  shortDescription: "Уютен приморски клуб във Варна с фокус върху морските традиции и здравето",
  fullDescription: "Клуб 'Морска сирена' обединява 52 пенсионери от Варна около любовта към морето и здравословния начин на живот. Основан през 2016 г., клубът предлага уникални морски разходки, талазотерапия и богата програма за активно стареене на брега на Черно море.",
  foundedYear: 2016,
  status: "active",
  logo: "https://picsum.photos/200/200?random=4",
  mainImage: "https://picsum.photos/800/400?random=14",
  gallery: [
    "https://picsum.photos/600/400?random=31",
    "https://picsum.photos/600/400?random=32",
    "https://picsum.photos/600/400?random=33",
    "https://picsum.photos/600/400?random=34"
  ],
  category: "sports",

  location: {
    address: "бул. Приморски №85",
    city: "Варна",
    municipality: "Варна",
    region: "Варна",
    postalCode: "9000",
    coordinates: { lat: 43.2141, lng: 27.9147 },
    venue: {
      type: "municipal",
      size: "120 кв.м",
      capacity: 60,
      facilities: ["голяма зала", "тераса с морска гледка", "фитнес кът", "библиотека"],
      accessibility: true
    }
  },

  membership: {
    totalMembers: 52,
    ageGroups: {
      "60-70": 28,
      "70-80": 19,
      "80+": 5
    },
    membershipFee: {
      monthly: 12,
      yearly: 120,
      currency: "BGN"
    },
    requirements: [
      "навършени 60 години",
      "живеещ във Варна или околностите"
    ],
    benefits: [
      "безплатни морски разходки",
      "групови упражнения на плажа",
      "здравни консултации",
      "културни събития",
      "екскурзии по крайбрежието"
    ]
  },

  management: {
    board: [
      {
        name: "Капитан Георги Маринов",
        role: "председател",
        phone: "0888123457",
        email: "g.marinov@morskasirena.bg",
        address: "ул. Царь Калоян №34, Варна",
        avatar: "https://picsum.photos/100/100?random=401",
        bio: "Пенсиониран морски капитан с 40-годишен стаж, ентусиаст на морските традиции"
      },
      {
        name: "Елена Петрова",
        role: "секретар",
        phone: "0877654123",
        email: "elena.p@morskasirena.bg",
        address: "ул. Сливница №22, Варна",
        avatar: "https://picsum.photos/100/100?random=402",
        bio: "Бивша медицинска сестра, специализирана в рехабилитация"
      },
      {
        name: "Михаил Димов",
        role: "касиер",
        phone: "0899321456",
        email: "mihail@morskasirena.bg",
        address: "бул. Владислав Варненчик №67, Варна",
        avatar: "https://picsum.photos/100/100?random=403",
        bio: "Пенсиониран икономист, управлява финансите на клуба"
      },
      {
        name: "Цветана Йорданова",
        role: "спортен координатор",
        phone: "0888567234",
        email: "cvetana@morskasirena.bg",
        address: "ул. Девня №18, Варна",
        avatar: "https://picsum.photos/100/100?random=404",
        bio: "Бивша учителка по физкултура, организира спортните дейности"
      }
    ]
  },

  activities: {
    regular: [
      {
        name: "Сутрешна гимнастика на плажа",
        day: "всеки ден",
        time: "07:00-08:00",
        instructor: "Цветана Йорданова",
        participants: 25,
        description: "Ежедневни упражнения на свеж въздух с морска гледка"
      },
      {
        name: "Морски разходки",
        day: "вторник",
        time: "16:00-18:00",
        instructor: "Георги Маринов",
        participants: 20,
        description: "Разходки по крайбрежната алея с разказки за морето"
      },
      {
        name: "Водна аеробика",
        day: "четвъртък",
        time: "10:00-11:00",
        instructor: "Елена Петрова",
        participants: 18,
        description: "Водни упражнения в басейн за гъвкавост и сила"
      },
      {
        name: "Морски хор",
        day: "сряда",
        time: "17:00-19:00",
        instructor: "Мария Николова",
        participants: 22,
        description: "Морски шантии и народни песни за морето"
      }
    ],
    events: [
      {
        id: "event-5",
        title: "Ден на морето 2024",
        date: "2024-07-15",
        time: "10:00",
        type: "cultural",
        participants: 150,
        description: "Голямо празнуване с концерт и морски специалитети"
      }
    ],
    trips: [
      {
        destination: "Несебър и Созопол",
        date: "2024-09-20",
        participants: 35,
        price: 35,
        description: "Еднодневна екскурзия до черноморските перли"
      }
    ],
    courses: [
      {
        name: "Основи на талазотерапията",
        duration: "4 седмици",
        participants: 12,
        instructor: "Д-р Светлана Димитрова",
        description: "Как морето лекува - практически съвети"
      }
    ]
  },

  contacts: {
    phone: "052/601-234",
    mobile: "0888123457",
    email: "info@morskasirena-varna.bg",
    website: "www.morskasirena.bg",
    socialMedia: {
      facebook: "facebook.com/morskasirena.varna"
    },
    workingHours: {
      monday: "07:00-19:00",
      tuesday: "07:00-19:00", 
      wednesday: "07:00-19:00",
      thursday: "07:00-19:00",
      friday: "07:00-19:00",
      saturday: "08:00-16:00",
      sunday: "08:00-14:00"
    }
  },

  finances: {
    budget: {
      yearly: 8500,
      currency: "BGN"
    },
    funding: [
      {
        source: "Община Варна",
        amount: 4000,
        type: "subsidy"
      },
      {
        source: "Членски внос",
        amount: 3500,
        type: "membership"
      },
      {
        source: "Спонсори",
        amount: 1000,
        type: "sponsorship"
      }
    ],
    sponsors: [
      {
        name: "Хотел 'Морски бриз'",
        contribution: "безплатни зали за събития",
        type: "facilities"
      }
    ]
  },

  metadata: {
    createdAt: "2024-01-25T08:00:00Z",
    updatedAt: "2024-12-12T15:45:00Z",
    createdBy: "admin-varna-1",
    isVerified: true,
    isPublic: true,
    tags: ["море", "спорт", "здраве", "морски традиции", "водна аеробика"],
    rating: 4.7,
    views: 1340,
    followers: 31
  }
},

{
  // 🏛️ КЛУБ 5: Бургас - културен клуб
  id: "club-5", 
  slug: "klub-burgas-melodi-burgas",
  name: "Културен клуб 'Бургаски мелодии'",
  shortDescription: "Културен център за пенсионери в Бургас с богата музикална и театрална програма",
  fullDescription: "Клуб 'Бургаски мелодии' е културното сърце на пенсионерската общност в Бургас. Основан през 2012 г., клубът обединява 78 души около любовта към музиката, театъра и изкуството. Нашият клуб е известен с великолепните концерти и театрални представления.",
  foundedYear: 2012,
  status: "active",
  logo: "https://picsum.photos/200/200?random=5",
  mainImage: "https://picsum.photos/800/400?random=15", 
  gallery: [
    "https://picsum.photos/600/400?random=35",
    "https://picsum.photos/600/400?random=36",
    "https://picsum.photos/600/400?random=37",
    "https://picsum.photos/600/400?random=38",
    "https://picsum.photos/600/400?random=39"
  ],
  category: "cultural",

  location: {
    address: "ул. Александровска №156",
    city: "Бургас",
    municipality: "Бургас", 
    region: "Бургас",
    postalCode: "8000",
    coordinates: { lat: 42.5048, lng: 27.4626 },
    venue: {
      type: "cultural_center",
      size: "200 кв.м",
      capacity: 90,
      facilities: ["концертна зала", "сцена", "пиано", "костюмерна", "звукова техника"],
      accessibility: true
    }
  },

  membership: {
    totalMembers: 78,
    ageGroups: {
      "60-70": 35,
      "70-80": 32,
      "80+": 11
    },
    membershipFee: {
      monthly: 18,
      yearly: 180,
      currency: "BGN"
    },
    requirements: [
      "навършени 60 години",
      "интерес към култура и изкуство",
      "живеещ в Бургас"
    ],
    benefits: [
      "участие в хор и театрална група",
      "безплатни концерти и представления",
      "майсторски класове",
      "културни екскурзии",
      "костюми за представления"
    ]
  },

  management: {
    board: [
      {
        name: "Маестро Атанас Петков",
        role: "председател",
        phone: "0888234567",
        email: "maestro@burgasmelodi.bg",
        address: "ул. Богориди №45, Бургас",
        avatar: "https://picsum.photos/100/100?random=501",
        bio: "Пенсиониран диригент с 45-годишна кариера, основател на клуба"
      },
      {
        name: "Виолета Стефанова", 
        role: "арт директор",
        phone: "0877345678",
        email: "violeta@burgasmelodi.bg",
        address: "ул. Лермонтов №28, Бургас",
        avatar: "https://picsum.photos/100/100?random=502",
        bio: "Бивша оперна певица, ръководи вокалните дейности"
      },
      {
        name: "Христо Димитров",
        role: "режисьор",
        phone: "0899456789",
        email: "hristo@burgasmelodi.bg",
        address: "бул. Демокрация №134, Бургас",
        avatar: "https://picsum.photos/100/100?random=503",
        bio: "Пенсиониран театрален режисьор, ръководи драматичната секция"
      },
      {
        name: "Рени Георгиева",
        role: "секретар",
        phone: "0888567890",
        email: "reni@burgasmelodi.bg", 
        address: "ул. Цар Петър №67, Бургас",
        avatar: "https://picsum.photos/100/100?random=504",
        bio: "Бивша журналистка, отговаря за връзките с медиите"
      },
      {
        name: "Любен Христов",
        role: "касиер", 
        phone: "0877678901",
        email: "luben@burgasmelodi.bg",
        address: "ул. Граф Игнатиев №89, Бургас",
        avatar: "https://picsum.photos/100/100?random=505",
        bio: "Пенсиониран счетоводител, управлява клубния бюджет"
      }
    ]
  },

  activities: {
    regular: [
      {
        name: "Смесен хор 'Черноморски вълни'",
        day: "понеделник",
        time: "17:00-19:00",
        instructor: "Маестро Атанас Петков",
        participants: 45,
        description: "Класическа и народна музика с концерти всеки месец"
      },
      {
        name: "Театрална студия 'Златна възраст'",
        day: "сряда", 
        time: "16:00-18:00",
        instructor: "Христо Димитров",
        participants: 22,
        description: "Драматично изкуство и театрални представления"
      },
      {
        name: "Танцов ансамбъл 'Бургаска прелест'",
        day: "четвъртък",
        time: "16:30-18:00", 
        instructor: "Мила Николова",
        participants: 28,
        description: "Народни и обществени танци"
      },
      {
        name: "Литературен салон",
        day: "петък",
        time: "15:00-17:00",
        instructor: "Рени Георгиева", 
        participants: 18,
        description: "Четене на поезия и проза, дискусии за литература"
      }
    ],
    events: [
      {
        id: "event-6",
        title: "Годишен гала концерт",
        date: "2024-12-15",
        time: "19:00",
        type: "cultural",
        participants: 200,
        description: "Голям концерт с участието на всички секции на клуба"
      },
      {
        id: "event-7",
        title: "Театрална премиера",
        date: "2024-11-30", 
        time: "18:30",
        type: "cultural",
        participants: 120,
        description: "Премиера на постановката 'Под игото' по Иван Вазов"
      }
    ],
    trips: [
      {
        destination: "София - Народен театър",
        date: "2024-10-25",
        participants: 40,
        price: 85,
        description: "Културна екскурзия с посещение на театрално представление"
      }
    ],
    courses: [
      {
        name: "Основи на сценичното майсторство",
        duration: "6 седмици",
        participants: 15,
        instructor: "Христо Димитров",
        description: "Как да се държим на сцена и пред публика"
      }
    ]
  },

  contacts: {
    phone: "056/845-678",
    mobile: "0888234567",
    email: "info@burgasmelodi.bg",
    website: "www.burgasmelodi-club.bg",
    socialMedia: {
      facebook: "facebook.com/burgasmelodi",
      youtube: "youtube.com/burgasmelodi"
    },
    workingHours: {
      monday: "15:00-20:00",
      tuesday: "15:00-20:00",
      wednesday: "15:00-20:00", 
      thursday: "15:00-20:00",
      friday: "15:00-20:00",
      saturday: "10:00-18:00",
      sunday: "closed"
    }
  },

  finances: {
    budget: {
      yearly: 15000,
      currency: "BGN"
    },
    funding: [
      {
        source: "Община Бургас",
        amount: 7000,
        type: "subsidy"
      },
      {
        source: "Членски внос",
        amount: 6000,
        type: "membership"
      },
      {
        source: "Билети от концерти",
        amount: 2000,
        type: "tickets"
      }
    ],
    sponsors: [
      {
        name: "Културен дом 'Петя Дубарова'",
        contribution: "техническа поддръжка",
        type: "services"
      },
      {
        name: "Музикален магазин 'Арт'",
        contribution: "отстъпки за инструменти",
        type: "discounts"
      }
    ]
  },

  metadata: {
    createdAt: "2024-01-18T12:00:00Z", 
    updatedAt: "2024-12-08T17:20:00Z",
    createdBy: "admin-burgas-1",
    isVerified: true,
    isPublic: true,
    tags: ["хор", "театър", "танци", "концерти", "култура", "изкуство"],
    rating: 4.9,
    views: 1890,
    followers: 67
  }
},

{
  // 🏛️ КЛУБ 6: Стара Загора - спортен клуб
  id: "club-6",
  slug: "klub-zdravi-i-silni-stara-zagora", 
  name: "Спортен клуб 'Здрави и силни'",
  shortDescription: "Активен спортен клуб в Стара Загора за пенсионери, които обичат движението",
  fullDescription: "Клуб 'Здрави и силни' е първият специализиран спортен клуб за пенсионери в Стара Загора. Основан през 2017 г., клубът промотира активния начин на живот чрез разнообразни спортни дейности. Нашите 41 членове доказват, че възрастта е само число!",
  foundedYear: 2017,
  status: "active",
  logo: "https://picsum.photos/200/200?random=6",
  mainImage: "https://picsum.photos/800/400?random=16",
  gallery: [
    "https://picsum.photos/600/400?random=40",
    "https://picsum.photos/600/400?random=41", 
    "https://picsum.photos/600/400?random=42",
    "https://picsum.photos/600/400?random=43"
  ],
  category: "sports",

  location: {
    address: "ул. Цар Симеон Велики №78",
    city: "Стара Загора",
    municipality: "Стара Загора",
    region: "Стара Загора", 
    postalCode: "6000",
    coordinates: { lat: 42.4258, lng: 25.6342 },
    venue: {
      type: "sports_center",
      size: "300 кв.м",
      capacity: 50,
      facilities: ["фитнес зала", "йога студио", "съблекални", "душове", "медицински кабинет"],
      accessibility: true
    }
  },

  membership: {
    totalMembers: 41,
    ageGroups: {
      "60-70": 24,
      "70-80": 14,
      "80+": 3
    },
    membershipFee: {
      monthly: 20,
      yearly: 200,
      currency: "BGN"
    },
    requirements: [
      "навършени 60 години",
      "медицинска справка за спортуване",
      "желание за активен живот"
    ],
    benefits: [
      "достъп до всички спортни дейности",
      "персонални тренировки",
      "здравни измервания",
      "спортно облекло",
      "участие в турнири"
    ]
  },

  management: {
    board: [
      {
        name: "Стефан Колев",
        role: "председател",
        phone: "0888345789",
        email: "stefan@zdraviisilni.bg",
        address: "ул. Пеню Пенев №23, Стара Загора",
        avatar: "https://picsum.photos/100/100?random=601",
        bio: "Бивш треньор по лека атлетика, пропагандист на здравословния живот"
      },
      {
        name: "Д-р Милка Стоянова",
        role: "медицински консултант",
        phone: "0877456890",
        email: "milka@zdraviisilni.bg",
        address: "бул. Цар Освободител №45, Стара Загора", 
        avatar: "https://picsum.photos/100/100?random=602",
        bio: "Лекар по спортна медицина, следи здравното състояние на членовете"
      },
      {
        name: "Васил Христов",
        role: "треньор",
        phone: "0899567901", 
        email: "vasil@zdraviisilni.bg",
        address: "ул. Средец №67, Стара Загора",
        avatar: "https://picsum.photos/100/100?random=603",
        bio: "Сертифициран треньор по йога и пилатес за възрастни"
      },
      {
        name: "Гинка Петрова",
        role: "секретар",
        phone: "0888678012",
        email: "ginka@zdraviisilni.bg",
        address: "ул. Патриарх Евтимий №34, Стара Загора",
        avatar: "https://picsum.photos/100/100?random=604", 
        bio: "Бивша спортистка, организира състезанията и турнирите"
      }
    ]
  },

  activities: {
    regular: [
      {
        name: "Сутрешна гимнастика",
        day: "всеки ден",
        time: "08:00-09:00",
        instructor: "Стефан Колев",
        participants: 32,
        description: "Общоукрепващи упражнения за добро начало на деня"
      },
      {
        name: "Йога за начинаещи", 
        day: "понеделник",
        time: "17:00-18:00",
        instructor: "Васил Христов",
        participants: 18,
        description: "Нежни йога упражнения за гъвкавост и баланс"
      },
      {
        name: "Аквааеробика", 
        day: "сряда",
        time: "16:00-17:00",
        instructor: "Стефан Колев",
        participants: 22,
        description: "Водни упражнения в басейна на спортния комплекс"
      },
      {
        name: "Пинг-понг турнири",
        day: "петък",
        time: "15:00-17:00", 
        instructor: "Гинка Петрова",
        participants: 16,
        description: "Седмични турнири по тенис на маса"
      },
      {
        name: "Разходки в природата",
        day: "събота",
        time: "09:00-12:00",
        instructor: "Цялата група",
        participants: 25,
        description: "Групови разходки до Старозагорските бани и околностите"
      }
    ],
    events: [
      {
        id: "event-8",
        title: "Спартакиада на пенсионерите",
        date: "2024-09-21", 
        time: "10:00",
        type: "sports",
        participants: 80,
        description: "Голямо спортно състезание с участие на клубове от региона"
      }
    ],
    trips: [
      {
        destination: "Хисаря - СПА уикенд",
        date: "2024-11-15",
        participants: 30,
        price: 120,
        description: "Двудневна екскурзия с минерални бани и релакс"
      }
    ],
    courses: [
      {
        name: "Здравословно хранене за активни хора",
        duration: "4 седмици", 
        participants: 20,
        instructor: "Д-р Милка Стоянова",
        description: "Как да се храним правилно при активен начин на живот"
      }
    ]
  },

  contacts: {
    phone: "042/601-789",
    mobile: "0888345789",
    email: "info@zdraviisilni.bg",
    website: "www.zdraviisilni-sz.bg",
    socialMedia: {
      facebook: "facebook.com/zdraviisilni.sz",
      instagram: "instagram.com/zdraviisilni_sz"
    },
    workingHours: {
      monday: "07:00-20:00",
      tuesday: "07:00-20:00",
      wednesday: "07:00-20:00",
      thursday: "07:00-20:00", 
      friday: "07:00-20:00",
      saturday: "08:00-18:00",
      sunday: "09:00-15:00"
    }
  },

  finances: {
    budget: {
      yearly: 10000,
      currency: "BGN"
    },
    funding: [
      {
        source: "Община Стара Загора",
        amount: 4000,
        type: "subsidy"
      },
      {
        source: "Членски внос",
        amount: 5000,
        type: "membership"
      },
      {
        source: "Спортни мероприятия",
        amount: 1000,
        type: "events"
      }
    ],
    sponsors: [
      {
        name: "Спортен комплекс 'Олимпия'",
        contribution: "отстъпки за басейн и съоръжения",
        type: "facilities"
      },
      {
        name: "Аптека 'Фамакс'",
        contribution: "безплатни здравни измервания",
        type: "services"
      }
    ]
  },

  metadata: {
    createdAt: "2024-02-12T09:30:00Z",
    updatedAt: "2024-12-05T11:15:00Z", 
    createdBy: "admin-sz-1",
    isVerified: true,
    isPublic: true,
    tags: ["спорт", "фитнес", "йога", "здраве", "активност", "турнири"],
    rating: 4.8,
    views: 1120,
    followers: 38
  }
},

{
  // 🏛️ КЛУБ 7: Малко село - традиционен клуб
  id: "club-7",
  slug: "klub-roden-krai-gabrovnitsa",
  name: "Клуб 'Роден край'",
  shortDescription: "Автентичен селски клуб в Габровница, пазител на местните традиции и обичаи",
  fullDescription: "Клуб 'Роден край' е душата на село Габровница. Основан през 2019 г., нашият малък но сплотен клуб от 14 члена пази и предава традициите на Габровнишкия край. Тук всеки е познат, всеки е важен и всеки има своята история за разказване.",
  foundedYear: 2019,
  status: "active",
  logo: "https://picsum.photos/200/200?random=7",
  mainImage: "https://picsum.photos/800/400?random=17",
  gallery: [
    "https://picsum.photos/600/400?random=44",
    "https://picsum.photos/600/400?random=45"
  ],
  category: "traditional",

  location: {
    address: "ул. Централна №3",
    city: "Габровница",
    municipality: "Габрово", 
    region: "Габрово",
    postalCode: "5349",
    coordinates: { lat: 42.8719, lng: 25.2981 },
    venue: {
      type: "community_center",
      size: "35 кв.м",
      capacity: 20,
      facilities: ["основна стая", "мини кухня", "камина", "двор"],
      accessibility: false
    }
  },

  membership: {
    totalMembers: 14,
    ageGroups: {
      "60-70": 4,
      "70-80": 7,
      "80+": 3
    },
    membershipFee: {
      monthly: 3,
      yearly: 30,
      currency: "BGN"
    },
    requirements: [
      "навършени 60 години", 
      "роден или живеещ в Габровница",
      "обич към родните традиции"
    ],
    benefits: [
      "топла домашна атмосфера",
      "запазване на традициите",
      "взаимопомощ в ежедневието",
      "общи празници и събирания"
    ]
  },

  management: {
    board: [
      {
        name: "Баба Стойка Димитрова",
        role: "председател", 
        phone: "0888456123",
        email: "stoyka@rodenkrai.bg",
        address: "ул. Розова №7, Габровница",
        avatar: "https://picsum.photos/100/100?random=701",
        bio: "На 78 години, родена и израсла в селото, пазител на местните легенди и обичаи"
      },
      {
        name: "Дядо Иван Петков",
        role: "секретар",
        phone: "0877567234",
        email: "ivan@rodenkrai.bg", 
        address: "ул. Главна №12, Габровница",
        avatar: "https://picsum.photos/100/100?random=702",
        bio: "Бивш овчар, знае всички стари песни и приказки на Габровнишкия край"
      },
      {
        name: "Цвета Георгиева",
        role: "касиер",
        phone: "0899678345",
        email: "cveta@rodenkrai.bg",
        address: "ул. Дунав №5, Габровница", 
        avatar: "https://picsum.photos/100/100?random=703",
        bio: "Майстор на традиционната кухня, водач на готварските събирания"
      }
    ]
  },

  activities: {
    regular: [
      {
        name: "Кафе и приказки",
        day: "всеки ден",
        time: "14:00-17:00", 
        instructor: null,
        participants: 12,
        description: "Свободни разговори при чаша домашно кафе"
      },
      {
        name: "Готвене на традиционни ястия",
        day: "понеделник",
        time: "10:00-14:00",
        instructor: "Цвета Георгиева",
        participants: 8,
        description: "Заедно готвим традиционни ястия по стари рецепти"
      },
      {
        name: "Стари песни и приказки",
        day: "четвъртък",
        time: "16:00-18:00",
        instructor: "Дядо Иван Петков", 
        participants: 10,
        description: "Разказване на стари истории и пеене на народни песни"
      },
      {
        name: "Рукоделие и занаяти",
        day: "вторник",
        time: "15:00-17:00",
        instructor: "Баба Стойка",
        participants: 6,
        description: "Плетене, бродерия и други традиционни занаяти"
      }
    ],
    events: [
      {
        id: "event-9",
        title: "Сборът на селото",
        date: "2024-08-10",
        time: "15:00", 
        type: "traditional",
        participants: 60,
        description: "Голям събор с участие на всички жители и гости на селото"
      },
      {
        id: "event-10",
        title: "Коледувание",
        date: "2024-12-24",
        time: "18:00",
        type: "traditional",
        participants: 25,
        description: "Традиционно коледувание по къщите в селото"
      }
    ],
    trips: [
      {
        destination: "Етъра - Музей на занаятите",
        date: "2024-10-05",
        participants: 10,
        price: 20,
        description: "Посещение на музея с традиционните български занаяти"
      }
    ],
    courses: []
  },

  contacts: {
    phone: "066/801-234",
    mobile: "0888456123",
    email: "rodenkrai.gabrovnica@gmail.com",
    website: null,
    socialMedia: {},
    workingHours: {
      monday: "10:00-17:00",
      tuesday: "14:00-17:00", 
      wednesday: "14:00-17:00",
      thursday: "14:00-18:00",
      friday: "14:00-17:00",
      saturday: "closed",
      sunday: "closed"
    }
  },

  finances: {
    budget: {
      yearly: 600,
      currency: "BGN"
    },
    funding: [
      {
        source: "Община Габрово",
        amount: 300,
        type: "subsidy"
      },
      {
        source: "Членски внос",
        amount: 300,
        type: "membership" 
      }
    ],
    sponsors: [
      {
        name: "Местна кооперация",
        contribution: "храни за събития",
        type: "products"
      }
    ]
  },

  metadata: {
    createdAt: "2024-04-05T13:00:00Z",
    updatedAt: "2024-11-20T14:30:00Z",
    createdBy: "admin-gabrovo-1",
    isVerified: true,
    isPublic: true,
    tags: ["село", "традиции", "обичаи", "автентичност", "общност", "рукоделие"],
    rating: 5.0,
    views: 156,
    followers: 5
  }
}
];