// client/src/mockData/mockMentorReviews.js

export const mockMentorReviewsData = {
  success: true,
  stats: {
    mentorId: 1,
    mentorName: "Мария Георгиева",
    totalReviews: 15,
    averageRating: 4.5,
    ratingDistribution: {
      5: 8,
      4: 4,
      3: 2,
      2: 1,
      1: 0
    }
  },
  reviews: [
    {
      id: 1,
      userId: 101,
      reviewType: 'mentor',
      targetId: 1,
      name: "Иван Петров",
      email: "ivan.petrov@example.com",
      role: "Пенсионер",
      rating: 5,
      text: "Изключителна помощ! Мария беше много търпелива и обясняваше всичко ясно и разбираемо. Благодарение на нея вече мога сама да си пускам имейли и да общувам с внуците си по Messenger. Препоръчвам я на всички!",
      status: "approved",
      approvedAt: "2024-11-10T10:30:00Z",
      createdAt: "2024-11-08T14:20:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=12",
      user: {
        id: 101,
        email: "ivan.petrov@example.com",
        username: "ivan_petrov"
      }
    },
    {
      id: 2,
      userId: 102,
      reviewType: 'mentor',
      targetId: 1,
      name: "Елена Димитрова",
      email: "elena.dimitrova@example.com",
      role: "Началник на клуб",
      rating: 5,
      text: "Професионализъм на високо ниво! Мария работи с нашите членове на клуба вече 3 месеца и резултатите са впечатляващи. Хората са станали много по-уверени с технологиите.",
      status: "approved",
      approvedAt: "2024-11-09T15:45:00Z",
      createdAt: "2024-11-07T09:10:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=45",
      user: {
        id: 102,
        email: "elena.dimitrova@example.com",
        username: "elena_d"
      }
    },
    {
      id: 3,
      userId: 103,
      reviewType: 'mentor',
      targetId: 1,
      name: "Георги Стоянов",
      email: "georgi.stoyanov@example.com",
      role: "Пенсионер",
      rating: 4,
      text: "Много добро обучение. Мария обясни как да използвам Viber и сега мога да се обаждам безплатно на децата си в чужбина. Единственото е че понякога говори малко бързо, но като я помоля повтаря спокойно.",
      status: "approved",
      approvedAt: "2024-11-08T11:20:00Z",
      createdAt: "2024-11-06T16:30:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=33",
      user: {
        id: 103,
        email: "georgi.stoyanov@example.com",
        username: "georgi_s"
      }
    },
    {
      id: 4,
      userId: 104,
      reviewType: 'mentor',
      targetId: 1,
      name: "Пенка Василева",
      email: "penka.vasileva@example.com",
      role: "Доброволец",
      rating: 5,
      text: "Страхотен ментор! Научих как да плащам сметки онлайн и вече не се налага да чакам на опашки в банката. Мария винаги отговаря бързо на въпросите ми в чата.",
      status: "approved",
      approvedAt: "2024-11-07T14:10:00Z",
      createdAt: "2024-11-05T10:45:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=25",
      user: {
        id: 104,
        email: "penka.vasileva@example.com",
        username: "penka_v"
      }
    },
    {
      id: 5,
      userId: 105,
      reviewType: 'mentor',
      targetId: 1,
      name: "Димитър Йорданов",
      email: "dimitar.yordanov@example.com",
      role: "Пенсионер",
      rating: 5,
      text: "Отлично! Научих се да ползвам Google Maps и вече не се губя из София. Мария е много отзивчива и винаги намира време за въпросите ми.",
      status: "approved",
      approvedAt: "2024-11-06T09:30:00Z",
      createdAt: "2024-11-04T13:20:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=51",
      user: {
        id: 105,
        email: "dimitar.yordanov@example.com",
        username: "dimitar_y"
      }
    },
    {
      id: 6,
      userId: 106,
      reviewType: 'mentor',
      targetId: 1,
      name: "Стоянка Иванова",
      email: "stoyanka.ivanova@example.com",
      role: "Студент",
      rating: 4,
      text: "Много полезно обучение за работа с WhatsApp. Сега мога да споделям снимки с внуците си. Бих искала повече време за практика, но иначе всичко е чудесно.",
      status: "approved",
      approvedAt: "2024-11-05T16:20:00Z",
      createdAt: "2024-11-03T11:10:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=16",
      user: {
        id: 106,
        email: "stoyanka.ivanova@example.com",
        username: "stoyanka_i"
      }
    },
    {
      id: 7,
      userId: 107,
      reviewType: 'mentor',
      targetId: 1,
      name: "Тодор Колев",
      email: "todor.kolev@example.com",
      role: "Пенсионер",
      rating: 5,
      text: "Супер ментор! Благодарение на Мария вече мога да си поръчвам книги онлайн и да следя новините в интернет. Обяснява много ясно и с примери.",
      status: "approved",
      approvedAt: "2024-11-04T10:15:00Z",
      createdAt: "2024-11-02T14:30:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=68",
      user: {
        id: 107,
        email: "todor.kolev@example.com",
        username: "todor_k"
      }
    },
    {
      id: 8,
      userId: 108,
      reviewType: 'mentor',
      targetId: 1,
      name: "Надежда Костадинова",
      email: "nadezhda.kostadinova@example.com",
      role: "Студент",
      rating: 4,
      text: "Добро обучение. Научих много неща за киберсигурността и как да се предпазя от измами онлайн. Благодаря на Мария за професионализма!",
      status: "approved",
      approvedAt: "2024-11-03T13:40:00Z",
      createdAt: "2024-11-01T09:20:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=29",
      user: {
        id: 108,
        email: "nadezhda.kostadinova@example.com",
        username: "nadezhda_k"
      }
    },
    {
      id: 9,
      userId: 109,
      reviewType: 'mentor',
      targetId: 1,
      name: "Васил Георгиев",
      email: "vasil.georgiev@example.com",
      role: "Доброволец",
      rating: 5,
      text: "Отлична работа! Мария ми помогна да си направя профил във Facebook и вече мога да следя какво правят приятелите ми. Много търпелива и отзивчива!",
      status: "approved",
      approvedAt: "2024-11-02T11:25:00Z",
      createdAt: "2024-10-31T15:10:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=14",
      user: {
        id: 109,
        email: "vasil.georgiev@example.com",
        username: "vasil_g"
      }
    },
    {
      id: 10,
      userId: 110,
      reviewType: 'mentor',
      targetId: 1,
      name: "Мария Петкова",
      email: "maria.petkova@example.com",
      role: "Пенсионер",
      rating: 3,
      text: "Обучението беше добро, но имах затруднения с разбирането на някои термини. Мария се опита да обясни, но мисля че е добре да има повече визуални материали.",
      status: "approved",
      approvedAt: "2024-11-01T10:00:00Z",
      createdAt: "2024-10-30T12:40:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=32",
      user: {
        id: 110,
        email: "maria.petkova@example.com",
        username: "maria_p"
      }
    },
    {
      id: 11,
      userId: 111,
      reviewType: 'mentor',
      targetId: 1,
      name: "Христо Николов",
      email: "hristo.nikolov@example.com",
      role: "Студент",
      rating: 5,
      text: "Перфектно! Научих се да използвам Zoom и вече мога да се виждам с дъщеря си, която живее в Германия. Мария е топ професионалист!",
      status: "approved",
      approvedAt: "2024-10-31T14:30:00Z",
      createdAt: "2024-10-29T09:15:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=57",
      user: {
        id: 111,
        email: "hristo.nikolov@example.com",
        username: "hristo_n"
      }
    },
    {
      id: 12,
      userId: 112,
      reviewType: 'mentor',
      targetId: 1,
      name: "Румяна Христова",
      email: "rumyana.hristova@example.com",
      role: "Началник на клуб",
      rating: 4,
      text: "Много добра работа с нашите членове. Мария е отговорна и пунктуална. Единственото забележка е че понякога закъснява с отговорите в чата, но разбираме че има много студенти.",
      status: "approved",
      approvedAt: "2024-10-30T16:20:00Z",
      createdAt: "2024-10-28T11:30:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=41",
      user: {
        id: 112,
        email: "rumyana.hristova@example.com",
        username: "rumyana_h"
      }
    },
    {
      id: 13,
      userId: 113,
      reviewType: 'mentor',
      targetId: 1,
      name: "Стефан Димов",
      email: "stefan.dimov@example.com",
      role: "Пенсионер",
      rating: 5,
      text: "Страхотен ментор! Научих се да правя видео разговори и да споделям файлове. Мария обяснява с много примери и винаги е усмихната.",
      status: "approved",
      approvedAt: "2024-10-29T09:45:00Z",
      createdAt: "2024-10-27T13:20:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=71",
      user: {
        id: 113,
        email: "stefan.dimov@example.com",
        username: "stefan_d"
      }
    },
    {
      id: 14,
      userId: 114,
      reviewType: 'mentor',
      targetId: 1,
      name: "Красимира Ангелова",
      email: "krasimira.angelova@example.com",
      role: "Доброволец",
      rating: 3,
      text: "Обучението беше полезно, но темпото беше малко бързо за мен. Бих искала повече време за упражнения. Иначе Мария е много мила и отзивчива.",
      status: "approved",
      approvedAt: "2024-10-28T15:10:00Z",
      createdAt: "2024-10-26T10:40:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=23",
      user: {
        id: 114,
        email: "krasimira.angelova@example.com",
        username: "krasimira_a"
      }
    },
    {
      id: 15,
      userId: 115,
      reviewType: 'mentor',
      targetId: 1,
      name: "Любомир Тодоров",
      email: "lyubomir.todorov@example.com",
      role: "Пенсионер",
      rating: 2,
      text: "Обучението беше добро, но имах проблеми със свързването в чата. Мария ми помогна накрая, но загубихме доста време. Надявам се техническите проблеми да бъдат оправени.",
      status: "approved",
      approvedAt: "2024-10-27T11:30:00Z",
      createdAt: "2024-10-25T14:15:00Z",
      imageUrl: "https://i.pravatar.cc/150?img=60",
      user: {
        id: 115,
        email: "lyubomir.todorov@example.com",
        username: "lyubomir_t"
      }
    }
  ],
  total: 15
};