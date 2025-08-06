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
  }
];