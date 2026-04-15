# 📋 Семинари — Пълен план за изпълнение
### Дата: 2 Април 2026 | Проект: DigiBridge Academy | Платформа: pensa.club

---

## 📌 Общо описание

Платформата има два типа семинари: **присъствени** (на място в клубове) и **онлайн** (YouTube Live / Google Meet). Менторите записват присъстващи ръчно от админ панела (`admin/seminar-attendance`).

**Два основни проблема:**
1. Нерегистрирани потребители НЕ могат да се запишат сами за присъствен семинар от потребителската страница
2. Липсва статистика, доклади и export за семинари в админ панела

---

# 🔵 ПРОБЛЕМ 1: Записване за присъствен семинар от потребителската страница

## Текущо състояние
- Страница `/academy/seminars/:slug` показва детайли на семинара
- Бутон "Запиши се" се показва САМО за логнати потребители
- Ако не си логнат → модал с "Вход" и "Регистрация" бутони
- Нерегистрирани гости → менторът ги добавя ръчно от `admin/seminar-attendance`
- Модел `seminar_guest_attendance` вече съществува (firstName, lastName, email, phone, participationLevel, markedBy)

## Какво трябва да се направи

### Стъпка 1: Migration — нова колона `converted_to_user_id`

**Файл:** `server/src/sequelize/migrations/XXXXXX-add-converted-to-user-id-to-guest-attendance.js`

- Добавя `converted_to_user_id` INTEGER nullable в таблица `seminar_guest_attendances`
- Тази колона ще съдържа userId на потребителя, ако гостът после се е регистрирал
- Позволява проследяване: "този гост после стана регистриран потребител"

**Модел за обновяване:** `server/src/sequelize/models/seminar_guest_attendance.js`
- Добавяне на `convertedToUserId` поле с `field: 'converted_to_user_id'`

---

### Стъпка 2: Нов публичен endpoint за гост записване

**Файл:** `server/src/controllers/seminarsController.js`
**Endpoint:** `POST /academy/seminars/:id/guest-register`
**Auth:** ПУБЛИЧЕН (без isAuth) — всеки може да се запише

**Request body:**
```json
{
  "firstName": "Иван",        // задължително
  "lastName": "Петров",       // задължително
  "email": "ivan@mail.com",   // незадължително
  "phone": "0888123456"       // незадължително
}
```

**Backend логика стъпка по стъпка:**
1. Валидация: firstName и lastName задължителни, минимум 2 символа
2. Проверка: семинарът съществува, е published, не е cancelled/completed
3. Проверка: не е пълен (registeredCount < maxParticipants)
4. Проверка за дубликат: по firstName + lastName + seminarId в `seminar_guest_attendance`
5. Създаване на `seminar_guest_attendance` запис:
   - `seminarId`, `guestFirstName`, `guestLastName`, `guestEmail`, `guestPhone`
   - `participationLevel: 'passive'` (default)
   - `markedBy: null` (самозаписване, не от ментор)
6. Increment `seminar.registeredCount`
7. Ако е дал **имейл** → изпраща `guestNotification` email template:
   - Заглавие на семинара, дата, място, линк
   - "Регистрирайте се в платформата за кредити!"
8. Ако е дал **телефон** и SMS е включен → изпраща SMS потвърждение
9. Response: `{ success: true, message: "Записахте се успешно" }`

**Записът се вижда в:**
- `admin/seminar-attendance` → секция "Гости"
- Статистика → като "гост" участник

---

### Стъпка 3: Frontend — Обновяване на модала и добавяне на гост форма

**Файл:** `client/src/components/AcademySeminars/AcademySeminarDetail/AcademySeminarDetail.jsx`

**Текущ auth модал** (showAuthModal) → трябва да стане **два етапа:**

**Етап 1 — Избор (модал):**
```
🎓 Запишете се за семинара

Като регистриран потребител получавате кредити
за всеки посетен семинар!

[🏆 Регистрирай се и спечели кредити]  ← primary бутон, зелен
[📝 Продължи като гост]                ← secondary бутон, outline

Вече имате акаунт? [Вход] ← линк
```

