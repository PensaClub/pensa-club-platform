# 📋 План: Регистрация на гост чрез покана (Seminar Guest → User Invitation)

**Дата:** 2026-04-08
**Статус:** ✅ Имплементирано (2026-04-09) — предстои тестване в production
**Комит:** не е комитнат — ще се тества директно в production след deploy

---

## 🎯 Цел и контекст

В `SeminarAttendancePage` в момента гостите се записват в таблицата `seminar_guest_attendance` с име/имейл/телефон, но **нямат платформен акаунт** и не могат да влизат в pensa.club. Искаме **опционален** flow, чрез който администратор/ментор може да покани гост да стане пълноправен потребител чрез имейл.

### Ключов принцип

Това **НЕ е автоматично** при записване на гост. Админът първо добавя госта нормално, а после (ако прецени) кликва отделен бутон **"Регистрирай гост"** до записа на госта. Едва тогава системата праща имейл с линк за регистрация.

### Готова подготовка в кода (вече съществуваща)

- ✅ `seminar_guest_attendance.convertedToUserId` поле вече съществува — готово за линкване
- ✅ `user_account.password` е `allowNull: true` — може да създадем акаунт без парола първоначално
- ✅ Role `'user'` съществува в ENUM на `user_account`
- ✅ `sendProjectEmail` в `zohoEmails.js` има готов визуален шаблон, който копираме
- ✅ `/auth/login` endpoint-ът показва точния pattern за auto-login (JWT + httpOnly cookie)
- ✅ Съществуващата логика за добавяне на гост проверява само за дубликати в конкретен семинар — не блокира случаи, в които user вече съществува без да е записан за този семинар

---

## ⚙️ Одобрени параметри

| Параметър | Стойност |
|---|---|
| **Валидност на линка** | **7 дни** (168h) |
| **Token format** | UUID v4 |
| **Token storage** | Нови колони `invitation_token` + `invitation_expiration` в `user_account` |
| **Role на създадения user** | `'student'` (не `'user'`) — при клик "Регистрирай гост" гостът става директно student на платформата |
| **Initial `finished`** | `false` → става `true` след приемане на поканата |
| **Auto-login след приемане** | JWT access token + httpOnly refresh cookie (като `/login`) |
| **Име на бутона** | "Регистрирай гост" |
| **Email from** | `info@pensa.club` (Zoho) |
| **Контакт в имейла — телефон** | +359 89 579 4214 |
| **Контакт в имейла — имейл** | pensa.club@gmail.com |
| **Frontend URL format** | `${FRONTEND_SERVER}/accept-invitation?token=xxx` |
| **Страница с персонализация** | ДА — GET endpoint валидира token и връща име + семинар преди формата |
| **Ако имейлът вече е регистриран** | Auto-link към съществуващия user + преместване в регистрираните + модал (НЕ toast) |
| **Timing на student/student_seminar създаване** | **Вариант X:** Веднага при клик "Регистрирай гост" — и двата сценария (нов user + съществуващ user) минават през пълна конверсия до student в същия момент |
| **Съдба на `seminar_guest_attendance` запис** | Изтрива се след успешна конверсия (гостът вече е пълноправен student) |

---

## 🏗️ Архитектура (следвайки проектните правила)

**Поток на данните:** `Services → Contexts → Components`

```
┌─────────────────────────┐
│      Backend API        │
│  (authController,       │
│   seminarsController)   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Services (client)     │
│ userService,            │
│ academyCoursesService   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Context Providers     │
│ UserContext,            │
│ AcademyCoursesProvider  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│      Components         │
│ AttendanceForm,         │
│ AcceptInvitation        │
└─────────────────────────┘
```

**⚠️ Правило:** НЕ се правят директни service calls от компонентите. Всичко минава през контексти.

---

## 📊 Обобщение на имплементацията

| Фаза | Статус | Коментар |
|---|---|---|
| **1. Backend** | ✅ Готово | Migration + schema + email helper + 3 endpoints |
| **2. Services** | ✅ Готово | `userService` + `academyCoursesService` |
| **3. Contexts** | ✅ Готово | `AcademyCoursesProvider` + `UserContext` |
| **4. AttendanceForm UI** | ✅ Готово | Бутон + handler + 2 модала (invite + email conflict) |
| **5. AcceptInvitation page** | ✅ Готово | Нов компонент + route + 3 translation файла (BG/EN/DE) |
| **6. Testing** | ⏳ Предстои | Ще се тества директно в production |

