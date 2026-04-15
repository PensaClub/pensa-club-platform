# 🏫 Семинари — Пълен Flow v1
## Версия 1 (2026-03-20)

---

## 📖 Какво е семинар

Семинар е **присъствено или онлайн събитие** организирано от DigiBridge Academy. Може да бъде еднократно или многодневно. Провежда се в пенсионерски клуб, онлайн, или хибридно. Менторът води семинара, записва присъстващи и може да стриймва на живо.

**Типове:** workshop, discussion, hands_on, q_and_a

---

## 👤 Роли и достъп

| Роля | Какво може |
|------|-----------|
| **Админ** | Създава, редактира, трие семинари. Управлява присъствие. Одобрява записвания. Вижда всичко. |
| **Ментор** | Редактира семинари на които е назначен. Записва присъстващи на място. Стриймва на живо. Качва материали и видеа. Определя ниво на участие. |
| **Потребител (ученик)** | Разглежда каталога. Записва се за семинар. Гледа видеа. Сваля материали. Решава тест. Получава кредити. |
| **Гост** | Менторът го записва на място. Няма профил. Не получава кредити. Присъства за отчетност. |

---

## 🔄 Пълен Flow

### ФАЗА А — Админ създава семинар

**Път:** Profile → Академия → Създай семинар → `/academy/admin/create-seminar`
**Компонент:** `SeminarCreateForm` (scf-)

**Стъпки:**
1. Попълва основна информация (заглавие, описание, категория, тип, тагове, learning points)
2. Задава график (начална дата, крайна дата, продължителност, часова зона)
3. Избира формат:
   - **Присъствено** → попълва локация + адрес
   - **Онлайн** → попълва meeting link + парола
4. Качва **thumbnail** (снимка за картата)
5. Качва **видеа** (няколко, YouTube/Vimeo/директни линкове + файлове)
6. Качва **материали** (PDF, DOCX, PPTX, снимки, архиви — всичко)
7. Избира **ментор** (AcademyMentorPicker)
8. Настройва регистрация:
   - Макс. участници / Мин. участници
   - Изисква регистрация (да/не)
   - Изисква одобрение (да/не)
   - Публичен (да/не)
9. Настройва кредити:
   - За присъствие (creditsForAttendance)
   - За участие (creditsForParticipation) — определя се от ментора по-късно
   - За тест (creditsForTest)
10. Включва/изключва тест (hasTest) + задание (hasAssignment)
11. Свързва с курс (по избор)
12. Записва като **чернова** или **публикува**

### ФАЗА Б — Админ редактира семинар

**Път:** `/academy/admin/edit-seminar/:slug`
**Компонент:** `EditSeminar` (esem-)

**Допълнително спрямо създаването:**
- Управлява тест (TestEditorModal) — добавя/редактира въпроси
- Качва/трие материали и видеа
- Публикува / скрива / отменя семинар
- Вижда статус (draft, published, scheduled, live, completed, cancelled)

### ФАЗА В — Админ управлява списъка

**Път:** `/academy/admin/seminars`
**Компонент:** `AdminAcademySeminarsList` (aalcs-)

- Карти с филтри (статус, тип, сортиране, търсене)
- Бутони: редактирай, изтрий, публикувай/скрий, отмени (с причина)

---

## 🌐 Потребител (ученик)

### 1. Разглежда каталога

**Път:** `/academy/seminars`
**Компонент:** `AcademySeminars` (asem-)

- Карти с филтри (всички, предстоящи, проведени)
- Търсене по заглавие, описание, категория, локация
- Категории чипове
- Сортиране (по дата, популярни, по заглавие)
- Pagination — server-side, "Зареди още" бутон
- Всяка карта показва: thumbnail, статус badge, категория, заглавие, описание, дата, локация/онлайн, ментор, кредити, тест badge, spots bar

### 2. Отваря детайли

**Път:** `/academy/seminars/:slug`
**Компонент:** `AcademySeminarDetail` (asd-)

**Hero секция:**
- Breadcrumb
- Status badge (В МОМЕНТА / ПРЕДСТОИ / ПРИКЛЮЧИЛ / ОТМЕНЕН)
- Type badge (Работилница / Дискусия / Практика / Q&A)
- Approval badge (ако изисква одобрение)
- Категория + заглавие + описание
- Мета: дата, час, продължителност, локация/онлайн, преглеждания
- Quick stats: кредити, записани, присъствали
- Връзка към свързан курс