**Етап 2 — Гост форма (ако натисне "Продължи като гост"):**
```
📝 Запишете се като гост

Име *          [____________]
Фамилия *      [____________]
Имейл          [____________]  ← hint: "Ще получите потвърждение"
Телефон        [____________]  ← hint: "За SMS напомняне"

[Запиши се]    [← Назад]
```

**При submit:**
- Fetch `POST /academy/seminars/:id/guest-register`
- Success → показва зелено съобщение "Записахте се успешно!"
- Error → показва червено съобщение

**Нови state-ове:**
- `showGuestForm` (boolean) — показва гост формата вместо избора
- `guestData` (object) — { firstName, lastName, email, phone }
- `guestRegistering` (boolean) — loading state
- `guestRegistered` (boolean) — success state

**CSS стилове:**
- `asd-guest-form` — формата
- `asd-guest-input` — input полетата
- `asd-guest-hint` — hint текстове
- `asd-guest-success` — success съобщение
- Responsive за mobile

---

### Стъпка 4: Кредити при регистрация за бивши гости

**Файл:** `server/src/controllers/authController.js`

**Кога се изпълнява:** при успешна регистрация на нов потребител (`POST /auth/register`)

**Логика (стъпка по стъпка):**
1. След създаване на user акаунт, проверява `seminar_guest_attendance` по имейл:
   ```sql
   SELECT * FROM seminar_guest_attendances
   WHERE guest_email = 'новият имейл'
   AND converted_to_user_id IS NULL
   ```
2. Ако има записи (потребителят е бил гост на семинари):
   a. **Смяна на роля → `student`** (ако текущата роля е `user` или `guest`)
      - `await userAccount.update({ role: 'student' })`
   b. **Създава `student` запис** в таблицата students (ако не съществува)
      - `await student.findOrCreate({ where: { userId }, defaults: { userId, status: 'active' } })`
   c. **За ВСЕКИ семинар** от гост записите:
      - Намира семинара: `await seminar.findByPk(guestRecord.seminarId)`
      - **Проверява дали семинарът раздава кредити:** `seminar.creditsForAttendance > 0`
      - Ако ДА → създава `student_seminar`:
        - `attended: true`
        - `attendedAt: guestRecord.createdAt` (датата на присъствие като гост)
        - `status: 'approved'`
        - `earnedCredits: seminar.creditsForAttendance` (САМО минимални, без participation bonus)
        - `participationLevel: guestRecord.participationLevel`
        - `approvedBy: null` (автоматично)
      - Ако НЕ → създава `student_seminar` с `earnedCredits: 0` (записва присъствието без кредити)
   d. **Обновява `seminar_guest_attendance.convertedToUserId = newUserId`** за всеки запис
   e. **Обновява `user_credits`** — сумира всички `earnedCredits` от горните записи:
      - `findOrCreate` за `user_credits` с `userId`
      - Increment `totalCredits` с общата сума
      - Създава `user_credits_history` запис за всеки семинар с кредити
      - Обновява `level` (beginner/intermediate/advanced/master)
3. **Performance:** Query по email е бърз (малко записи). Целият процес <100ms
4. **Не бави регистрацията** — изпълнява се sync но е бързо. При грешка `.catch()` — не блокира регистрацията

**Важно:**
- НЕ се дават кредити за админи/ментори (но те рядко се регистрират през публичната форма)
- Кредити се дават САМО ако `seminar.creditsForAttendance > 0`
- Ролята се сменя на `student` САМО ако не е privileged (admin/moderator/mentor)
- Ако потребителят е бил гост на 5 семинара, ще получи кредити за всичките 5 наведнъж

---

# 🟢 ПРОБЛЕМ 2: Статистика и доклади

## Текущо състояние
- `AdminAcademySeminarsList` показва списък семинари с CRUD операции
- `SeminarAttendancePage` показва присъствие за конкретен семинар
- Няма обобщена статистика, графики или export

## Какво трябва да се направи

### Стъпка 5: Backend — Statistics endpoint