### Допълнителни неща, които се направиха извън оригиналния план

1. **Проверка при добавяне на гост** (допълнителна функционалност):
   - Server-side: `bulkMixedAttendance` проверява дали `guestEmail` вече е регистриран user
   - Ако да → пропуска създаването на guest и връща `existingUserConflicts` в response
   - Client-side: `AttendanceForm` показва модал с опция "Регистрирай като потребител"
   - При потвърждение → добавя като platform attendee (автоматично upgrade на role + credits)
   - **Преводи:** BG / EN / DE

2. **Fail-safe логика в invite endpoint** (bug fix за legacy records):
   - Премахната строгата проверка `if (guestRecord.convertedToUserId) → error`
   - Добавен нов сценарий `already_registered` — за случаи когато user вече е в `student_seminar` с `attended: true`
   - В този случай: **не дава нови кредити**, НЕ пипа role-а, само изтрива дублиращия guest запис
   - Модал за `already_registered` с подходящ текст ("Участникът вече е в регистрираните")

3. **`attendance/full` endpoint обновен** — вече връща `convertedToUserId` в guest обекта (необходимо за правилно скриване на бутона "Регистрирай гост" от client-а)

4. **Bug fix за `user_details` validation** — експлицитно подаване на `workOptions: null`, `skills: null`, `interestOptions: null` при create, защото Sequelize validators третират undefined като "не е array" и хвърлят грешка

5. **Забравени преводи — добавени:**
   - `attendanceList.*` — всички таб ключове (lists/photos/videos/presentations) и upload error messages за AttendanceListUpload
   - `attendanceForm.*` — всички нови ключове за invite button, modals, conflict dialog

---

## 📂 Фаза 1: Backend

### 1.1 DB Migration

**Нов файл:** `server/src/sequelize/migrations/YYYYMMDDHHMMSS-add-invitation-token-to-user-account.js`

```javascript
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_accounts', 'invitation_token', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('user_accounts', 'invitation_expiration', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_accounts', 'invitation_token');
    await queryInterface.removeColumn('user_accounts', 'invitation_expiration');
  },
};
```

**Update:** `server/src/sequelize/models/user_account.js` — добавя двете полета:
```javascript
invitation_token: DataTypes.STRING,
invitation_expiration: DataTypes.DATE,
```

### 1.2 Zod Schemas

**Нов файл:** `server/src/schemas/invitation.schema.js`

```javascript
const { z } = require('zod');
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  newPassword: z.string().regex(passwordRegex, 'Min 8 chars, at least one letter and one number.'),
  reNewPassword: z.string().min(1, 'Repeat password is required.'),
}).refine(d => d.newPassword === d.reNewPassword, {
  message: 'Passwords do not match.',
  path: ['reNewPassword'],
});

module.exports = { acceptInvitationSchema };
```

### 1.3 Email helper

**Update:** `server/src/utils/zohoEmails.js` — нова функция `sendGuestInvitationEmail`

Визуалният стил копира `sendProjectEmail`:
- Orange gradient header с Pensa логото
- Заглавие: "Добре дошли в Pensa Club!"
- Поздрав: "Здравей, [Име]!"
- Обяснение: "Бяхте поканен да се регистрирате в Pensa Club след участието Ви в семинар **[Заглавие на семинар]**"
- Info box (зелен градиент) с:
  - "⏱️ Линкът е валиден до: [дата и час]"
  - "✉️ Имейл: [guestEmail]"
- CTA бутон: "✅ Завърши регистрацията"
- Footer:
  - 📞 **+359 89 579 4214**
  - 📧 **pensa.club@gmail.com**
  - Текст: "Ако не желаете да се регистрирате, просто игнорирайте това съобщение"

Signature:
```javascript
async function sendGuestInvitationEmail({ email, firstName, lastName, seminarTitle, invitationToken, expiresAt })
```