**Action Card (дясна колона):**
- **Upcoming / Live:** countdown, бутон "Запиши се" / "Отпиши се", spots bar, бележка за одобрение
- **Live + онлайн:** бутон "Присъедини се" (meeting link)
- **Completed:** "Семинарът е приключил", "Записването е затворено", брой присъствали
- **Cancelled:** причина за отмяна
- Видео player (YouTube/Vimeo embed или линк)
- Бутон "Реши теста" (ако hasTest)
- Кредити breakdown (присъствие + участие + тест = общо)
- Бутон "Сподели"

**Табове:**
- **Преглед** — описание, learning points, локация + адрес, изисквания, какво да носите, задание, ментор, свързан курс, тагове
- **Видеа** — списък с качени видеа (YouTube embed + файлове)
- **Материали** — списък за сваляне (PDF, DOCX, снимки и т.н.)

### 3. Записва се

**Кога:** статус upcoming ИЛИ live
**Бутон:** "Запиши се"
**Логика:**
- Ако не е логнат → пренасочва към login
- Ако `requiresApproval: true` → статус `pending`, показва "Записването изисква одобрение"
- Ако `requiresApproval: false` → статус `approved`, директно записан
- Ако няма свободни места → бутонът е disabled
- При записване → `registeredCount` се обновява
- Бутонът се сменя на "Отпиши се"

### 4. Решава тест

**Път:** `/academy/seminars/:slug/test`
**Компонент:** `AcademyTestPlayer` (seminar mode — 4-ти режим)

**Условие:** трябва да е маркиран като присъствал (`attended: true`)
**Награда:** кредити за тест (`creditsForTest`)

---

## 👨‍🏫 Ментор

### 1. Стриймване на живо (НОВО)

**Кога:** семинарът е `live`
**Как работи:**

Менторът не стриймва директно през платформата. Използва YouTube Live / YouTube Studio.

**Flow:**
1. Менторът започва YouTube Live stream от YouTube Studio или OBS
2. Копира YouTube Live URL
3. В `EditSeminar` или в менторски панел попълва:
   - `videoProvider: 'youtube'`
   - `meetingLink: 'https://youtube.com/live/...'` (за live)
   - `videoUrl: 'https://youtube.com/watch?v=...'` (запис след това)
4. Потребителите виждат embed player в детайлите на семинара
5. При live — показва се бутон "Присъедини се" + вграден YouTube player
6. След приключване — менторът обновява `videoUrl` с линк към записа

**Платформата НЕ хоства видео** — използва YouTube/Vimeo като CDN.

### 2. Качва видеа (НОВО)

**Къде:** `SeminarCreateForm` + `EditSeminar` — нова секция "Видеа"
**Какво може да качи:**
- YouTube линкове (embed автоматично)
- Vimeo линкове (embed автоматично)
- Директни видео файлове (MP4, WebM) → качват се в Firebase Storage
- Няколко видеа на семинар (масив)

**Модел:** `seminar_videos` таблица (НОВА)
```
id, seminarId, title, videoUrl, videoProvider (youtube/vimeo/file/custom),
thumbnailUrl, durationMinutes, sortOrder, createdAt, updatedAt
```

**Endpoints (НОВИ):**
- `POST /api/academy/seminars/:id/videos` — добави видео
- `DELETE /api/academy/seminars/:id/videos/:videoId` — изтрий видео
- `PUT /api/academy/seminars/:id/videos/reorder` — пренареди

### 3. Качва материали (НОВО в UI)

**Къде:** `SeminarCreateForm` + `EditSeminar` — нова секция "Материали"
**Какво може да качи:**
- Документи: PDF, DOCX, XLSX, PPTX, TXT
- Снимки: JPG, PNG, GIF, WebP
- Архиви: ZIP, RAR
- Аудио: MP3, WAV
- Презентации: PPTX, PDF

**Backend:** Вече съществува — `POST /api/academy/materials/seminars/:seminarSlug`
**Storage:** Firebase Storage → `academy/materials/seminars/:slug/`
**Модел:** `seminar_material` (вече съществува)

### 4. Записва присъстващи на място

**Път:** `/academy/admin/seminar-attendance` (достъпен и за ментори)
**Компонент:** `SeminarAttendancePage` (satp-) → `AttendanceForm` (satf-)

**Flow:**
1. Избира семинар от dropdown
2. Вижда общ списък участници (вече записани + гости)
3. Може да добави:
   - **Потребител от платформата** — търси по имейл/username → натиска "Запиши" → ВЕДНАГА заявка
   - **Гост без профил** — попълва име, фамилия, имейл, телефон → "Запиши гост" → ВЕДНАГА заявка
4. При добавяне → записът отива директно в базата, без "Запази" бутон за цялата група
5. Backend проверява: ако потребителят вече е присъствал → записва се за отчетност но НЕ получава кредити повторно

### 5. Определя ниво на участие