**Файл:** `server/src/controllers/seminarsController.js`
**Endpoint:** `GET /academy/admin/seminars/statistics`
**Auth:** isAuth + rbac('seminar', 'read')

**Query параметри:**
- `period`: `7d` | `30d` | `180d` | `365d` | `all` (default: `30d`)
- `type`: `all` | `online` | `onsite` (default: `all`)

**Response:**
```json
{
  "overview": {
    "totalSeminars": 45,
    "totalOnline": 20,
    "totalOnsite": 25,
    "totalRegistered": 340,
    "totalAttendedRegistered": 280,
    "totalAttendedGuests": 150,
    "totalAttendedAll": 430,
    "averageAttendees": 9.5,
    "totalCreditsAwarded": 1200
  },
  "seminarsPerMonth": [
    { "month": "2026-01", "count": 5, "attended": 42 },
    { "month": "2026-02", "count": 8, "attended": 67 },
    ...
  ],
  "seminars": [
    {
      "id": 1,
      "title": "Дигитална грамотност",
      "scheduledDate": "2026-03-15T10:00:00Z",
      "isOnline": false,
      "location": "Клуб Надежда",
      "mentorName": "Иван Петров",
      "registeredCount": 15,
      "attendedRegistered": 12,
      "attendedGuests": 5,
      "attendedTotal": 17,
      "totalCredits": 60
    },
    ...
  ]
}
```

**SQL логика:**
- `totalAttendedRegistered`: COUNT от `student_seminar` WHERE `attended = true`
- `totalAttendedGuests`: COUNT от `seminar_guest_attendance`
- `totalAttendedAll`: сума на горните две
- Филтри по `isOnline` за тип и по `scheduledDate` за период
- JOIN с `mentor` таблица за ментор имена

---

### Стъпка 6: Backend — Attendance detail endpoint

**Endpoint:** `GET /academy/admin/seminars/:id/attendance-detail`
**Auth:** isAuth + rbac('seminar', 'read')

**Response:**
```json
{
  "seminar": { "id": 1, "title": "...", "scheduledDate": "...", "location": "..." },
  "stats": {
    "registered": 15,
    "attendedRegistered": 12,
    "attendedGuests": 5,
    "total": 17
  },
  "registered": [
    {
      "type": "registered",
      "studentId": 5,
      "name": "Мария Иванова",
      "email": "maria@mail.com",
      "phone": "0888111222",
      "registeredAt": "2026-03-10T...",
      "attendedAt": "2026-03-15T...",
      "attended": true,
      "participationLevel": "active",
      "earnedCredits": 5,
      "status": "approved"
    },
    ...
  ],
  "guests": [
    {
      "type": "guest",
      "id": 3,
      "firstName": "Петър",
      "lastName": "Георгиев",
      "email": "petar@mail.com",
      "phone": null,
      "participationLevel": "passive",
      "markedBy": "Админ Пенса",
      "createdAt": "2026-03-15T...",
      "convertedToUserId": null
    },
    ...
  ]
}
```

---

### Стъпка 7: Frontend — AdminSeminarStatistics компонент

**Файл:** `client/src/components/AdminAcademySeminarsList/AdminSeminarStatistics/AdminSeminarStatistics.jsx`
**CSS prefix:** `asst-`

**Структура:**

```
┌──────────────────────────────────────────────────┐
│  📊 Статистика на семинари     [7д][30д][6м][1г] │
│                                [Всички][Присъств.][Онлайн] │
│                                [📄 Свали доклад]  │
├──────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │   45   │  │  430   │  │  9.5   │  │ 1200   │ │
│  │Семинари│  │Присъст.│  │Средно  │  │Кредити │ │
│  └────────┘  └────────┘  └────────┘  └────────┘ │
├──────────────────────────────────────────────────┤
│  📈 AreaChart — семинари и присъстващи по месеци │
│  (Recharts, 2 линии: семинари + присъстващи)    │
├──────────────────────────────────────────────────┤
│  🔍 Търсене: [________________] по заглавие     │
│                                                  │
│  Дата    │ Заглавие │ Тип │ Място │ Ментор │ Зап│ Рег│Гост│Общо│Кред│
│  15.03   │ Дигит... │ 📍  │ Надеж │ Иван   │ 15 │ 12 │ 5  │ 17 │ 60 │
│    └→ [Всички] [Регистрирани] [Гости]           │
│       Мария Иванова | maria@... | active | 5 кр  │
│       Петър Георгиев | guest | passive           │
│  16.03   │ Интер... │ 🌐  │ Онлайн│ Бобо   │ 20 │ 18 │ 0  │ 18 │ 90 │
│  ...                                             │
├──────────────────────────────────────────────────┤
│  🔍 Търсене по участник: [________________]      │
│  Резултати: Мария Иванова → Семинар "Дигит..."  │
└──────────────────────────────────────────────────┘
```