### 1.4 Endpoint: Регистрирай гост (full conversion + покана)

**Файл:** `server/src/controllers/seminarsController.js`
**Route:** `POST /academy/seminars/admin/guests/:id/invite`
**RBAC:** `seminar:update`

**Целта:** При клик на "Регистрирай гост" извършваме пълна конверсия от гост към пълноправен участник на семинара — с student запис, student_seminar запис (attended=true + кредити), role='student', и (за нов user) праща се имейл за създаване на парола. `seminar_guest_attendance` записът се изтрива.

**Общ поток (и за двата сценария):**

1. **Намира** `seminar_guest_attendance` запис по `:id`, линкнат към семинара
2. **Validations:**
   - Ако няма `guestEmail` → **400** `"Guest has no email"`
   - Ако `convertedToUserId != null` → **400** `"Guest already converted"`
3. **Зарежда семинара** (за `creditsForAttendance`, `creditsForParticipation`, `title`)
4. **Проверка за съществуващ user** с този имейл → разклонение:

---

#### 🟢 Сценарий A — Нов user (имейлът не е в DB)

5. **Създава нов `user_account`:**
   - `email` = guestEmail
   - `password` = null
   - `role` = `'student'` (директно, не 'user')
   - `finished` = false
   - `invitation_token` = `uuid.v4()`
   - `invitation_expiration` = now + 7 дни
6. **Създава `user_details`** запис с `firstName` / `lastName` / `phoneNumber` от госта
7. **Създава `student`** запис: `{ userId: newUser.id, status: 'active' }`
8. **Създава `student_seminar`** запис за този семинар:
   - `studentId` = new student.id
   - `status` = `'approved'`
   - `attended` = true
   - `attendedAt` = now
   - `participationLevel` = наследено от `seminar_guest_attendance.participationLevel` (обикновено `'passive'`)
   - `earnedCredits` = calculated (като в съществуващата логика, без privilege bypass)
   - `approvedBy` = `req.user.userId`
   - `approvedAt` = now
9. **Изтрива** `seminar_guest_attendance` записа
10. **Праща invitation email** чрез `sendGuestInvitationEmail`:
    - Ако fail-не → не хвърля грешка, логва и връща `emailSent: false`
11. **Връща 200** с:
    ```json
    {
      "message": "Guest successfully registered and invited",
      "scenario": "new_user",
      "emailSent": true,
      "userId": 123
    }
    ```

---

#### 🟡 Сценарий B — Имейлът вече съществува като user

5. Намира `existingUser = user_account.findOne({ where: { email: guestEmail } })`
6. **Намира/създава `student`** запис:
   - Ако няма → `student.create({ userId: existingUser.id, status: 'active' })`
7. **Upgrade на role** (ако е `'user'` или `'guest'`) → `'student'` (като в съществуващата логика в seminarsController.js:3761-3765):
   ```javascript
   if (['user', 'guest'].includes(existingUser.role)) {
     await existingUser.update({ role: 'student' });
   }
   ```
   (НЕ пипа `'admin'`, `'moderator'`, `'mentor'`)
8. **Проверява за вече съществуващ `student_seminar`** за този семинар + student:
   - Ако съществува и `attended === true` → само записваме факта, без нови кредити (като съществуващата логика)
   - Ако съществува но не е attended → `update({ attended: true, attendedAt: now, participationLevel, earnedCredits })`
   - Ако НЕ съществува → `create({ ... attended: true, earnedCredits })` (privilege check за admin/mentor, без credits за тях)
9. **Изтрива** `seminar_guest_attendance` записа
10. **НЕ праща имейл** (съществуващият user вече може да си влезе с съществуващата си парола)
11. **Връща 200** с:
    ```json
    {
      "message": "Existing user linked and registered as student",
      "scenario": "existing_user",
      "emailSent": false,
      "userId": 456,
      "existingUserEmail": "ivan@example.com",
      "roleUpgraded": true
    }
    ```

---

**Важно за двата сценария:**
- Transaction: цялата логика трябва да е в Sequelize transaction (`sequelize.transaction`), за да няма partial state при грешка
- Logging: `console.log` с prefix `[REGISTER GUEST]` за debug
- Error handling: при грешка → `next(err)` + транзакцията се rollback-ва

