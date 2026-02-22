# План: Admin Site Settings Page

## Обобщение
Нова страница "Настройки на сайта" за админи — управление на GlobalSnowfall и ChristmasGreetingModal чрез toggle бутони. Backend с PostgreSQL + Sequelize, frontend с React. Проектирана за лесно добавяне на бъдещи настройки.

---

## 1. BACKEND

### 1.1 Нов модел: `site_setting`
**Файл:** `server/src/sequelize/models/site_setting.js`

Key-value подход за гъвкавост:
```
id:          INTEGER (PK, auto-increment)
key:         STRING (unique, not null) — напр. 'snowfall_enabled'
value:       STRING (not null) — 'true' / 'false' (stringify-нати стойности)
type:        STRING — 'boolean', 'string', 'number' (за бъдеща валидация)
category:    STRING — 'seasonal', 'general', 'appearance' (за групиране)
description: STRING — описание на настройката
createdAt:   DATE
updatedAt:   DATE
```

### 1.2 Миграция
**Файл:** `server/src/sequelize/migrations/YYYYMMDDHHMMSS-create-site-setting.js`
- Създава таблица `site_settings`
- Seed с начални стойности:
  - `snowfall_enabled: false, type: 'boolean', category: 'seasonal'`
  - `christmas_greeting_enabled: false, type: 'boolean', category: 'seasonal'`

### 1.3 Контролер: `siteSettingsController.js`
**Файл:** `server/src/controllers/siteSettingsController.js`