**Функционалност:**
- Period tabs: 7д / 30д / 6м / 1г / Всички
- Type filter: Всички / Присъствени / Онлайн
- Recharts AreaChart с две линии
- Таблица с сортиране по колона
- Клик на ред → expandable row с 3 таба (Всички/Регистрирани/Гости)
- Глобално търсене по участник (name/email)
- Бутон "Свали доклад" → PDF

**Интеграция:** Нов таб "Статистика" в `AdminAcademySeminarsList.jsx`

---

### Стъпка 8: Backend — PDF Export endpoints

#### 8a. Доклад за период

**Endpoint:** `GET /academy/admin/seminars/export-report?period=30d&type=all`
**Response:** PDF файл

**PDF съдържание:**
```
┌─────────────────────────────────────────┐
│  [Logo] DigiBridge Academy              │
│  Pensa Foundation                       │
│  Доклад за семинари                     │
│  Период: 01.03.2026 — 31.03.2026       │
│  Тип: Всички                            │
│  Генериран: 02.04.2026 15:30           │
├─────────────────────────────────────────┤
│  ОБОБЩЕНИЕ                              │
│  Семинари: 8                            │
│  Регистрирани присъствали: 67           │
│  Гости: 23                              │
│  Общо присъствали: 90                   │
│  Средно на семинар: 11.25               │
│  Кредити раздадени: 335                 │
├─────────────────────────────────────────┤
│  СЕМИНАРИ                               │
│  Дата  │Заглавие│Място │Ментор│Рег│Гост│Общо│
│  15.03 │Дигит.. │Надежда│Иван │12 │ 5  │ 17 │
│  16.03 │Интер.. │Онлайн │Бобо │18 │ 0  │ 18 │
│  ...                                    │
└─────────────────────────────────────────┘
```

#### 8b. Списък присъстващи за семинар (за ментора)

**Endpoint:** `GET /academy/admin/seminars/:id/export-attendees`
**Response:** PDF файл

**PDF съдържание:**
```
┌─────────────────────────────────────────┐
│  [Logo] DigiBridge Academy              │
│  Списък записани за семинар             │
│  "Дигитална грамотност за начинаещи"    │
│  Дата: 15.03.2026 | Място: Клуб Надежда│
│  Ментор: Иван Петров                   │
├─────────────────────────────────────────┤
│  РЕГИСТРИРАНИ (12)                      │
│  # │ Име           │ Имейл    │ Телефон │
│  1 │ Мария Иванова │ maria@.. │ 0888... │
│  2 │ Стоян Димитров│ stoyan@..│ 0899... │
│  ...                                    │
├─────────────────────────────────────────┤
│  ГОСТИ (5)                              │
│  # │ Име           │ Имейл    │ Телефон │
│  1 │ Петър Георгиев│ petar@.. │ —       │
│  ...                                    │
├─────────────────────────────────────────┤
│  ОБЩО ЗАПИСАНИ: 17                      │
└─────────────────────────────────────────┘
```

**Бутон "Свали списък"** в `SeminarAttendancePage` — менторът го сваля преди присъствен семинар за да свери на място кои са записани.

---

### Стъпка 9: Физически списъци — качване и съхранение

#### 9a. Migration — нова таблица

**Таблица:** `seminar_attendance_lists`