### 1.5 Endpoint: Валидация на token (за персонализирана страница)

**Файл:** `server/src/controllers/authController.js`
**Route:** `GET /auth/invitation/:token`
**Публичен (без auth)**

**Flow:**
1. Намира user по `invitation_token = req.params.token`
2. Ако няма → **404** `"Invalid invitation"`
3. Ако `invitation_expiration < Date.now()` → **400** `"Invitation expired"`
4. Намира последния семинар, към който този user е линкнат чрез `convertedToUserId` (за да покажем в welcome page-а)
5. Връща **200** с:
   ```json
   {
     "firstName": "Иван",
     "lastName": "Петров",
     "email": "ivan@example.com",
     "expiresAt": "2026-04-15T10:30:00Z",
     "seminarTitle": "Компютърна грамотност — първи стъпки"
   }
   ```

### 1.6 Endpoint: Приемане на покана

**Файл:** `server/src/controllers/authController.js`
**Route:** `POST /auth/accept-invitation`
**Публичен (без auth)**

**Flow:**
1. Zod валидация (`acceptInvitationSchema`)
2. Намира user по `invitation_token`
3. Ако няма → **404** `"Invalid or expired invitation"`
4. Ако `invitation_expiration < Date.now()` → **400** `"Invitation expired"`
5. Hash-ва паролата с bcrypt (rounds=10)
6. Update user:
   - `password` = hashed
   - `invitation_token` = null
   - `invitation_expiration` = null
   - `finished` = true
7. Генерира access JWT + refresh JWT (reusing `tokenGenerator`)
8. Създава `refreshToken` запис в DB
9. Сет-ва `res.cookie('refreshJwtToken', ...)` със същите опции като `/login` (httpOnly, secure, sameSite, maxAge)
10. Връща **200** с `{ message, user, token }` — същия формат като `/login`

---

## 🔌 Фаза 2: Frontend Services layer

### 2.1 `userService.jsx`

**Файл:** `client/src/components/Services/userService.jsx`
**Добавя:**
```javascript
acceptInvitation: (data) => {
  return requester.post(`${apiUrl}/auth/accept-invitation`, data);
},
getInvitation: (token) => {
  return requester.get(`${apiUrl}/auth/invitation/${token}`);
},
```

### 2.2 `academyCoursesService.jsx`

**Файл:** `client/src/components/Services/academyCoursesService.jsx`
**Добавя:**
```javascript
inviteGuestToRegister: (guestAttendanceId) => {
  return requester.post(`${apiUrl}/academy/seminars/admin/guests/${guestAttendanceId}/invite`);
},
```

---

## 🔗 Фаза 3: Context Providers

### 3.1 `AcademyCoursesProvider.jsx`

**Файл:** `client/src/components/contexts/AcademyCoursesProvider.jsx`

```javascript
const inviteGuestToRegister = useCallback(async (guestAttendanceId) => {
  try {
    const res = await academyCoursesService.inviteGuestToRegister(guestAttendanceId);
    return res.data; // { message, emailSent, linkedToExisting, existingUserEmail }
  } catch (err) {
    const msg = err.response?.data?.message || 'Грешка при изпращане на покана';
    toast.error(msg);
    throw err;
  }
}, []);

// В return експорта:
return <AcademyCoursesContext.Provider value={{
  ...existingValues,
  inviteGuestToRegister,
}}>...
```

### 3.2 `UserContext.jsx` (или където е auth context-ът)

```javascript
const acceptInvitation = useCallback(async (data) => {
  try {
    const res = await userService.acceptInvitation(data);
    // Auto-login: запазва auth state
    localStorage.setItem('auth', JSON.stringify({
      user: res.data.user,
      token: res.data.token,
    }));
    setUser(res.data.user);
    setIsAuthentication(true);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'Невалидна или изтекла покана';
    toast.error(msg);
    throw err;
  }
}, [setUser, setIsAuthentication]);

const getInvitation = useCallback(async (token) => {
  try {
    const res = await userService.getInvitation(token);
    return res.data;
  } catch (err) {
    throw err;
  }
}, []);
```