Endpoints:
- **GET /** — връща всички настройки (публичен, с `isAuth.allowGuest`)
  - RBAC: `checkPermission('siteSettings', 'read')`
  - Отговор: `{ settings: { snowfall_enabled: true, christmas_greeting_enabled: false, ... } }`
- **PUT /** — обновява една или повече настройки (само admin)
  - Тяло: `{ settings: { snowfall_enabled: true } }`
  - Middleware: `isAuth` + `checkPermission('siteSettings', 'update')`
  - Валидация с Zod

### 1.4 Zod схема
**Файл:** `server/src/schemas/siteSettings.schema.js`
```javascript
updateSettingsSchema = z.object({
  settings: z.record(z.string(), z.union([z.boolean(), z.string(), z.number()]))
})
```

### 1.5 RBAC конфигурация
**Файл:** `server/src/config/rbacConfig.js` — добавяне на нов ресурс:
```javascript
siteSettings: {
  read: ROLES.PUBLIC_WITH_LIMITED,  // всички четат (за GlobalSnowfall и др.)
  update: ['admin'],                // само admin пише
}
```

### 1.6 Router
**Файл:** `server/src/router.js` — добавяне:
```javascript
router.use('/admin/site-settings', siteSettingsController);
```

---

## 2. FRONTEND

### 2.1 Нов Context: `SiteSettingsAdminContext.jsx`
**Файл:** `client/src/components/contexts/SiteSettingsAdminContext.jsx`

- Зарежда настройките при стартиране на App (GET /api/admin/site-settings)
- Предоставя: `{ settings, updateSetting, isLoading }`
- `updateSetting(key, value)` — PUT заявка + обновяване на локалния state
- Обвива App.jsx (добавя се в provider йерархията)

### 2.2 Нова страница: `SiteSettingsAdmin`
**Файл:** `client/src/components/SiteSettingsAdmin/SiteSettingsAdmin.jsx` + `siteSettingsAdmin.css`
**CSS prefix:** `ssa-`

Layout:
```
┌─────────────────────────────────────────┐
│ 🛠️  Настройки на сайта                 │
│ Управлявайте глобалните функции         │
├─────────────────────────────────────────┤
│                                         │
│ ┌─ Сезонни функции ──────────────────┐ │
│ │                                     │ │
│ │  ❄️ Снежинки           [═══●] ON   │ │
│ │  Показва анимирани снежинки...      │ │
│ │                                     │ │
│ │  🎄 Коледно поздравление  [●═══] OFF│ │
│ │  Показва коледен видео модал...     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ Бъдещи секции ────────────────────┐ │
│ │  (тук ще се добавят нови)          │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2.3 Подкомпонент: `SettingsAdminSection`
**Файл:** `client/src/components/SiteSettingsAdmin/SettingsAdminSection/SettingsAdminSection.jsx` + `settingsAdminSection.css`
**CSS prefix:** `sas-`

Props: `{ title, icon, description, children }`
- Card с заглавие, иконка и описание
- `children` = списък от SettingsAdminToggle компоненти

### 2.4 Подкомпонент: `SettingsAdminToggle`
**Файл:** `client/src/components/SiteSettingsAdmin/SettingsAdminToggle/SettingsAdminToggle.jsx` + `settingsAdminToggle.css`
**CSS prefix:** `sat-`

Props: `{ settingKey, title, description, icon, value, onChange, isLoading }`
- Стилен анимиран ON/OFF toggle с плавен slide
- Заглавие + описание + статус индикатор (зелена/сива точка)
- Loading spinner при запазване

### 2.5 Custom Hook: `useSiteSettingsAdmin.js`
**Файл:** `client/src/hooks/useSiteSettingsAdmin.js`
- `fetchSettings()` — GET заявка
- `updateSetting(key, value)` — PUT заявка
- Error/success handling
- Loading state per-setting

### 2.6 Дизайн / Цветова гама
**Тъмна тема (default):**
- Основен фон: `#0f172a` (slate-900)
- Card фон: `rgba(15, 23, 42, 0.6)` с `backdrop-filter: blur`
- Акцент: emerald `#10b981` за ON state
- Вторичен акцент: violet `#8b5cf6` за hover/glow ефекти
- Toggle OFF: slate `#475569`
- Toggle ON: emerald `#10b981` с glow
- Текст: `#e2e8f0` (заглавия), `#94a3b8` (описания)
- Border: `rgba(139, 92, 246, 0.1)` (violet tint)

**Светла тема (`[data-theme="light"]`):**
- Основен фон: `#f8fafc`
- Card фон: `#ffffff` с `border: 1px solid #e2e8f0` и shadow
- Акцент: emerald `#059669` за ON
- Вторичен акцент: violet `#7c3aed`
- Toggle OFF: `#cbd5e1`
- Toggle ON: `#10b981`
- Текст: `#1e293b` (заглавия), `#475569` (описания)

### 2.7 Responsive
- Desktop (>1024px): max-width 800px, centered
- Tablet (768-1023px): padding намалено
- Mobile (≤767px): full-width, cards stack vertically
- Small mobile (≤480px): по-малки padding/font-size

---

## 3. ИНТЕГРАЦИЯ

### 3.1 SiteSettingsAdminContext в App.jsx
- Добавя се `<SiteSettingsAdminProvider>` в provider йерархията
- Обвива всичко, за да е достъпен от GlobalSnowfall и ChristmasGreetingModal

### 3.2 GlobalSnowfall — четене от settings
**Файл:** `client/src/components/GlobalSnowfall/GlobalSnowfall.jsx`
- Добавя `useSiteSettingsAdmin()` context
- Ако `settings.snowfall_enabled !== true` → return null
- Без промяна на визуалния компонент

### 3.3 ChristmasGreetingModal — четене от settings
**Файл:** `client/src/components/ChristmasGreetingModal/ChristmasGreetingModal.jsx`
- Добавя `useSiteSettingsAdmin()` context
- Ако `settings.christmas_greeting_enabled !== true` → return null (преди всичко друго)
- Разкоментира се в App.jsx (сега е коментиран)

### 3.4 Profile — линк към настройки
**Файл:** `client/src/components/Profile/Profile.jsx`
- В админ менюто (секция `{(isAdmin || isModerator) && ...}`) добавя нов елемент:
- "Настройки на сайта" с иконка Settings/Sliders
- `<Link to="/admin/site-settings">`
- Видим САМО за `isAdmin` (не за moderator)

### 3.5 Route в App.jsx
```jsx
<Route path="/admin/site-settings" element={<AdminGuard><SiteSettingsAdmin /></AdminGuard>} />
```

---

## 4. i18n ПРЕВОДИ

Добавяне в `client/public/locales/[bg|en|de]/translation.json`:

```json
"siteSettingsAdmin": {
  "title": "Настройки на сайта",
  "subtitle": "Управлявайте глобалните функции на сайта",
  "seasonal": "Сезонни функции",
  "seasonalDesc": "Включване и изключване на сезонни декорации и поздравления",
  "snowfall": "Снежинки",
  "snowfallDesc": "Показва анимирани снежинки по целия сайт",
  "christmasGreeting": "Коледно поздравление",
  "christmasGreetingDesc": "Показва коледен видео модал при първо посещение",
  "enabled": "Включено",
  "disabled": "Изключено",
  "saving": "Запазване...",
  "saveSuccess": "Настройката е запазена успешно",
  "saveError": "Грешка при запазване на настройката",
  "loadError": "Грешка при зареждане на настройките",
  "backToProfile": "Обратно към профила"
}
```
(+ en и de версии)

---

## 5. ПЪЛЕН СПИСЪК ФАЙЛОВЕ

### Нови файлове (12):
1. `server/src/sequelize/models/site_setting.js`
2. `server/src/sequelize/migrations/YYYYMMDDHHMMSS-create-site-setting.js`
3. `server/src/controllers/siteSettingsController.js`
4. `server/src/schemas/siteSettings.schema.js`
5. `client/src/components/contexts/SiteSettingsAdminContext.jsx`
6. `client/src/components/SiteSettingsAdmin/SiteSettingsAdmin.jsx`
7. `client/src/components/SiteSettingsAdmin/siteSettingsAdmin.css`
8. `client/src/components/SiteSettingsAdmin/SettingsAdminSection/SettingsAdminSection.jsx`
9. `client/src/components/SiteSettingsAdmin/SettingsAdminSection/settingsAdminSection.css`
10. `client/src/components/SiteSettingsAdmin/SettingsAdminToggle/SettingsAdminToggle.jsx`
11. `client/src/components/SiteSettingsAdmin/SettingsAdminToggle/settingsAdminToggle.css`
12. `client/src/hooks/useSiteSettingsAdmin.js`

### Модифицирани файлове (7):
13. `server/src/router.js` — добавяне на нов route
14. `server/src/config/rbacConfig.js` — добавяне на `siteSettings` resource
15. `client/src/App.jsx` — SiteSettingsAdminProvider + нов route + uncomment ChristmasGreetingModal
16. `client/src/components/Profile/Profile.jsx` — линк към настройки в админ менюто
17. `client/src/components/GlobalSnowfall/GlobalSnowfall.jsx` — четене от context
18. `client/src/components/ChristmasGreetingModal/ChristmasGreetingModal.jsx` — четене от context
19. `client/public/locales/bg/translation.json` + `en/translation.json` + `de/translation.json` — i18n

---

## 6. РЕД НА ИЗПЪЛНЕНИЕ

### Фаза 1: Backend (модел, миграция, контролер)
1. Създай модел `site_setting`
2. Създай миграция
3. Добави RBAC config за `siteSettings`
4. Създай Zod schema
5. Създай контролер с GET/PUT endpoints
6. Регистрирай в router.js

### Фаза 2: Frontend Infrastructure
7. Създай `useSiteSettingsAdmin` hook
8. Създай `SiteSettingsAdminContext`
9. Добави provider в App.jsx

### Фаза 3: Frontend UI
10. Създай `SettingsAdminToggle` подкомпонент + CSS
11. Създай `SettingsAdminSection` подкомпонент + CSS
12. Създай `SiteSettingsAdmin` страница + CSS
13. Добави route в App.jsx
14. Добави линк в Profile.jsx

### Фаза 4: Интеграция
15. Модифицирай GlobalSnowfall да чете от context
16. Модифицирай ChristmasGreetingModal да чете от context
17. Разкоментирай ChristmasGreetingModal в App.jsx

### Фаза 5: i18n
18. Добави bg преводи
19. Добави en преводи
20. Добави de преводи

---

## 7. Toast система
Проверка дали проектът вече има toast библиотека (react-toastify, react-hot-toast и т.н.). Ако няма — ще се добави проста toast система или react-hot-toast. Ако има — ще се използва съществуващата.