| Колона | Тип | Описание |
|--------|-----|----------|
| id | INTEGER PK | Auto-increment |
| seminar_id | INTEGER FK | Към seminars |
| uploaded_by | INTEGER FK | Към user_accounts (кой е качил) |
| file_url | TEXT | URL от Firebase Storage |
| file_name | VARCHAR(255) | Оригинално име на файла |
| file_type | VARCHAR(50) | MIME type (image/jpeg, application/pdf) |
| file_size | INTEGER | Размер в bytes |
| notes | TEXT | Бележки (незадължително) |
| created_at | TIMESTAMP | Кога е качен |

#### 9b. Model

**Файл:** `server/src/sequelize/models/seminar_attendance_list.js`
- belongsTo seminar
- belongsTo user_account (uploadedBy)

#### 9c. Endpoints

| Метод | Path | Описание |
|-------|------|----------|
| POST | `/academy/seminars/:id/attendance-list` | Качване (Firebase Storage → save URL) |
| GET | `/academy/seminars/:id/attendance-lists` | Списък качени документи |
| DELETE | `/academy/seminars/:id/attendance-list/:listId` | Изтриване |

#### 9d. Frontend

В `SeminarAttendancePage` → нова секция "Физически списъци":
- Drag & drop зона за качване (снимки/PDF)
- Текстово поле за бележки
- Списък с качени документи (име, размер, дата, бутон изтрий)
- Preview на снимки, линк за PDF

---

## 📁 Всички файлове за създаване/промяна

### Нови файлове:
| Файл | Описание |
|------|----------|
| `server/src/sequelize/migrations/XXXXXX-add-converted-to-user-id.js` | Нова колона |
| `server/src/sequelize/migrations/XXXXXX-create-seminar-attendance-lists.js` | Нова таблица |
| `server/src/sequelize/models/seminar_attendance_list.js` | Нов модел |
| `client/src/components/AdminAcademySeminarsList/AdminSeminarStatistics/AdminSeminarStatistics.jsx` | Нов компонент |
| `client/src/components/AdminAcademySeminarsList/AdminSeminarStatistics/adminSeminarStatistics.css` | CSS |

### Промени в съществуващи файлове:
| Файл | Какво се променя |
|------|-----------------|
| `server/src/controllers/seminarsController.js` | 5 нови endpoints (guest-register, statistics, attendance-detail, export-report, export-attendees, attendance-list CRUD) |
| `server/src/controllers/authController.js` | При register → проверка за гост записи → кредити |
| `server/src/sequelize/models/seminar_guest_attendance.js` | Добавяне на convertedToUserId |
| `client/src/components/AcademySeminars/AcademySeminarDetail/AcademySeminarDetail.jsx` | Обновен auth модал + гост форма |
| `client/src/components/AcademySeminars/AcademySeminarDetail/academySeminarDetail.css` | Стилове за гост форма |
| `client/src/components/AdminAcademySeminarsList/AdminAcademySeminarsList.jsx` | Нов таб "Статистика" |
| `client/src/components/AdminAcademySeminarsList/SeminarAttendancePage/SeminarAttendancePage.jsx` | Бутон "Свали списък" + секция физически списъци |
| `client/src/components/Services/academyCoursesService.jsx` | Нови API методи |
| `client/src/components/contexts/AcademyCoursesProvider.jsx` | Нови функции в context |

---

## 🔄 Ред на изпълнение

### Фаза A — Гост записване
1. ✅ Migration + model update за `convertedToUserId`
2. ✅ Backend: `POST /:id/guest-register` endpoint
3. ✅ Frontend: Обновен auth модал (два варианта)
4. ✅ Frontend: Гост форма + submit логика
5. ✅ Backend: Кредити при регистрация за бивши гости

### Фаза A-1 — График по дни (Семинарни сесии)

**Контекст:** Присъствените семинари могат да се провеждат в няколко дни (напр. 3-5 април). Потребителите трябва да могат да изберат кои дни да присъстват. Менторите маркират присъствие per-session.