---

## 🎨 Фаза 4: AttendanceForm UI — бутон и модал

### 4.1 Бутон "Регистрирай гост"

**Файл:** `client/src/components/AdminAcademySeminarsList/SeminarAttendancePage/AttendanceForm/AttendanceForm.jsx`

В render-а на списъка с участници, за всеки **гост**:
```jsx
{p.type === 'guest' && !p.convertedToUserId && p.email && (
  <button
    className="satf-btn-invite-guest"
    onClick={() => handleInviteGuest(p.id)}
    disabled={invitingGuestId === p.id}
    title="Регистрирай гост"
  >
    {invitingGuestId === p.id ? <Loader2 size={14} className="satf-spin" /> : <UserPlus size={14} />}
    Регистрирай гост
  </button>
)}

{p.type === 'guest' && p.convertedToUserId && (
  <span className="satf-badge-registered">
    <CheckCircle size={12} /> Регистриран
  </span>
)}

{p.type === 'guest' && !p.email && (
  <span className="satf-no-email" title="Не може да бъде регистриран без имейл">—</span>
)}
```

### 4.2 Handler + модал

```javascript
const { inviteGuestToRegister } = useAcademyCourses();
const [invitingGuestId, setInvitingGuestId] = useState(null);
const [existingUserModal, setExistingUserModal] = useState(null);

const handleInviteGuest = async (guestAttendanceId) => {
  setInvitingGuestId(guestAttendanceId);
  try {
    const result = await inviteGuestToRegister(guestAttendanceId);
    if (result.scenario === 'existing_user') {
      // Показва МОДАЛ (НЕ toast) — съществуващ user е преместен в регистрираните
      setExistingUserModal({
        email: result.existingUserEmail,
        roleUpgraded: result.roleUpgraded,
      });
    } else if (result.scenario === 'new_user' && result.emailSent) {
      toast.success(`✓ Гостът е регистриран. Поканата е изпратена на имейла.`);
    } else if (result.scenario === 'new_user' && !result.emailSent) {
      toast.warning(`Гостът е регистриран, но имейлът не се изпрати. Свържете се ръчно.`);
    }
    await fetchParticipants(); // refresh — гостът вече е в регистрираните
  } catch {
    // toast вече е показан от provider-а
  } finally {
    setInvitingGuestId(null);
  }
};
```

### 4.3 Модал за съществуващ потребител

Нов JSX блок в AttendanceForm:
```jsx
{existingUserModal && (
  <div className="satf-modal-overlay" onClick={() => setExistingUserModal(null)}>
    <div className="satf-modal" onClick={e => e.stopPropagation()}>
      <div className="satf-modal-icon"><Info size={32} /></div>
      <h3>Потребителят вече е регистриран в платформата</h3>
      <p>
        Имейлът <strong>{existingUserModal.email}</strong> вече съществува като регистриран потребител в Pensa Club.
      </p>
      <p>
        Гостът беше автоматично преместен в списъка с <strong>регистрирани участници</strong> на семинара
        {existingUserModal.roleUpgraded && ', а ролята му в платформата беше обновена на student'}.
      </p>
      <p>
        Няма нужда да изпращате покана — потребителят може да влезе с съществуващите си данни за вход.
      </p>
      <button className="satf-modal-btn" onClick={() => setExistingUserModal(null)}>
        Разбрах
      </button>
    </div>
  </div>
)}
```

### 4.4 CSS

**Файл:** `client/src/components/AdminAcademySeminarsList/SeminarAttendancePage/AttendanceForm/attendanceForm.css`

Стилове за:
- `.satf-btn-invite-guest` — primary-style бутон (златист/теал, иконка + текст)
- `.satf-badge-registered` — зелен badge с иконка
- `.satf-no-email` — сиво, italic, disabled look
- `.satf-modal-overlay` + `.satf-modal` — modal dialog
- `.satf-modal-icon` — голяма иконка в горната част на модала
- `.satf-modal-btn` — primary бутон за затваряне

Responsive (≤767px) и поддръжка на light/dark theme.

---

## 📝 Фаза 5: AcceptInvitation page

### 5.1 Нов компонент