**Кога:** по всяко време след семинара (или по време на)
**Къде:** В списъка с участници (AttendanceForm)
**Нива:**
- **Active** — активно участвал → 100% от `creditsForParticipation`
- **Moderate** — частично участвал → 50% от `creditsForParticipation`
- **Passive** — само присъствал → 0% от `creditsForParticipation`

**Как:** бутони A / У / П до всеки участник → натискане → ВЕДНАГА заявка → кредитите се преизчисляват

### 6. Одобрява записвания (ако requiresApproval)

**Къде:** Admin panel или Mentor panel
**Endpoints:**
- `POST /api/academy/seminars/:id/registrations/:regId/approve`
- `POST /api/academy/seminars/:id/registrations/:regId/reject`
- `POST /api/academy/seminars/:id/registrations/bulk-approve`

---

## 💰 Кредитна система

### Как се натрупват кредити

| Действие | Поле | Кога се дават |
|----------|------|--------------|
| Присъствие | `creditsForAttendance` | При маркиране от ментора |
| Участие | `creditsForParticipation` | При промяна на participation level |
| Тест | `creditsForTest` | При успешно преминаване на теста |

### Формула

```
earnedCredits = creditsForAttendance
  + creditsForParticipation × levelMultiplier
  + (testPassed ? creditsForTest : 0)
```

**levelMultiplier:**
- active = 1.0
- moderate = 0.5
- passive = 0.0

### Защита от дублиране

- Ако потребител присъства повторно (многодневен семинар) → записва се за отчетност но кредити НЕ се дават втори път
- Backend проверява `student_seminar.attended === true` преди даване на кредити
- За гости: проверка по `firstName + lastName` в `seminar_guest_attendances`

### Къде се виждат

- `student_seminar.earnedCredits` — за конкретен семинар
- Student Dashboard → `totalCredits = courseCredits + lectureCredits + seminarCredits`
- Агрегация в `academyMyController.js` → `student_seminar.sum('earnedCredits')`

---

## 🎥 Видеа и медия (НОВО)

### Видеа на семинар

**Нова таблица:** `seminar_videos`

```sql
CREATE TABLE seminar_videos (
  id SERIAL PRIMARY KEY,
  seminar_id INTEGER NOT NULL REFERENCES seminars(id) ON DELETE CASCADE,
  title VARCHAR(500),
  video_url TEXT NOT NULL,
  video_provider VARCHAR(50) DEFAULT 'youtube',
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**videoProvider стойности:** youtube, vimeo, file, custom

**UI — Формата (SeminarCreateForm + EditSeminar):**
- Секция "Видеа"
- Бутон "Добави видео"
  - Поле за URL (YouTube/Vimeo/друг)
  - ИЛИ бутон за качване на файл (MP4/WebM → Firebase)
  - Заглавие (незадължително)
- Списък с качени видеа (drag & drop за пренареждане)
- Бутон за изтриване до всяко

**UI — Детайли (AcademySeminarDetail):**
- Таб "Видеа" (между Преглед и Материали)
- Списък с видеа — embed player за YouTube/Vimeo, download за файлове
- Главното видео (sortOrder: 0) се показва и в Action Card-а

### Стриймване на живо

**Не е директно от платформата.** Менторът:
1. Стартира stream в YouTube Studio / OBS → YouTube Live
2. Записва Live URL в семинара (meetingLink)
3. Платформата показва вграден YouTube player + бутон "Присъедини се"
4. След stream-а → менторът записва URL на записа в videoUrl

### Материали

**Вече съществуващ модел:** `seminar_material`
**Backend:** `POST /api/academy/materials/seminars/:seminarSlug` (съществува)
**Storage:** Firebase Storage

**Поддържани формати:**
- Документи: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
- Снимки: JPG, JPEG, PNG, GIF, WebP, SVG
- Видео: MP4, WebM, MOV
- Аудио: MP3, WAV, OGG
- Архиви: ZIP, RAR, 7Z
- Макс. размер: 50MB на файл

**UI — Формата (SeminarCreateForm + EditSeminar):**
- Секция "Материали"
- Drag & drop зона + бутон "Избери файлове"
- Списък с качени материали (иконка по тип, име, размер, бутон изтрий)
- Progress bar при качване

**UI — Детайли (AcademySeminarDetail):**
- Таб "Материали"
- Списък за сваляне (иконка, име, размер, бутон ⬇️)

---

## 🏗️ Нови компоненти и промени

### Нови компоненти

| Компонент | Prefix | Описание |
|-----------|--------|----------|
| SeminarVideosSection | scfv- | Секция за видеа в SeminarCreateForm + EditSeminar |
| SeminarMaterialsSection | scfm- | Секция за материали в SeminarCreateForm + EditSeminar |
| SeminarVideoPlayer | asdv- | Embed player в детайлите |

### Промени по съществуващи

| Компонент | Какво се добавя |
|-----------|----------------|
| SeminarCreateForm | Секции за видеа + материали |
| EditSeminar | Секции за видеа + материали |
| AcademySeminarDetail | Таб "Видеа", video player в action card |
| AcademyTestPlayer | Seminar mode (4-ти режим) |
| SeminarSettings (scft-) | Полета за videoProvider, meetingLink |

### Нови Backend endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/academy/seminars/:id/videos` | Добави видео |
| DELETE | `/api/academy/seminars/:id/videos/:videoId` | Изтрий видео |
| PUT | `/api/academy/seminars/:id/videos/reorder` | Пренареди видеа |