#### A1-1. Миграции — нови таблици
- [ ] `seminar_sessions` таблица:
  - `id` INTEGER PK
  - `seminar_id` INTEGER FK → seminars
  - `date` DATE — конкретна дата на сесията
  - `start_time` TIME — начален час (напр. 10:00)
  - `end_time` TIME — краен час (напр. 12:00)
  - `location` VARCHAR — място (може да е различно от основния семинар)
  - `max_participants` INTEGER nullable — лимит за тази сесия
  - `notes` TEXT nullable — бележки за деня
  - `created_at`, `updated_at` TIMESTAMPS

- [ ] `session_attendance` таблица:
  - `id` INTEGER PK
  - `session_id` INTEGER FK → seminar_sessions
  - `student_id` INTEGER FK nullable → students (за регистрирани)
  - `guest_attendance_id` INTEGER FK nullable → seminar_guest_attendances (за гости)
  - `attended` BOOLEAN default false
  - `attended_at` DATETIME nullable
  - `participation_level` VARCHAR default 'passive'
  - `earned_credits` INTEGER default 0
  - `marked_by` INTEGER FK nullable → user_accounts
  - `created_at` TIMESTAMP

#### A1-2. Модели
- [ ] `seminar_session.js` — belongsTo seminar, hasMany session_attendance
- [ ] `session_attendance.js` — belongsTo seminar_session, belongsTo student, belongsTo seminar_guest_attendance

#### A1-3. Backend — CRUD за сесии
- [ ] `POST /academy/seminars/:id/sessions` — създаване на сесии (масив от дни)
- [ ] `GET /academy/seminars/:id/sessions` — списък сесии за семинар
- [ ] `PUT /academy/seminars/:id/sessions/:sessionId` — редакция на сесия
- [ ] `DELETE /academy/seminars/:id/sessions/:sessionId` — изтриване

#### A1-4. Backend — Записване per-session
- [ ] Обновяване на `POST /academy/enrollment/seminars/:id/register`:
  - Приема `sessionIds[]` — кои дни потребителят избира
  - Създава `session_attendance` запис за всяка избрана сесия
  - `student_seminar` остава като "записан за семинара"
- [ ] Обновяване на `POST /academy/seminars/:id/guest-register`:
  - Приема `sessionIds[]` за гости
  - Създава `session_attendance` с `guest_attendance_id`

#### A1-5. Backend — Присъствие per-session
- [ ] Обновяване на `POST /academy/seminars/:id/attendance/bulk-mixed`:
  - Приема `sessionId` — за коя сесия се маркира присъствие
  - Обновява `session_attendance.attended = true`
  - Кредити per-session: `seminar.creditsForAttendance / totalSessions` или фиксирана стойност
- [ ] Нов endpoint: `GET /academy/seminars/:id/sessions/:sessionId/attendance` — присъствие за конкретна сесия

#### A1-6. Frontend — Създаване на сесии (SeminarCreateForm)
- [ ] Нова секция "График" в `SeminarSchedule.jsx`:
  - Бутон "+ Добави ден"
  - За всеки ден: дата picker, начален час, краен час, място (optional override)
  - Бутон за изтриване на ден
  - Визуален calendar/timeline изглед
- [ ] При submit → изпраща `sessions[]` масив заедно със семинарните данни

#### A1-7. Frontend — Избор на ден при записване (AcademySeminarDetail)
- [ ] Нова секция "График" в детайлите:
  - Показва всички сесии като карти/таблица (дата, час, място, свободни места)
  - Checkbox за всеки ден — потребителят избира кои дни ще присъства
  - При "Запиши се" → изпраща избраните `sessionIds`
- [ ] За гости: същият избор в гост формата

#### A1-8. Frontend — Присъствие per-session (SeminarAttendancePage)
- [ ] Таб/dropdown за избор на сесия (ден)
  - Менторът избира кой ден маркира присъствие
  - Показва записаните за ТОЗИ ден
  - Маркира присъствие за конкретната сесия

#### A1-9. SMS/Email напомняне per-session
- [ ] `seminarReminderCron.js` — изпраща напомняне per-session (1ч и 24ч преди конкретния ден)
- [ ] Email template: показва конкретния ден, час, място