**Файл:** `client/src/components/AcceptInvitation/AcceptInvitation.jsx`
**CSS prefix:** `aci-`
**i18n namespace:** `acceptInvitation`

### 5.2 Flow

1. **На mount:** извлича `token` от query param (`useSearchParams`)
2. Извиква `getInvitation(token)` от UserContext
3. **Loading state:** показва spinner "Проверка на поканата..."
4. **Success state:** показва персонализирана welcome страница:
   - Логото на Pensa
   - "Здравей, **[firstName] [lastName]**!"
   - "Благодарим Ви за участието в семинар **[seminarTitle]**!"
   - "За да завършите регистрацията си в Pensa Club, моля изберете парола:"
   - Форма:
     - Имейл (read-only, от response)
     - Парола (с show/hide toggle)
     - Повтори парола
     - Checkbox: "Съгласен съм с [Условията за ползване](/terms) и [Политиката за поверителност](/privacy)"
     - Бутон "Завърши регистрацията"
   - Мало текст отдолу: "Линкът е валиден до **[expiresAt]**"
5. **Error state (invalid/expired token):**
   - Иконка за грешка
   - "Линкът вече не е валиден"
   - Обяснение: "Този линк за регистрация е изтекъл или е невалиден."
   - Контакти:
     - 📞 +359 89 579 4214
     - 📧 pensa.club@gmail.com
   - Бутон "Към началната страница"
6. **On form submit:**
   - Извиква `acceptInvitation({ token, newPassword, reNewPassword })`
   - На успех: toast + navigate('/') — auto-logged-in
   - На грешка: toast-а вече е показан от provider-а

### 5.3 Route

**Файл:** `client/src/App.jsx`

Нов route извън `LanguageWrapper` (публичен като `/reset-password`):
```jsx
<Route path="/accept-invitation" element={<AcceptInvitation />} />
```

### 5.4 Translations

Нови файлове:
- `client/public/locales/bg/acceptInvitation.json`
- `client/public/locales/en/acceptInvitation.json`
- `client/public/locales/de/acceptInvitation.json`

Ключове: welcome, instruction, emailLabel, passwordLabel, repeatLabel, termsLabel, submitBtn, validUntil, errorTitle, errorDescription, contactPhone, contactEmail, backHome, loadingText.

### 5.5 Responsive дизайн

- Мобилен-first
- Максимална ширина на формата ~420px, центриран на екрана
- Visual style: същата линия като `/reset-password` page-а
- Light/dark theme support

---

## 🧪 Фаза 6: Тестване

### Сценарии за тест:

1. **Happy path — нов user**
   - Админ добавя гост с нов имейл → кликва "Регистрирай гост"
   - Сървър: създава user_account (role='student', invitation_token), user_details, student, student_seminar (attended=true + credits), изтрива guest_attendance, праща имейл
   - Клиент: гостът вече е в списъка с регистрирани участници
   - Гостът получава имейл → клик на линка → вижда персонализирана страница ("Здравей, Иван!") → въвежда парола → директно влиза в платформата

2. **Happy path — съществуващ user**
   - Админ добавя гост с имейл, който вече съществува като user (role='user')
   - Кликва "Регистрирай гост"
   - Сървър: намира user, създава student ако липсва, upgrade-ва role на 'student', създава student_seminar (attended=true + credits), изтрива guest_attendance, НЕ праща имейл
   - Клиент: **показва се модал** (не toast) "Потребителят вече е регистриран в платформата. Преместен в регистрираните + role upgraded"
   - След затваряне на модала — гостът е в списъка с регистрирани участници

3. **Съществуващ user с привилегирована role** (admin/moderator/mentor)
   - Сървър: намира user, създава student ако липсва, **НЕ пипа role-а** (остава admin/mentor/etc.)
   - Създава student_seminar, но без credits (privilege check)
   - Изтрива guest_attendance
   - Модал обяснява, че role-ът НЕ е променен

4. **Гост без имейл**
   - Бутонът "Регистрирай гост" не се показва (показва тире с tooltip "Не може да се регистрира без имейл")

