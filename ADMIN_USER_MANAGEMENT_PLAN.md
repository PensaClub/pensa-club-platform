# 📋 План: Admin User Management — регистрация и password reset от админ

**Дата:** 2026-04-09
**Статус:** ⏳ Чака одобрение

---

## 🎯 Цел и контекст

Нов компонент в `client/src/components/SiteSettingsAdmin/` за **admin-инициирано** управление на потребители:

1. **Сценарий А — Регистрация на нов потребител**
   Admin получава имейл от някого и иска да го регистрира директно (както при guest invitation flow-а от семинарите).

2. **Сценарий Б — Изпращане на reset password линк**
   Admin получава обаждане от потребител, който е забравил паролата си, и иска да му изпрати линк за смяна.

И двата сценария имат **проверка дали имейлът вече е регистриран** — ако да, показваме пълен профил на admin-а да прецени какво да направи.

За **сигурност при reset password**, admin може да изпрати **SMS код** заедно с email линка — потребителят трябва да въведе и двата при смяната.

---

## ⚙️ Одобрени параметри

| Параметър | Стойност |
|---|---|
| **Достъп** | Само `admin` role (RBAC check) |
| **UI компонент** | Един компонент с **2 таба** (Регистрация / Смяна на парола) |
| **SMS код дължина** | **6 цифри** (000000-999999) |
| **SMS код storage** | Нова колона `reset_sms_code_hash` (bcrypt hash, не plain) |
| **Reset token + SMS код валидност** | **24 часа** (целевата група са възрастни хора, които може да не проверяват пощата веднага) |
| **SMS опити** | **5 опита** на грешен код → след това "невалиден код, изпрати нов линк" |
| **Reset token reuse** | Да — използваме `reset_token` + `token_expiration` (24h за admin-инициирани) |
| **Invitation reuse** | Да — използваме `invitation_token` + `invitation_expiration` от guest flow |
| **Без телефон → fallback** | Admin може да: (Б) изпрати БЕЗ SMS, или (В) ръчно въведе телефон |
| **Auto-login след reset** | **НЕ** — запазваме сегашното поведение (user отива на login page след смяна) |
| **Audit log** | **ДА** — детайлни, immutable, 1 година retention |
| **Email sender** | `info@pensa.club` (както при invitation) |
| **Controller** | Нов файл `userManagementController.js` (по-чисто разделение) |
| **Service** | Разширяване на съществуващия `adminService.jsx` |

---

## 🏗 Архитектура

> ⚠️ **ВАЖНО ПРАВИЛО (от MEMORY):** Endpoints в **service**, service в **context (provider)**,
> функция от context се ползва в **компонент**. **НИКОГА** не се вика service директно
> от компонент. Виж `feedback_always_use_provider.md`.

```
┌─────────────────────────┐
│      Backend API        │
│  (authController,       │
│   userManagementCtrl)   │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Services (client)     │  ← endpoints живеят тук
│  adminService.jsx       │
│  userService.jsx        │
└───────────┬─────────────┘
            ↓                  (НЕ се ползва директно
                                от компонент!)
┌─────────────────────────┐
│   Context Providers     │  ← service се wrap-ва тук
│  AdminContext (или      │     useCallback + toast +
│  разширение на          │     error handling
│  UserContext)           │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│      Components         │  ← използват само useContext()
│  UserManagement         │     useAuthContext() и т.н.
│  AdminUserActionLogs    │     НИКАКВИ direct service calls
│  ResetPasswordPage(upd) │
└─────────────────────────┘
```

### Конкретно за тази задача

| Endpoint | Service метод | Context метод | Компонент който го ползва |
|---|---|---|---|
| `GET /admin/users/lookup` | `adminService.lookupUserByEmail()` | `useAdminContext().lookupUserByEmail()` | `UserManagement.jsx` |
| `POST /admin/users/invite` | `adminService.inviteUser()` | `useAdminContext().inviteUser()` | `UserManagement.jsx` |
| `POST /admin/users/send-reset` | `adminService.sendResetLink()` | `useAdminContext().sendResetLink()` | `UserManagement.jsx` |
| `GET /auth/reset-info/:token` | `userService.getResetTokenInfo()` | `useAuthContext().getResetTokenInfo()` | `ResetPasswordPage.jsx` |
| `GET /admin/user-actions` | `adminService.getUserActionLogs()` | `useAdminContext().getUserActionLogs()` | `AdminUserActionLogs.jsx` |
| `GET /admin/user-actions/export` | `adminService.exportUserActionLogs()` | `useAdminContext().exportUserActionLogs()` | `AdminUserActionLogs.jsx` |

**В компонента изглежда така:**
```jsx
// ✅ ПРАВИЛНО
const { lookupUserByEmail, inviteUser } = useAdminContext();
const handleClick = async () => {
  const result = await lookupUserByEmail(email);
};

// ❌ ЗАБРАНЕНО (нарушение на правилото)
import { adminServiceFactory } from '../Services/adminService';
const adminService = adminServiceFactory();
const result = await adminService.lookupUserByEmail(email);
```

---

## 🧪 Phase 1 — Testing Flow след deploy