#### A1-10. Статистика update
- [ ] Обновяване на statistics endpoint:
  - Общо сесии проведени
  - Присъствие per-session
  - Средно присъстващи per-session (не per-seminar)

**Засегнати файлове:**
- 2 нови миграции
- 2 нови модела (seminar_session, session_attendance)
- `seminarsController.js` — CRUD за сесии + обновени attendance endpoints
- `academyEnrollmentController.js` — записване с sessionIds
- `SeminarSchedule.jsx` — секция "График"
- `AcademySeminarDetail.jsx` — избор на ден
- `SeminarAttendancePage/AttendanceForm.jsx` — per-session маркиране
- `seminarReminderCron.js` — per-session напомняния
- `academyCoursesService.jsx` — нови API методи
- `AcademyCoursesProvider.jsx` — нови функции

---

### Фаза B — Статистика
6. ✅ Backend: `GET /admin/seminars/statistics` endpoint
7. ✅ Backend: `GET /admin/seminars/:id/attendance-detail` endpoint
8. ✅ Frontend: `AdminSeminarStatistics` компонент
9. ✅ Frontend: Overview карти + Recharts графика
10. ✅ Frontend: Таблица семинари + expandable rows
11. ✅ Frontend: Търсене + филтри
12. ✅ Интеграция: нов таб в AdminAcademySeminarsList

### Фаза C — Export и списъци
13. ✅ Backend: PDF export доклад endpoint
14. ✅ Backend: PDF export присъстващи endpoint
15. ✅ Frontend: Бутон "Свали доклад" в Статистика
16. ✅ Frontend: Бутон "Свали списък" в SeminarAttendancePage
17. ✅ Migration + model за `seminar_attendance_lists`
18. ✅ Backend: CRUD endpoints за физически списъци
19. ✅ Frontend: Качване + списък в SeminarAttendancePage

---

## ✅ Проверка (Verification)

### Проблем 1:
- [ ] Нелогнат потребител → семинар → "Запиши се" → модал с два варианта
- [ ] "Продължи като гост" → форма → попълни → submit → success
- [ ] Записът се вижда в `admin/seminar-attendance` като гост
- [ ] Имейл потвърждение пристига (ако е дал email)
- [ ] SMS пристига (ако е дал телефон)
- [ ] Регистрация с имейл на бивш гост → получава кредити за минали семинари
- [ ] Гост записът има `convertedToUserId` след регистрация

### Проблем 2:
- [ ] Админ → Семинари → таб "Статистика" → overview карти (семинари, присъствали, средно)
- [ ] Recharts графика — семинари и присъстващи по месеци
- [ ] Филтри: период (7д/30д/6м/1г) + тип (всички/присъствени/онлайн)
- [ ] Таблица семинари с 3 колони за присъствали (регистрирани/гости/общо)
- [ ] Клик на семинар → разгъва 3 таба (Всички/Регистрирани/Гости)
- [ ] Търсене по заглавие + търсене по участник
- [ ] "Свали доклад" → PDF с overview + таблица
- [ ] SeminarAttendance → "Свали списък" → PDF за ментора
- [ ] Качване на физически списък → Firebase → запис в DB → показва се в списъка

---

## 📝 Важни бележки

- **Два типа семинари:** присъствени (`isOnline: false`) и онлайн (`isOnline: true`)
- **Гостите НЕ получават кредити** — само регистрирани потребители
- **При регистрация** бивш гост получава МИНИМАЛНИ кредити (`creditsForAttendance`)
- **Админи и ментори** НЕ получават кредити (проверено в enrollment)
- **PDFKit** е инсталиран на сървъра — ползва се за PDF export
- **Recharts v2.12.7** е инсталиран на клиента — ползва се за графики
- **DejaVuSans.ttf** в `server/src/fonts/` — за кирилица в PDF
- **Firebase Storage** — за качване на физически списъци (`academy/attendance-lists/`)
- **Шаблони за имейл** — `seminarEmailTemplates.js` (guestNotification за гости)
- **SMS** — `smsService.js` (sendRegistrationSms)