5. **Повторен клик** на вече конвертиран гост
   - Не може да се случи — `seminar_guest_attendance` е изтрит след първата конверсия, гостът вече е в регистрираните

6. **Линк от изтекла покана (7+ дни)**
   - Страницата `/accept-invitation` показва error state с контакти (телефон + имейл)
   - Важно: user_account-ът съществува, но е `finished=false` и няма парола → няма как да влезе без помощ от админ

7. **Линк вече използван**
   - Error state (`invitation_token` е null в DB след приемане)

8. **Грешна парола / mismatch**
   - Zod валидация блокира submit, показва inline грешка

9. **Email sending fails** (Zoho down)
   - User + student + student_seminar са създадени в DB
   - guest_attendance е изтрит
   - Админът получава warning toast: "Гостът е регистриран, но имейлът не се изпрати"
   - Ръчно решение: админът може да получи линка от admin panel или да го прати ръчно

10. **Transaction rollback** (средата на flow-а fail-ва)
    - Ако нещо в сценарий A/B fail-не (напр. DB constraint) → transaction rollback → никакви partial records
    - guest_attendance записът остава непокътнат
    - Админът вижда грешка

11. **Мобилен view**
    - AttendanceForm бутон и модал responsive
    - AcceptInvitation форма responsive

12. **i18n**
    - Тестване на BG/EN/DE версии на email-а и страницата

---

## 📁 Файлове — структура

### Нови файлове

```
server/
  src/
    sequelize/
      migrations/
        YYYYMMDDHHMMSS-add-invitation-token-to-user-account.js   [нов]
    schemas/
      invitation.schema.js                                         [нов]

client/
  src/
    components/
      AcceptInvitation/
        AcceptInvitation.jsx                                       [нов]
        acceptInvitation.css                                       [нов]
  public/
    locales/
      bg/acceptInvitation.json                                     [нов]
      en/acceptInvitation.json                                     [нов]
      de/acceptInvitation.json                                     [нов]
```

### Модифицирани файлове

```
server/
  src/
    sequelize/models/user_account.js                               [+ 2 полета]
    utils/zohoEmails.js                                             [+ sendGuestInvitationEmail]
    controllers/
      authController.js                                             [+ /accept-invitation, /invitation/:token]
      seminarsController.js                                         [+ /admin/guests/:id/invite]

client/
  src/
    App.jsx                                                         [+ route /accept-invitation]
    components/
      Services/
        userService.jsx                                             [+ acceptInvitation, getInvitation]
        academyCoursesService.jsx                                   [+ inviteGuestToRegister]
      contexts/
        AcademyCoursesProvider.jsx                                  [+ inviteGuestToRegister]
        UserContext.jsx (или auth context)                          [+ acceptInvitation, getInvitation]
      AdminAcademySeminarsList/
        SeminarAttendancePage/
          AttendanceForm/
            AttendanceForm.jsx                                      [+ бутон + handler + модал]
            attendanceForm.css                                      [+ стилове за бутон/badge/модал]
```

---

## 🔄 Последователност на имплементация (препоръка)

1. **Backend първо** (за да може клиентът да има истински API за тестване):
   - Миграция + модел
   - Zod schema
   - Email helper (с тест в DEV)
   - 3-те endpoint-а

2. **Services layer** — прост, бърз

3. **Context providers** — update-ват се паралелно със services

4. **AttendanceForm** — бутон, handler, модал, стилове (може да се тества веднага с backend-а)

5. **AcceptInvitation page** — последен (финал на flow-а)

6. **Translations** — паралелно с компонентите

7. **End-to-end тест** — всички 10 сценария

---

## 📌 Отворени въпроси (ако излязат по време на имплементация)

- Трябва ли съществуващи гости (вече записани преди тази функционалност) да могат да бъдат поканени? Отговор: Да — бутонът се показва за ВСИЧКИ гости, които имат email и `convertedToUserId == null`.
- Какво се случва ако `INVITATION_EXPIRY_HOURS` трябва да се промени? Отговор: засега hardcoded 168h, може да се изнесе в env променлива по-късно.
- Трябва ли да логваме действието "invitation sent" някъде за audit? Отговор: НЕ за v1 — ако се наложи ще се добави в admin_notification или нова таблица.