> Тази секция описва **точно** какво да тестваме след като Phase 1 (Backend) бъде deploy-нат на production. Тестовете покриват и риск поправките (#1, #2, #3, #6).

### Pre-deploy checklist

- [ ] Всички файлове са commit-нати в `develop`
- [ ] `develop` merge-нат в `main`
- [ ] Auto-deploy е стартирал
- [ ] Изчакай 2-5 минути за GitHub Actions

### Post-deploy: Database проверки

#### ✅ 1. Verify миграциите са приложени

```bash
ssh root@185.123.188.236
docker exec digital-literacy-wellbeing-60-plus-server-1 npx sequelize-cli db:migrate:status | grep 20260409
```

**Очаквано:** 3 миграции `up`:
- `20260409100000-add-reset-sms-code-to-user-account.js`
- `20260409100001-create-admin-user-actions.js`
- `20260409100002-add-reset-initiated-by-admin-to-user-account.js`

#### ✅ 2. Verify новите колони в `user_accounts`

```bash
docker exec digital-literacy-wellbeing-60-plus-db-1 psql -U pensaclub_user -d pensaclub -c "\d user_accounts" | grep -E "reset_sms|reset_initiated"
```

**Очаквано:** 3 нови колони:
- `reset_sms_code_hash` (varchar)
- `reset_sms_attempts` (integer, default 0)
- `reset_initiated_by_admin_id` (integer, nullable)

#### ✅ 3. Verify нова таблица `admin_user_actions`

```bash
docker exec digital-literacy-wellbeing-60-plus-db-1 psql -U pensaclub_user -d pensaclub -c "\d admin_user_actions"
```

**Очаквано:** Таблица с колони: id, action_type, admin_id, target_user_id, target_email, ip_address, user_agent, details (jsonb), success, created_at + 4 индекса

### Post-deploy: Server проверки

#### ✅ 4. Server стартира без грешки

```bash
docker logs digital-literacy-wellbeing-60-plus-server-1 --tail 50
```

**Очаквано:** Без `Error`, виждаш:
- `Server is listening on port: 8080`
- (някъде в логовете) cron schedules започнаха

#### ✅ 5. Cron job регистриран

```bash
docker logs digital-literacy-wellbeing-60-plus-server-1 --tail 100 | grep -i cron
```

**Очаквано:** Виждаш регистрираните cron-ове, включително audit cleanup-а.

### Post-deploy: API endpoints (с curl или Postman)

> ⚠️ **За тези тестове ще ти трябва admin JWT token.** Може да го вземеш от browser DevTools → Application → Local Storage → `auth` → `token`.

#### ✅ 6. Lookup endpoint — без auth (трябва да върне 401)

```bash
curl -i https://pensa.club/api/admin/users/lookup?email=test@test.com
```

**Очаквано:** `401 Unauthorized`

#### ✅ 7. Lookup endpoint — съществуващ user

```bash
TOKEN="<твоят_admin_token>"
curl -i -H "Authorization: Bearer $TOKEN" \
  "https://pensa.club/api/admin/users/lookup?email=admin@admin.com"
```

**Очаквано:** `200 OK` с JSON:
```json
{
  "exists": true,
  "user": {
    "id": ...,
    "email": "admin@admin.com",
    "role": "admin",
    "details": { ... },
    "isMentor": false,
    "isStudent": false
  }
}
```

#### ✅ 8. Lookup endpoint — несъществуващ user

```bash
curl -i -H "Authorization: Bearer $TOKEN" \
  "https://pensa.club/api/admin/users/lookup?email=nonexistent999@example.com"
```

**Очаквано:** `200 OK` с `{ "exists": false }`

#### ✅ 9. Rate limit (Risk #6 поправка) — flood с 6 заявки

```bash
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $TOKEN" \
    "https://pensa.club/api/admin/users/lookup?email=test$i@test.com"
done
```

**Очаквано:** Първите 5 → `200`, шестата → `429 Too Many Requests`

#### ✅ 10. Invite endpoint — empty firstName (Risk #3 поправка)

```bash
curl -i -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","firstName":"","lastName":"   "}' \
  "https://pensa.club/api/admin/users/invite"
```

**Очаквано:** `200 OK` (empty strings са нормализирани към null) — НЕ 400 validation error

#### ✅ 11. Invite endpoint — short name (Risk #3 поправка)

```bash
curl -i -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"another@example.com","firstName":"ab"}' \
  "https://pensa.club/api/admin/users/invite"
```

**Очаквано:** `400 Validation error` — "Name must be at least 3 characters"

#### ✅ 12. Invite endpoint — happy path

```bash
curl -i -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser123@example.com","firstName":"Иван","lastName":"Петров"}' \
  "https://pensa.club/api/admin/users/invite"
```

**Очаквано:** `200 OK` с `{ success: true, userId, emailSent }`

**После провери:**
- Имейлът е получен на адреса (с invitation линк)
- В DB → `SELECT id, email, role, invitation_token IS NOT NULL FROM user_accounts WHERE email = 'newuser123@example.com'` — трябва да има запис с `role='user'`, `invitation_token`
- В DB → `SELECT * FROM admin_user_actions WHERE action_type = 'invite_user' ORDER BY created_at DESC LIMIT 1` — трябва да има audit log запис

#### ✅ 13. Send-reset endpoint — без phone (трябва да fail-не ако SMS е enabled)

```bash
curl -i -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user_without_phone@example.com","sendSms":true}' \
  "https://pensa.club/api/admin/users/send-reset"
```

**Очаквано:** `400` с message за липсващ телефон

#### ✅ 14. Send-reset endpoint — с phone и SMS

```bash
curl -i -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"borislaviliev47@gmail.com","phone":"+359888123456","sendSms":true}' \
  "https://pensa.club/api/admin/users/send-reset"
```

**Очаквано:** `200 OK` с `{ success: true, smsSent: true, emailSent: true, expiresAt }`

**После провери:**
- SMS е получен на телефона с 6-цифрен код
- Имейл е получен с reset линк
- В DB → `SELECT reset_token, token_expiration, reset_sms_code_hash, reset_sms_attempts, reset_initiated_by_admin_id FROM user_accounts WHERE email = 'borislaviliev47@gmail.com'`:
  - `reset_token` = uuid
  - `token_expiration` = +24 часа
  - `reset_sms_code_hash` = bcrypt hash
  - `reset_sms_attempts` = 0
  - `reset_initiated_by_admin_id` = твоят admin ID (Risk #1 поправка ✅)

#### ✅ 15. Reset-info endpoint

```bash
curl -i "https://pensa.club/api/auth/reset-info/<reset_token_от_DB>"
```

**Очаквано:** `200 OK` с `{ valid: true, email, requiresSms: true, attemptsLeft: 5, expiresAt }`

#### ✅ 16. Reset-password — wrong SMS code (Risk #1 поправка)

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"<reset_token>","newPassword":"NewPass123","reNewPassword":"NewPass123","tokenType":"reset","smsCode":"000000"}' \
  "https://pensa.club/api/auth/reset-password"
```

**Очаквано:** `401 Invalid SMS code` с `attemptsLeft: 4`

**После провери:**
- В DB → `SELECT reset_sms_attempts FROM user_accounts WHERE email = '...'` → трябва да е `1`
- В audit log → нов запис `action_type='reset_failed'`, `admin_id` = твоят admin ID (НЕ user ID! — Risk #1 поправка)

#### ✅ 17. Reset-password — Rate limit на SMS опити (5 опита)

Повтори запитването от #16 общо **5 пъти**, за да изчерпи опитите. **6-тия опит** трябва да върне:

```
429 Too many invalid attempts. Please request a new reset link.
```

#### ✅ 18. Reset-password — успех с правилен код

(Първо изпрати нов reset link, защото предишните опити изчерпаха брояча)

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"<НОВ_reset_token>","newPassword":"NewPass123","reNewPassword":"NewPass123","tokenType":"reset","smsCode":"<правилния_код_от_SMS>"}' \
  "https://pensa.club/api/auth/reset-password"
```

**Очаквано:** `200 OK` с `{ message: 'Password reset was successful.' }`

**После провери:**
- В DB → `reset_token`, `reset_sms_code_hash`, `reset_initiated_by_admin_id` са `NULL` (изчистени)
- В audit log → нов запис `action_type='reset_completed'`, `admin_id` = admin-а инициирал reset-а (Risk #1 поправка ✅)
- Логни се с новата парола

#### ✅ 19. Self-initiated forgot password (REGRESSION TEST — Risk #1)

Използвай **съществуващия** forgot password flow (НЕ admin-инициирания):

1. Иди на `/forget-password` страницата
2. Въведи email
3. Получи имейл със reset link
4. Влез в линка → въведи нова парола
5. Submit

**Очаквано:** Работи както преди ✅

**КРИТИЧНО провери:** В DB → `SELECT * FROM admin_user_actions WHERE created_at > NOW() - INTERVAL '5 minutes'` → **НЕ трябва да има нов запис** за този reset! (Risk #1 поправка — self-initiated resets не пишат в audit log)

### Post-deploy: Audit log endpoints

#### ✅ 20. List audit log

```bash
curl -i -H "Authorization: Bearer $TOKEN" \
  "https://pensa.club/api/admin/user-actions?page=1&limit=20"
```

**Очаквано:** `200 OK` със списък от записи + pagination

#### ✅ 21. List audit log с филтри

```bash
curl -i -H "Authorization: Bearer $TOKEN" \
  "https://pensa.club/api/admin/user-actions?actionType=invite_user&adminEmail=admin"
```

**Очаквано:** Само записи с тип `invite_user` от admin-и с email съдържащ "admin"

#### ✅ 22. Export audit log като PDF

```bash
curl -i -H "Authorization: Bearer $TOKEN" \
  -o audit-log.pdf \
  "https://pensa.club/api/admin/user-actions/export?format=pdf"
```

**Очаквано:**
- HTTP 200
- Файл `audit-log.pdf` се изтегля
- Отвори файла → виж таблица с audit записи (с кирилица)

### Сигурност тестове

#### ✅ 23. SMS код е cryptographically secure (Risk #2)

Generate 100 SMS кода чрез repeat send-reset → провери че няма повтаряне:

```bash
for i in {1..10}; do
  curl -s -X POST -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"phone\":\"+359888000000\",\"sendSms\":true}" \
    "https://pensa.club/api/admin/users/send-reset"
done
```

**Очаквано:** Всеки SMS код е уникален (визуално провери в SMS-ите)

### ✅ Local testing резултати (2026-04-09, преди commit)

Извършени са следните локални curl тестове срещу `localhost:8080` с реален admin JWT token:

| # | Тест | Резултат | Бележка |
|---|---|---|---|
| 1 | `GET /admin/users/lookup?email=admin@admin.com` (с auth) | ✅ 200 | Връща пълен профил с details, role, isMentor, isStudent |
| 2 | `GET /admin/users/lookup?email=non_existent@example.com` | ✅ 200 | `{exists: false}` |
| 3 | `POST /admin/users/invite` с `firstName: ""`, `lastName: "   "` | ✅ 200 | Empty strings нормализирани към `null` (Risk #3) |
| 4 | `POST /admin/users/invite` с `firstName: "ab"` | ✅ 400 | Validation error: "Name must be at least 3 characters" |
| 5 | `POST /admin/users/invite` с валидни данни | ✅ 200 | User created (id 41), invitation email sent |
| 6 | `GET /admin/user-actions?limit=3` | ✅ 200 | Връща 3 audit log записа с пълна информация |
| 7 | Audit log JOIN с admin info | ✅ | admin email + name + username се връщат |
| 8 | Audit log за lookup на non-existent | ✅ | `targetUserId: null`, `targetEmail` логнат, `details: {found: false}` |
| 9 | `GET /admin/users/lookup` без auth | ✅ 401 | isAuth middleware блокира |
| 10 | `POST /admin/users/invite` без auth | ✅ 401 | Auth check преди validation |
| 11 | `GET /auth/reset-info/INVALID_TOKEN` | ✅ 404 | "Invalid or already used reset token" |

#### Не тествани локално (token expired по време на сесията)

- ❌ Rate limit (5/min) — ще се тества в production
- ❌ `POST /admin/users/send-reset` — ще се тества в production с реален телефон
- ❌ `POST /auth/reset-password` с SMS код — ще се тества в production
- ❌ `GET /admin/user-actions/export` (PDF) — ще се тества в production
- ❌ Self-initiated forgot password regression test — ще се тества в production

#### Заключение

✅ **Backend Phase 1 е production-ready.** Основната функционалност, validation, auth и audit log работят правилно. Останалите тестове изискват реален SMS телефон или нов JWT token и ще се изпълнят в production.

---

### Финален checklist

- [ ] Migrations приложени (3 нови)
- [ ] Колони и таблици съществуват
- [ ] Server стартира без грешки
- [ ] Cron jobs регистрирани
- [ ] Lookup endpoint работи (admin only)
- [ ] Rate limit работи (5/min → 429)
- [ ] Invite endpoint — empty strings → null
- [ ] Invite endpoint — short names → 400
- [ ] Invite endpoint — happy path → email + DB record + audit log
- [ ] Send-reset — без phone fail-ва
- [ ] Send-reset — с phone праща SMS + email + сетва reset_initiated_by_admin_id
- [ ] Reset-info — връща правилна информация
- [ ] Reset-password — wrong SMS → 401, attempts++
- [ ] Reset-password — 5 опита → 429
- [ ] Reset-password — success → audit log с правилен admin_id
- [ ] **Self-initiated forgot password** — работи И **НЕ** замърсява audit log (CRITICAL)
- [ ] Audit log list endpoint
- [ ] Audit log export PDF
- [ ] SMS кодове са уникални (crypto secure)

### Какво да направиш ако нещо не работи

| Проблем | Решение |
|---|---|
| Migration не е приложена | `docker exec ... npx sequelize-cli db:migrate` ръчно |
| Колона липсва | Провери лога — може миграцията да е failed |
| 404 на новите endpoints | Provери че `userManagementController` е mount-нат в `router.js` |
| 403 на endpoints | Провери че admin user има `role='admin'` в DB |
| 401 след новия server | JWT може да е инвалиден — relog в админ панела |
| Rate limit не работи | Провери че `keyGenerator` връща правилен ключ |
| SMS не идва | Twilio config — провери env variables на VPS |
| Email не идва | Zoho config — провери token refresh |
| Audit log писан с user.id вместо admin.id за self-reset | Провери че `reset_initiated_by_admin_id` се чете правилно |

### Rollback план

Ако нещо лошо стане:

```bash
# 1. Revert последния merge commit
git checkout main
git revert <merge_commit_hash> --no-edit
git push origin main

# 2. Auto-deploy ще отмени промените

# 3. Ако миграциите трябва да се отменят (внимателно!):
docker exec digital-literacy-wellbeing-60-plus-server-1 npx sequelize-cli db:migrate:undo --name 20260409100002-add-reset-initiated-by-admin-to-user-account.js
docker exec digital-literacy-wellbeing-60-plus-server-1 npx sequelize-cli db:migrate:undo --name 20260409100001-create-admin-user-actions.js
docker exec digital-literacy-wellbeing-60-plus-server-1 npx sequelize-cli db:migrate:undo --name 20260409100000-add-reset-sms-code-to-user-account.js
```

> ⚠️ Migration rollback изтрива данни! Прави го САМО ако наистина трябва.

---

## 📂 Фаза 1: Backend

### 1.1 DB Migrations

**Нов файл 1:** `server/src/sequelize/migrations/YYYYMMDDHHMMSS-add-reset-sms-code-to-user-account.js`

```javascript
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_accounts', 'reset_sms_code_hash', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    // Брояч на SMS опити — за rate limiting
    await queryInterface.addColumn('user_accounts', 'reset_sms_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_accounts', 'reset_sms_code_hash');
    await queryInterface.removeColumn('user_accounts', 'reset_sms_attempts');
  },
};
```

**Update:** `user_account.js` model:
```javascript
reset_sms_code_hash: DataTypes.STRING,
reset_sms_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
```

> **Защо няма отделна expiration колона?** Reuse-ваме съществуващата `token_expiration`. SMS код и reset token имат **една и съща** валидност (24 часа за admin-инициирани), затова едно поле стига.

**Нов файл 2:** `server/src/sequelize/migrations/YYYYMMDDHHMMSS-create-admin-user-actions.js`

```javascript
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admin_user_actions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      action_type: {
        type: Sequelize.ENUM(
          'lookup_user',         // admin провери имейл
          'invite_user',          // admin изпрати invitation
          'send_reset_link',      // admin изпрати reset linker (с/без SMS)
          'reset_completed',      // user успешно смени паролата
          'reset_failed',         // SMS код грешен / token изтекъл
        ),
        allowNull: false,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'RESTRICT',
      },
      target_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,  // може да е null при lookup на несъществуващ user
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
      },
      target_email: {
        type: Sequelize.STRING(255),
        allowNull: false,  // винаги логваме email-а, дори ако user не съществува
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true,
        // примери: { phoneUsed: '+359...', smsRequested: true, errorMessage: '...' }
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Indexes за бързо филтриране
    await queryInterface.addIndex('admin_user_actions', ['admin_id']);
    await queryInterface.addIndex('admin_user_actions', ['target_email']);
    await queryInterface.addIndex('admin_user_actions', ['action_type']);
    await queryInterface.addIndex('admin_user_actions', ['created_at']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('admin_user_actions');
  },
};
```

> ⚠️ **Immutability:** Таблицата НЯМА `update_at` и НЯМА endpoint за update/delete. Записите се създават **САМО** от server-а при действие на admin. Чистене става само от cron job (1 година retention).

**Нов модел:** `server/src/sequelize/models/admin_user_action.js`
- BelongsTo `user_account` (admin)
- BelongsTo `user_account` (target user, nullable)
- НЯМА `timestamps: true` (само `createdAt`)

### 1.2 Zod schemas

Update `userAccount.schema.js` (или нов файл):
```javascript
const adminLookupSchema = z.object({
  email: z.string().email().min(1),
});

const adminInviteSchema = z.object({
  email: z.string().email().min(1),
  firstName: z.string().min(1).max(20).optional(),
  lastName: z.string().min(1).max(20).optional(),
});

const adminSendResetSchema = z.object({
  email: z.string().email().min(1),
  phone: z.string().regex(/^(?:\+\d{7,15}|\d{10})$/).nullable().optional(),
  sendSms: z.boolean().default(true),
});

// Update of existing resetPasswordSchema to support SMS code:
const resetPasswordSchema = z.object({
  newPassword: z.string().regex(passwordRegex),
  reNewPassword: z.string().min(1),
  tokenType: z.enum(['jwt', 'reset']),
  token: z.string().min(1),
  oldPassword: z.string().optional().nullable(),
  smsCode: z.string().regex(/^\d{6}$/).optional().nullable(),  // ← НОВО
}).refine(...);
```

### 1.3 SMS helper

**File:** `server/src/utils/smsService.js` (вече съществува)

Добавяне на нова функция `sendPasswordResetSms`:
```javascript
async function sendPasswordResetSms(phone, code) {
  // Reuses existing SMS infrastructure (Twilio)
  const message = `Pensa Club: Вашият код за смяна на парола е ${code}. Валиден 15 минути. Не споделяйте с никого.`;
  return sendSms(phone, message);
}
```

### 1.4 Email helper

**File:** `server/src/utils/zohoEmails.js`

Нов async function `sendAdminInitiatedResetEmail` — копира визуалния стил на `sendGuestInvitationEmail`:
- Orange gradient header + Pensa лого
- "Заявка за смяна на парола"
- "Заявката е инициирана от админ на Pensa Club"
- CTA бутон: "Смени парола"
- ⚠️ Важно: "Ако имаш SMS код, въведи го заедно с новата парола"
- Footer с контакти (📞 +359 89 579 4214, 📧 pensa.club@gmail.com)

Линк: `${FRONTEND_SERVER}/reset-password?token=${resetToken}&hasSms=1` (query param `hasSms=1` ако е изпратен SMS)

### 1.5 Endpoint: Lookup user by email

**Файл:** `server/src/controllers/adminController.js` (вече съществува, ще се добави)
**Route:** `GET /api/admin/users/lookup?email=xxx`
**RBAC:** `admin` only

**Flow:**
1. Validate email
2. `findOne({ where: { email } })` + include details, ads, role info
3. Ако намери → връща пълен профил:
   ```json
   {
     "exists": true,
     "user": {
       "id": 123,
       "email": "user@example.com",
       "role": "user",
       "finished": true,
       "createdAt": "...",
       "updatedAt": "...",
       "details": {
         "firstName": "Иван",
         "lastName": "Петров",
         "phoneNumber": "+359...",
         "username": "ivan_pet",
         "imageURL": "..."
       },
       "isMentor": false,
       "studentInfo": { ... }  // ако е student
     }
   }
   ```
4. Ако не намери → `{ exists: false }`

### 1.6 Endpoint: Изпращане на invitation (нов user)

**Route:** `POST /api/admin/users/invite`
**RBAC:** `admin`

**Body:** `{ email, firstName?, lastName? }`

**Flow:**
1. Zod валидация
2. Проверка дали email вече съществува → ако да, връща грешка с препратка към lookup
3. Създава `user_account`:
   - email, password=null
   - role = `'user'` (НЕ student — това не е свързано с конкретен семинар)
   - finished = false
   - invitation_token = uuid.v4()
   - invitation_expiration = now + 7 дни (същото като guest invitation)
4. Създава `user_details` запис с firstName/lastName (или null)
5. Изпраща email чрез **същата** функция `sendGuestInvitationEmail`, но без `seminarTitle`
6. Връща `{ success: true, userId, emailSent }`

> **Важно:** Този flow **НЕ** създава student/student_seminar записи (за разлика от guest registration flow от семинарите). Само user_account + user_details + invitation token.

### 1.7 Endpoint: Изпращане на reset password линк

**Route:** `POST /api/admin/users/send-reset`
**RBAC:** `admin`

**Body:** `{ email, phone?, sendSms }`

**Flow:**
1. Zod валидация
2. `findOne({ where: { email } })` — ако не съществува → 404
3. Генерира `resetToken = uuid.v4()`
4. Set `reset_token = resetToken`, `token_expiration = now + 24 hours`
5. **Reset брояч**: `reset_sms_attempts = 0` (нов опит)
6. **Ако `sendSms === true`**:
   - Резолв phone:
     - Ако подаден в request → използва него
     - Иначе → използва съхранения `user.details.phoneNumber`
     - Ако нито един → грешка "No phone number available"
   - Генерира 6-цифрен код: `Math.floor(100000 + Math.random() * 900000)`
   - Hash-ва кода с bcrypt → save в `reset_sms_code_hash`
   - Изпраща SMS чрез `sendPasswordResetSms(phone, code)`
7. **Ако `sendSms === false`**: `reset_sms_code_hash = null`
8. Изпраща email чрез `sendAdminInitiatedResetEmail(email, resetToken, hasSmsCode)`
9. **Audit log**: създава запис в `admin_user_actions`:
   ```javascript
   {
     action_type: 'send_reset_link',
     admin_id: req.user.userId,
     target_user_id: user.id,
     target_email: user.email,
     ip_address: req.ip,
     user_agent: req.headers['user-agent'],
     details: { phoneUsed, smsRequested: sendSms, smsSent, emailSent },
     success: true,
   }
   ```
10. **Notification**: създава `admin_notification` запис → тригърва се за всички admin-и
11. Връща `{ success: true, smsSent, emailSent, expiresAt }`

### 1.8 Update: `/auth/reset-password` endpoint

**Файл:** `server/src/controllers/authController.js`

**Логика за `tokenType: 'reset'`:**
1. Намира user по `reset_token`
2. Валидира expiration
3. **НОВО:** Ако `user.reset_sms_code_hash` е set:
   - Изисква `smsCode` в body (6 цифри)
   - **Rate limit check:** ако `user.reset_sms_attempts >= 5` → връща 429 "Too many attempts. Request a new reset link."
   - `bcrypt.compare(smsCode, user.reset_sms_code_hash)`:
     - ✅ Ако съвпада → продължава
     - ❌ Ако не → `reset_sms_attempts++` → save → връща 401 "Invalid SMS code"
     - **Audit log запис** `reset_failed`
4. Hash-ва новата парола
5. Изчиства `reset_token`, `token_expiration`, `reset_sms_code_hash`, `reset_sms_attempts`
6. **Без auto-login** — както сега. User отива на login page и влиза с новата парола.
7. **Audit log запис** `reset_completed`
8. Връща `{ message: 'Password changed successfully' }` (без user/token)

> **Запазено поведение:** Auto-login НЕ се прави при reset password (по-сигурно). User отива на login страницата след успешна смяна.

### 1.9 Endpoint: GET token info

**Route:** `GET /api/auth/reset-info/:token`
**Public**

**Flow:**
1. Намира user по `reset_token`
2. Валидира expiration
3. Връща `{ valid: true, requiresSms: boolean, email: string, attemptsLeft: number }`
4. Клиентът използва това за да реши дали да покаже SMS code поле във формата

### 1.10 Endpoint: List admin user actions (audit log)

**Route:** `GET /api/admin/user-actions`
**RBAC:** `admin`

**Query params:**
- `page` (default 1)
- `limit` (default 20, **max 100**)
- `dateFrom` (ISO date, optional)
- `dateTo` (ISO date, optional)
- `adminId` (number, optional)
- `adminEmail` (string, optional)
- `actionType` (enum value, optional)
- `targetEmail` (string, optional)
- `success` (boolean, optional)

**Flow:**
1. RBAC check
2. Build where clause from filters
3. `findAndCountAll` с pagination + sort by `created_at DESC`
4. Include admin user info (email, name)
5. Връща:
   ```json
   {
     "data": [...],
     "pagination": { "page": 1, "totalPages": 5, "total": 87, "limit": 20 }
   }
   ```

> **Лимит на заявката:** server forsifies `limit <= 100` за да не може да се изтегли цялата таблица наведнъж.

### 1.11 Endpoint: Export audit log as PDF

**Route:** `GET /api/admin/user-actions/export?format=pdf&[filters]`
**RBAC:** `admin`

**Flow:**
1. Same filters as list endpoint
2. **Без pagination** — взима всички записи отговарящи на филтъра (с **hard limit 5000** за да не блокира server-а)
3. Генерира PDF чрез `pdfkit` (същата инфраструктура като export-attendees):
   - Header с лого + "Audit Log — Pensa Club"
   - Период на отчета
   - Таблица: дата, тип, admin email, target email, IP, success
   - Cyrillic font (DejaVuSans)
4. Stream-ва файла с `Content-Disposition: attachment; filename="audit-log-YYYY-MM-DD.pdf"`

### 1.12 Cron job: Cleanup на стари audit logs

**Файл:** `server/src/cron/cleanupAuditLogs.js` (или в съществуващ cron файл)

**Schedule:** Веднъж дневно (например 03:00)

**Logic:**
```javascript
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const deleted = await admin_user_action.destroy({
  where: { created_at: { [Op.lt]: oneYearAgo } },
});
console.log(`[AUDIT CLEANUP] Deleted ${deleted} records older than 1 year`);
```

> **Защо cron а не TTL индекс?** Sequelize/Postgres няма native TTL — cron е стандартния подход.

### 1.13 Audit log helper

**Файл:** `server/src/utils/auditLog.js` (нов)

```javascript
async function logAdminAction({
  actionType, adminId, targetUserId, targetEmail,
  req, details, success = true
}) {
  try {
    const { admin_user_action } = require('../sequelize/models');
    await admin_user_action.create({
      action_type: actionType,
      admin_id: adminId,
      target_user_id: targetUserId,
      target_email: targetEmail,
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.headers['user-agent']?.substring(0, 500) || null,
      details: details || null,
      success,
    });
  } catch (err) {
    console.error('[AUDIT] Failed to log admin action:', err);
    // НЕ хвърляме грешка — audit log fail-а не трябва да блокира главния flow
  }
}
module.exports = { logAdminAction };
```

---

## 🔌 Фаза 2: Frontend Services

### 2.1 `adminService.jsx` (или `userService.jsx`)

```javascript
lookupUserByEmail: (email) => {
  return requester.get(`${apiUrl}/admin/users/lookup?email=${encodeURIComponent(email)}`);
},

inviteUser: (data) => {
  return requester.post(`${apiUrl}/admin/users/invite`, data);
},

sendResetLink: (data) => {
  return requester.post(`${apiUrl}/admin/users/send-reset`, data);
},

getResetTokenInfo: (token) => {
  return requester.get(`${apiUrl}/auth/reset-info/${token}`);
},
```

---

## 🔗 Фаза 3: Context Providers

### 3.1 Update на `UserContext.jsx` (или нов AdminContext)

```javascript
const lookupUserByEmail = useCallback(async (email) => {
  try {
    return await userService.lookupUserByEmail(email);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Грешка при търсене');
    throw err;
  }
}, []);

const inviteUser = useCallback(async (data) => {
  try {
    const res = await userService.inviteUser(data);
    toast.success('Поканата е изпратена');
    return res;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Грешка при изпращане');
    throw err;
  }
}, []);

const sendAdminResetLink = useCallback(async (data) => {
  try {
    const res = await userService.sendResetLink(data);
    toast.success('Линкът е изпратен');
    return res;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Грешка при изпращане');
    throw err;
  }
}, []);

const getResetTokenInfo = useCallback(async (token) => {
  return await userService.getResetTokenInfo(token);
}, []);
```

---

## 🎨 Фаза 4: SiteSettingsAdmin компоненти

### Имаме **2 нови компонента**:
1. **`UserManagement`** — Регистрация / Смяна на парола (главното искане)
2. **`AdminUserActionLogs`** — Audit log преглед (нов admin раздел)


### 4.1 Нов компонент `UserManagement`

**Файл:** `client/src/components/SiteSettingsAdmin/UserManagement/UserManagement.jsx`
**CSS prefix:** `umng-`
**i18n namespace:** `admin` (`userManagement.*` keys)

### 4.2 Структура

```jsx
<div className="umng-wrapper">
  <h2>Управление на потребители</h2>

  {/* Tabs */}
  <div className="umng-tabs">
    <button className={tab === 'register' ? 'active' : ''}>Регистрирай потребител</button>
    <button className={tab === 'reset' ? 'active' : ''}>Смяна на парола</button>
  </div>

  {/* Email lookup (споделено между табове) */}
  <div className="umng-search">
    <input type="email" placeholder="Имейл..." value={email} />
    <button onClick={handleLookup}>Провери</button>
  </div>

  {/* User found — show profile */}
  {lookupResult?.exists && (
    <div className="umng-profile">
      <h3>Намерен потребител</h3>
      <div className="umng-profile-grid">
        <div>Име: {firstName} {lastName}</div>
        <div>Имейл: {email}</div>
        <div>Телефон: {phone || '—'}</div>
        <div>Роля: {role}</div>
        <div>Регистрация: {createdAt}</div>
        <div>Аватар: <img /></div>
        ...
      </div>

      {/* Tab-specific actions */}
      {tab === 'register' && (
        <div className="umng-warning">
          <AlertTriangle />
          Този имейл вече е регистриран. Не можете да изпратите нова покана.
        </div>
      )}

      {tab === 'reset' && (
        <div className="umng-reset-form">
          <h4>Изпрати reset линк</h4>

          {/* Phone field — pre-filled with stored phone if any */}
          <label>Телефон за SMS</label>
          <input type="tel" value={phone} onChange={...} placeholder="Без телефон ще се изпрати само email" />

          <label>
            <input type="checkbox" checked={sendSms} onChange={...} disabled={!phone} />
            Изпрати SMS код за допълнителна сигурност
          </label>

          <button onClick={handleSendReset}>
            <Send /> Изпрати reset линк
          </button>
        </div>
      )}
    </div>
  )}

  {/* User NOT found — register form (only on register tab) */}
  {lookupResult?.exists === false && tab === 'register' && (
    <div className="umng-register-form">
      <h3>Регистрирай нов потребител</h3>
      <input value={firstName} onChange={...} placeholder="Име (опционално)" />
      <input value={lastName} onChange={...} placeholder="Фамилия (опционално)" />
      <button onClick={handleInvite}>
        <Send /> Изпрати покана
      </button>
    </div>
  )}

  {/* User NOT found — error (on reset tab) */}
  {lookupResult?.exists === false && tab === 'reset' && (
    <div className="umng-error">
      <AlertCircle />
      Няма потребител с този имейл.
    </div>
  )}
</div>
```

### 4.3 CSS файл

`userManagement.css` — следва **същия pattern** като другите SiteSettingsAdmin компоненти. Tabs, profile grid, forms, modals, light/dark theme.

### 4.4 Регистрация в SiteSettingsAdmin

`SiteSettingsAdmin.jsx` — добавяне на **2 нови sections**:
- "Управление на потребители" (UserManagement)
- "Лог на админ действия" (AdminUserActionLogs)

### 4.5 Нов компонент `AdminUserActionLogs`

**Файл:** `client/src/components/SiteSettingsAdmin/AdminUserActionLogs/AdminUserActionLogs.jsx`
**CSS prefix:** `aual-`
**i18n namespace:** `admin` (`adminUserActionLogs.*`)

#### Структура

```jsx
<div className="aual-wrapper">
  <h2>Лог на админ действия</h2>

  {/* Filters bar */}
  <div className="aual-filters">
    <input type="date" placeholder="От дата" />
    <input type="date" placeholder="До дата" />
    <input type="text" placeholder="Имейл на админ" />
    <input type="text" placeholder="Имейл на target user" />
    <select>
      <option value="">Всички действия</option>
      <option value="invite_user">Покани</option>
      <option value="send_reset_link">Reset линкове</option>
      <option value="reset_completed">Успешни смяни</option>
      <option value="reset_failed">Неуспешни</option>
    </select>
    <button onClick={handleApplyFilters}>Приложи</button>
    <button onClick={handleClearFilters}>Изчисти</button>
    <button onClick={handleExportPdf}>📥 Export PDF</button>
  </div>

  {/* Stats summary */}
  <div className="aual-stats">
    <span>Общо: {pagination.total}</span>
    <span>Успешни: {successCount}</span>
    <span>Неуспешни: {failedCount}</span>
  </div>

  {/* Logs table */}
  <table className="aual-table">
    <thead>
      <tr>
        <th>Дата</th>
        <th>Действие</th>
        <th>Admin</th>
        <th>Target user</th>
        <th>IP</th>
        <th>Статус</th>
        <th>Детайли</th>
      </tr>
    </thead>
    <tbody>
      {logs.map(log => (
        <tr key={log.id}>
          <td>{formatDate(log.createdAt)}</td>
          <td><Badge type={log.actionType}>{actionLabel(log.actionType)}</Badge></td>
          <td>{log.admin?.email}</td>
          <td>{log.targetEmail}</td>
          <td>{log.ipAddress || '—'}</td>
          <td>{log.success ? '✅' : '❌'}</td>
          <td><button onClick={() => showDetails(log)}>Виж</button></td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
  <Pagination ... />

  {/* Details modal */}
  {detailsModal && <LogDetailsModal log={detailsModal} onClose={...} />}
</div>
```

#### Функционалност

- **Филтри (всички optional):**
  - 📅 **От дата** (date picker)
  - 📅 **До дата** (date picker)
  - 📧 **Имейл на admin** (text search, partial match)
  - 📧 **Имейл на target потребител** (text search, partial match)
  - 🏷️ **Тип действие** (dropdown с всички action types)
  - ✅/❌ **Статус** (success/failed/всички)
- **Pagination:** 20 на страница (server-side limit max 100)
- **Stats summary:** общо / успешни / неуспешни брои (over filtered set)
- **PDF export:** взима филтрите → прави request към `/admin/user-actions/export?...`
- **Details modal:** показва пълните `details` JSON-а за избран запис
- **Refresh** бутон за reload
- **No edit / delete** — read-only по дизайн (immutability)

### 4.6 Notifications за admin действия

Когато admin направи действие → създава се запис в `admin_notification` (съществуваща таблица). Това задейства сегашната notification система — другите admin-и виждат:
- "Иван Петров изпрати reset линк на user@example.com"
- "Мария Иванова покани new@example.com"

Това става **автоматично** чрез съществуващия `admin_notification` flow — не е нужен отделен код.

---

## 📝 Фаза 5: Update на ResetPasswordPage

### 5.1 Промени във `client/src/components/ForgetPassword/ResetPasswordPage.jsx`

**Сегашен flow:**
1. User отваря линка
2. Въвежда new password + repeat
3. Submit → reset парола → redirect

**Нов flow:**
1. User отваря линка
2. **На mount** → клиент извиква `getResetTokenInfo(token)` → връща `{ requiresSms, attemptsLeft }`
3. Ако `requiresSms === true` → показва допълнително поле "SMS код"
4. Показва "Останали опити: 5/5" badge ако има SMS
5. User въвежда: SMS код + new password + repeat
6. Submit → server validates token + SMS code → reset парола
7. **Без auto-login** — redirect към login page със success toast
8. На грешен SMS код → показва "Грешен код. Останали опити: X/5"
9. На 5-ти грешен опит → "Превишен лимит. Свържете се с админ за нов линк."

### 5.2 UI промени

- Ново поле за SMS код (показва се само ако `requiresSms === true`)
- Validation: 6 цифри, само numbers
- "Attempts left" indicator
- Inline error messages на кирилица
- Loading state, success state
- Bigger SMS code input (по-удобно за възрастни хора)

---

## 🌐 Фаза 6: Translations + RBAC

### 6.1 Translations

Нови ключове в `client/public/locales/{bg,en,de}/admin.json`:

```json
"userManagement": {
  "title": "Управление на потребители",
  "tabs": {
    "register": "Регистрирай потребител",
    "reset": "Смяна на парола"
  },
  "searchPlaceholder": "Имейл...",
  "lookupBtn": "Провери",
  "userFound": "Намерен потребител",
  "userNotFound": "Няма потребител с този имейл",
  "alreadyRegistered": "Този имейл вече е регистриран",
  "registerNewUser": "Регистрирай нов потребител",
  "firstName": "Име (опционално)",
  "lastName": "Фамилия (опционално)",
  "sendInvite": "Изпрати покана",
  "inviteSent": "Поканата е изпратена",
  "sendResetTitle": "Изпрати reset линк",
  "phoneForSms": "Телефон за SMS",
  "sendSmsLabel": "Изпрати SMS код за допълнителна сигурност",
  "sendResetBtn": "Изпрати reset линк",
  "resetLinkSent": "Линкът е изпратен",
  "errors": {
    "emailRequired": "Имейлът е задължителен",
    "emailInvalid": "Невалиден имейл формат",
    "phoneInvalid": "Невалиден телефонен номер",
    "lookupError": "Грешка при търсене",
    "inviteError": "Грешка при изпращане на покана",
    "resetError": "Грешка при изпращане на reset линк"
  }
}
```

### 6.2 ResetPasswordPage translations

Допълнителни ключове за SMS поле:
```json
"smsCodeLabel": "SMS код",
"smsCodePlaceholder": "6-цифрен код от SMS",
"smsCodeRequired": "SMS кодът е задължителен",
"smsCodeInvalid": "Невалиден SMS код"
```

### 6.3 RBAC

- Endpoint-овете изискват `admin` role check
- В клиента — компонентът трябва да се вижда **само** ако `isAdmin === true` (използваме съществуващия `useAuthContext`)

---

## 🧪 Фаза 7: Тестване

### Сценарии

1. **Happy path — нов user**
   - Admin отваря раздела → таб "Регистрирай"
   - Въвежда нов имейл → "Провери" → показва "Не съществува"
   - Въвежда име/фамилия → "Изпрати покана"
   - User получава имейл → клик → задава парола → auto-login

2. **Опит за регистрация на съществуващ user**
   - Admin въвежда регистриран имейл → показва се **пълен профил** с warning
   - Бутонът "Изпрати покана" е скрит/disabled

3. **Happy path — reset password с SMS**
   - Admin отваря таб "Смяна на парола"
   - Въвежда имейл → показва се пълен профил с **запазен** телефон
   - Checkbox "Изпрати SMS" е автоматично включен
   - Клик "Изпрати reset линк"
   - User получава email + SMS
   - Отваря линка → формата показва SMS поле
   - Въвежда SMS код + нова парола → success

4. **Reset password БЕЗ SMS (fallback)**
   - User няма телефон в системата
   - Admin uncheck-ва "Изпрати SMS"
   - Изпраща само email
   - User получава линка → формата НЕ показва SMS поле
   - Въвежда само нова парола → success

5. **Reset с ръчно въведен телефон**
   - User няма телефон в системата, но admin го въвежда ръчно
   - SMS отива на въведения телефон
   - User получава SMS на своя телефон → въвежда кода → success

6. **Грешен SMS код**
   - User въвежда грешен код → inline грешка
   - Може да опита отново (token не се изтрива)

7. **Изтекъл reset token**
   - User отваря линка след 15+ минути → error page

8. **Невалиден email при lookup**
   - Невалиден формат → клиентска валидация
   - Несъществуващ email на reset таба → грешка
   - Несъществуващ email на register таба → форма за нов

9. **Permission check**
   - Не-admin user опит за достъп → 403

10. **Mobile responsive**
    - Tabs, formи, profile grid — всички работят на mobile

---

## 📁 Файлове — структура

### Нови файлове

```
server/
  src/
    sequelize/
      migrations/
        YYYYMMDDHHMMSS-add-reset-sms-code-to-user-account.js     [нов]
        YYYYMMDDHHMMSS-create-admin-user-actions.js              [нов]
      models/
        admin_user_action.js                                      [нов]
    controllers/
      userManagementController.js                                 [нов]
    utils/
      auditLog.js                                                 [нов helper]
    cron/
      cleanupAuditLogs.js                                         [нов / в съществуващ cron файл]
    schemas/
      adminUserManagement.schema.js                               [нов / може и в userAccount.schema.js]

client/
  src/
    components/
      SiteSettingsAdmin/
        UserManagement/
          UserManagement.jsx                                      [нов]
          userManagement.css                                      [нов]
        AdminUserActionLogs/
          AdminUserActionLogs.jsx                                 [нов]
          adminUserActionLogs.css                                 [нов]
      contexts/
        AdminContext.jsx                                          [нов — или разширение на UserContext]
```

### Модифицирани файлове

```
server/
  src/
    sequelize/models/
      user_account.js                              [+ reset_sms_code_hash, reset_sms_attempts]
      index.js                                      [+ admin_user_action асоциации]
    schemas/userAccount.schema.js                   [+ smsCode в resetPasswordSchema]
    utils/zohoEmails.js                             [+ sendAdminInitiatedResetEmail]
    utils/smsService.js                             [+ sendPasswordResetSms]
    controllers/
      authController.js                             [+ /reset-info/:token, + SMS validation в /reset-password]
    router.js                                       [+ mount на userManagementController]

client/
  src/
    components/
      Services/
        adminService.jsx                            [+ lookupUserByEmail, inviteUser, sendResetLink,
                                                        getUserActionLogs, exportUserActionLogs]
        userService.jsx                             [+ getResetTokenInfo]
      contexts/
        UserContext.jsx                             [+ getResetTokenInfo (за ResetPasswordPage)]
      SiteSettingsAdmin/
        SiteSettingsAdmin.jsx                       [+ 2 нови sections (UserManagement + AdminUserActionLogs)]
      ForgetPassword/
        ResetPasswordPage.jsx                       [+ SMS поле + attemptsLeft + getResetTokenInfo на mount]

  public/
    locales/
      bg/admin.json                                 [+ userManagement.* + adminUserActionLogs.* ключове]
      en/admin.json                                 [+ ...]
      de/admin.json                                 [+ ...]
```

---

## 🔒 Security Considerations

1. **6-цифрен SMS код** — 1,000,000 възможни → достатъчно за 15-минутен код
2. **bcrypt hash** на SMS код в DB — ако DB е компрометирана, кодът не е plain
3. **Rate limiting** — препоръчвам **3 опита** за SMS код, после изисква нов reset
4. **Admin-only достъп** — защитено с RBAC + admin role check
5. **Audit log** — препоръчвам log на всяко admin action (invite, send-reset) в `admin_notification` или нова таблица
6. **HTTPS** — всичко минава през HTTPS (вече е настроено)
7. **Token usage** — token-ът се изчиства след успешна смяна на паролата (single-use)
8. **No password in URL** — никога не подаваме парола в URL params

---

## ⏰ Implementation Order

| Фаза | Какво | Зависимости |
|---|---|---|
| 1 | Backend — migration, schemas, helpers, endpoints | — |
| 2 | Services layer | Phase 1 |
| 3 | Context providers | Phase 2 |
| 4 | UserManagement component (UI) | Phase 3 |
| 5 | ResetPasswordPage update (SMS field) | Phase 1 |
| 6 | Translations + RBAC | След phase 4-5 |
| 7 | End-to-end тестване | Всички |

---

## ✅ Финални решения (потвърдени)

| Въпрос | Решение |
|---|---|
| Auto-login след reset? | ❌ **НЕ** — запазваме сегашното поведение, user отива на login |
| Audit log? | ✅ **ДА** — нова таблица `admin_user_actions`, immutable, 1 година retention, cron cleanup |
| Audit log детайли | дата, тип, admin email, target email, IP, user agent, JSON details, success |
| Audit log filters | дата (от/до), admin email, target email, action type, success |
| Audit log export | PDF (reuse на pdfkit infrastructure) |
| Audit log limit | server-side max 100 на страница, max 5000 в export |
| Audit log notifications | ✅ ДА — reuse на `admin_notification` таблицата |
| Rate limit на SMS опити | **5 опита** (целевата група са възрастни хора) |
| Reset link валидност | **24 часа** (същата за SMS код) |
| Email sender | `info@pensa.club` (както при invitation) |
| Controller файл | Нов `userManagementController.js` |
| Service файл | Разширяваме съществуващия `adminService.jsx` |
| Provider rule | ✅ Strictly enforced — service → context → component |

---

## ✅ Потвърдени решения от теб

- [x] **SMS код:** 6 цифри
- [x] **Достъп:** само admin role
- [x] **Permission:** admin-only RBAC
- [x] **UI:** един компонент с 2 таба
- [x] **Phone fallback:** B + V (admin може да изпрати без SMS ИЛИ да въведе телефон ръчно)
- [x] **SMS storage:** нова колона `reset_sms_code_hash`
- [x] **Сценарии А и Б** — две различни логики, споделят само email lookup и UI

---

## 📚 Reuse от съществуващия код

| Reused | От къде |
|---|---|
| Invitation flow | `SEMINAR_GUEST_INVITATION_PLAN.md` (sendGuestInvitationEmail, /accept-invitation page) |
| Reset token + expiration | `/auth/request-reset-password` + `/auth/reset-password` |
| SMS infrastructure | `server/src/utils/smsService.js` (Twilio integration) |
| Email infrastructure | `server/src/utils/zohoEmails.js` (Zoho integration) |
| Auto-login pattern | `/accept-invitation` endpoint |
| User profile structure | `userInclude` в `authController.js` |
| RBAC pattern | Existing admin endpoints |