### Нова миграция

- `create-seminar-videos` — нова таблица

### Нов модел

- `seminar_video.js` — belongsTo seminar

---

## 📋 TODO по приоритет

### Критични (блокиращи)
1. ✅ Backend CRUD (Фаза 1)
2. ✅ Admin CRUD UI (Фаза 2)
3. ✅ SeminarAttendancePage (Фаза 2)
4. ✅ Публичен каталог — AcademySeminars (Фаза 3)
5. ✅ Детайли — AcademySeminarDetail (Фаза 3)
6. ⏳ AcademyTestPlayer seminar mode (Фаза 3)

### Важни (следващи)
7. ❌ Материали UI в SeminarCreateForm + EditSeminar
8. ❌ Видеа UI в SeminarCreateForm + EditSeminar (+ нова таблица)
9. ❌ Video player в AcademySeminarDetail
10. ❌ YouTube Live интеграция (meetingLink + embed)
11. ❌ Student Dashboard — записване от предстоящи (Фаза 4)
12. ❌ Mentor Dashboard — предстоящи семинари (Фаза 4)
13. ❌ Mentor attendance quick action (Фаза 4)

### Допълнителни
14. ❌ Pending approvals UI (admin + mentor)
15. ❌ Нотификации при записване/одобрение
16. ❌ QR код за бързо присъствие
17. ❌ iCal export
18. ❌ Оценка на семинар (rating + review)
19. ❌ SMS нотификации

---

## 📁 Файлова структура

```
src/components/
├── AcademySeminars/
│   ├── AcademySeminars.jsx (asem-)
│   ├── academySeminars.css
│   ├── SeminarsHero/
│   │   ├── SeminarsHero.jsx (asmh-)
│   │   └── seminarsHero.css
│   ├── SeminarsFilters/
│   │   ├── SeminarsFilters.jsx (asmfl-)
│   │   └── seminarsFilters.css
│   ├── SeminarCatalogCard/
│   │   ├── SeminarCatalogCard.jsx (ascc-)
│   │   └── seminarCatalogCard.css
│   └── AcademySeminarDetail/
│       ├── AcademySeminarDetail.jsx (asd-)
│       └── academySeminarDetail.css
│
├── SeminarCreateForm/
│   ├── SeminarCreateForm.jsx (scf-)
│   ├── seminarCreateForm.css
│   ├── SeminarBasicInfo/ (scfb-)
│   ├── SeminarSchedule/ (scfs-)
│   ├── SeminarSettings/ (scft-)
│   ├── SeminarAdditional/ (scfa-)
│   ├── SeminarVideosSection/ (scfv-) ← НОВО
│   └── SeminarMaterialsSection/ (scfm-) ← НОВО
│
├── AdminAcademySeminarsList/
│   ├── AdminAcademySeminarsList.jsx (aalcs-)
│   ├── adminAcademySeminarsList.css
│   ├── SeminarCard/ (asmc-)
│   ├── SeminarFilters/ (asmf-)
│   ├── SeminarModals/ (asmm-)
│   ├── EditSeminar/
│   │   ├── EditSeminar.jsx (esem-)
│   │   └── editSeminar.css
│   └── SeminarAttendancePage/
│       ├── SeminarAttendancePage.jsx (satp-)
│       ├── seminarAttendancePage.css
│       └── AttendanceForm/
│           ├── AttendanceForm.jsx (satf-)
│           └── attendanceForm.css
```

---

## 🗺️ Routes

### Public
```
/academy/seminars                → AcademySeminars (каталог)
/academy/seminars/:slug          → AcademySeminarDetail (детайли)
/academy/seminars/:slug/test     → AcademyTestPlayer (seminar mode)
```

### Admin / Mentor
```
/academy/admin/seminars              → AdminAcademySeminarsList
/academy/admin/create-seminar        → SeminarCreateForm
/academy/admin/edit-seminar/:slug    → EditSeminar
/academy/admin/seminar-attendance    → SeminarAttendancePage
```