---

## ✅ Потвърдени решения

- [x] Валидност: **7 дни**
- [x] Role на създадения user: **'student'** (директна конверсия при клик "Регистрирай гост")
- [x] Име на бутона: **"Регистрирай гост"**
- [x] Variant **B** за question 4: GET endpoint + персонализирана welcome страница
- [x] Variant **A** за question 5: auto-link към съществуващ user, но с **МОДАЛ** (не toast)
- [x] Services → Contexts → Components pattern (съгласно feedback_always_use_provider.md)
- [x] **Вариант X:** Пълна конверсия веднага при клик "Регистрирай гост" — student + student_seminar + role upgrade + изтриване на guest_attendance се случват в един transaction, за двата сценария (нов и съществуващ user). Имейлът се праща само за нов user.
- [x] Всичко в Sequelize transaction за atomicity

---

## 🗂️ Всички засегнати файлове

### Нови файлове
```
server/src/sequelize/migrations/20260408100000-add-invitation-token-to-user-account.js
server/src/schemas/invitation.schema.js
client/src/components/AcceptInvitation/AcceptInvitation.jsx
client/src/components/AcceptInvitation/acceptInvitation.css
client/public/locales/bg/acceptInvitation.json
client/public/locales/en/acceptInvitation.json
client/public/locales/de/acceptInvitation.json
```

### Модифицирани файлове
```
server/src/sequelize/models/user_account.js           [+ invitation_token, invitation_expiration]
server/src/utils/zohoEmails.js                         [+ sendGuestInvitationEmail]
server/src/controllers/authController.js               [+ GET /invitation/:token, POST /accept-invitation]
server/src/controllers/seminarsController.js           [+ POST /admin/guests/:id/invite, + existing-user check in bulk-mixed, + convertedToUserId в attendance/full]

client/src/App.jsx                                     [+ route /accept-invitation + import AcceptInvitation]
client/src/components/Services/userService.jsx        [+ acceptInvitation, getInvitation]
client/src/components/Services/academyCoursesService.jsx  [+ inviteGuestToRegister]
client/src/components/contexts/AcademyCoursesProvider.jsx [+ inviteGuestToRegister]
client/src/components/contexts/UserContext.jsx        [+ acceptInvitation, getInvitation]
client/src/components/AdminAcademySeminarsList/SeminarAttendancePage/AttendanceForm/AttendanceForm.jsx  [+ бутон + 2 модала + handlers]
client/src/components/AdminAcademySeminarsList/SeminarAttendancePage/AttendanceForm/attendanceForm.css  [+ стилове за бутон/badge/модал]

client/public/locales/bg/academy-admin.json           [+ attendanceList.* + attendanceForm.* нови ключове]
client/public/locales/en/academy-admin.json           [+ attendanceList.* + attendanceForm.* нови ключове]
client/public/locales/de/academy-admin.json           [+ attendanceList.* + attendanceForm.* нови ключове]
```

---

## 🧪 Тестване в production

След deploy на production:

1. **Миграцията** `20260408100000-add-invitation-token-to-user-account.js` ще се изпълни автоматично и ще добави колони `invitation_token` + `invitation_expiration` към `user_accounts`

2. **Критични сценарии за проверка:**
   - Добавяне на гост с нов валиден имейл → клик "Регистрирай гост" → проверка дали получава имейл с линк → клик на линка → проверка на welcome страницата → въвеждане на парола → проверка на auto-login
   - Добавяне на гост с имейл на съществуващ user → проверка дали излиза модал (не toast) със съответното съобщение
   - Попълване на form за гост с email на съществуващ user → клик "Запиши гост" → проверка дали излиза модал за email conflict
   - Клик "Регистрирай като потребител" в conflict modal → проверка дали user-ът се добавя директно в регистрираните с upgrade на role-а

3. **⚠️ Known issue:** invitation email-ът се праща от `info@pensa.club` чрез Zoho. Ако Zoho access token-а е изтекъл → auto-refresh чрез refresh token → ако и това fail-не → email няма да се изпрати, но admin ще види warning toast ("Гостът е регистриран, но имейлът не се изпрати. Свържете се ръчно.")
