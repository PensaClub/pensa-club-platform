# 📘 Claude Code — Личен справочник

> Лично четиво за научаване на Claude Code постепенно.
> Не се commit-ва (по правилата от memory).

---

## 📑 Съдържание

1. [Бърз cheatsheet](#бърз-cheatsheet)
2. [Slash команди по категории](#slash-команди-по-категории)
3. [@ mentions — препратки към файлове](#-mentions--препратки-към-файлове)
4. [Клавишни комбинации](#клавишни-комбинации)
5. [Какво могат built-in tools-овете](#какво-могат-built-in-tools-овете)
6. [Subagents (Task tool)](#subagents-task-tool)
7. [Memory система](#memory-система)
8. [Permission modes (Shift+Tab)](#permission-modes-shifttab)
9. [Hooks — автоматизации](#hooks--автоматизации)
10. [MCP сървъри — интеграции](#mcp-сървъри--интеграции)
11. [Plugins — разширения](#plugins--разширения)
12. [Vim режим](#vim-режим)
13. [Практически tips](#практически-tips)

---

## 🎯 Бърз cheatsheet

```
/                — Slash команди (dropdown)
@                — Препратка към файл/папка
!command         — Изпълни bash команда директно (без да минава през Claude)
# bookmark text  — Запази бележка в memory
↑ / ↓            — История на предишните prompts
Enter            — Изпрати съобщение
Shift+Enter      — Нов ред (мултилиниен вход)
Ctrl+C           — Прекъсва текуща операция
Esc + Esc        — Rewind/отмотаване (връща назад)
Shift+Tab        — Цикъл през permission modes
Ctrl+O           — Покажи transcript view
Ctrl+B           — Пусни команда във фона
```

---

## 🎯 Slash команди по категории

### 📦 Сесия (управление на разговора)

| Команда | Какво прави |
|---|---|
| `/help` | Показва помощ + всички достъпни команди |
| `/clear` (`/reset`, `/new`) | Изтрива историята на разговора, освобождава контекст |
| `/compact [инструкции]` | Компресира предишни съобщения, запазва ключовото |
| `/context` | Визуализира текущото използване на контекст като цветна мрежа |
| `/copy [N]` | Копира последния отговор (или N-ти) в clipboard |
| `/rewind` (`/checkpoint`) | Отмотава разговор и/или код до предишна точка |
| `/exit` (`/quit`) | Изход от Claude Code |
| `/rename [име]` | Преименува текущата сесия |
| `/resume [сесия]` (`/continue`) | Възобновява разговор по ID или име |
| `/branch [име]` (`/fork`) | Създава разклонение на разговора |
| `/export [файл]` | Експортира разговора като текст |
| `/btw <въпрос>` | Бърз въпрос **без** да се добавя към историята |

### 🤖 Модел и AI настройки

| Команда | Какво прави |
|---|---|
| `/model [модел]` | Избира модел (Haiku/Sonnet/Opus); ←/→ регулират effort level |
| `/effort [low\|medium\|high\|max\|auto]` | Задава "усилие" на разсъждение (max само за Opus) |
| `/fast [on\|off]` | Включва/изключва fast mode (по-бърз отговор) |
| `/config` (`/settings`) | Отваря интерфейс за настройки (тема, модел, стил) |
| `/status` | Показва: версия, модел, акаунт, свързаност |
| `/theme` | Сменя цветната тема |
| `/color [цвят\|default]` | Цвят на командния ред за тази сесия |

### 📋 Планиране и Plan mode

| Команда | Какво прави |
|---|---|
| `/plan [описание]` | Влиза в **Plan mode** — само разсъждавам, без редакции |
| `/ultraplan <prompt>` | Изпраща задачата на Claude Code on the web — драфтва план в продължение на минути, преглеждаш и одобряваш |
| `/batch <инструкция>` | **Голямо парче** — оркестрира 5-30 паралелни worktree агента, всеки прави част от работата и отваря отделен PR |
| `/loop [интервал] <prompt>` | Изпълнява prompt многократно на интервал (напр. `/loop 5m провери deploy-а`) |
| `/schedule [описание]` | Cron-базирани scheduled remote agents |

### 🔧 Tools, debug и анализ

| Команда | Какво прави |
|---|---|
| `/debug [описание]` | Активира debug logging + диагностицира проблем |
| `/doctor` | Диагностика на инсталацията и настройките |
| `/diff` | Интерактивен преглед на промени (git diff + per-turn) |
| `/cost` | Статистика за използване на токени и долари |
| `/usage` | Лимити на плана + rate limit статус |
| `/stats` | Дневна употреба, история на сесии, серии, модели |
| `/insights` | Генерира отчет с анализ на твоите Claude Code сесии |
| `/extra-usage` | Конфигуриране при проблеми с лимитите |

### 🧠 Memory, Skills и Agents

| Команда | Какво прави |
|---|---|
| `/memory` | Редактира CLAUDE.md + управлява auto-memory |
| `/skills` | Списък на достъпни skills |
| `/agents` | Управлява конфигурации на subagents |
| `/init` | Инициализира CLAUDE.md в нов проект |

### 📂 Файлове и директории

| Команда | Какво прави |
|---|---|
| `/add-dir <път>` | Добавя нова работна директория към текущата сесия |

### 🔌 Plugins, MCP, Hooks

| Команда | Какво прави |
|---|---|
| `/plugin` | Управление на Claude Code plugins |
| `/reload-plugins` | Reload на active plugins без рестарт |
| `/mcp` | MCP сървъри + OAuth authentication |
| `/hooks` | Преглед на hook конфигурации |
| `/permissions` (`/allowed-tools`) | Управление на allow/ask/deny правила за tools |
| `/privacy-settings` | Privacy опции (Pro/Max) |

### 💻 Платформа и device

| Команда | Какво прави |
|---|---|
| `/desktop` (`/app`) | Продължава сесията в Claude Desktop приложение |
| `/mobile` (`/ios`, `/android`) | QR код за мобилното приложение |
| `/remote-control` (`/rc`) | Активира remote control от claude.ai |
| `/teleport` (`/tp`) | Тегли web Claude Code сесия в този терминал |
| `/web-setup` | Свързва GitHub акаунт за web sessions |
| `/chrome` | Настройки за Claude in Chrome |
| `/ide` | IDE интеграции (VS Code, JetBrains) |
| `/terminal-setup` | Конфигурира Shift+Enter и други shortcuts за твоя terminal |
| `/keybindings` | Отваря/създава config файл за клавишни комбинации |
| `/voice` | Voice dictation (push-to-talk) |
| `/sandbox` | Включва/изключва sandbox режим |

### 🌐 GitHub, Slack и Integrations

| Команда | Какво прави |
|---|---|
| `/install-github-app` | Инсталира Claude GitHub Actions app за repo |
| `/install-slack-app` | Инсталира Claude Slack app |
| `/autofix-pr [prompt]` | Спавнва сесия която следи PR и пуша фиксове |

### 👤 Account и administration

| Команда | Какво прави |
|---|---|
| `/login` | Login в Anthropic акаунта |
| `/logout` | Logout |
| `/upgrade` | Страница за upgrade към по-висок план |
| `/passes` | Сподели седмица Claude Code с приятели → бонус usage |
| `/release-notes` | Changelog в interactive version selector |
| `/feedback [отчет]` (`/bug`) | Подава feedback за Claude Code |
| `/contact-support` | Форма за контакт с поддръжката |

### 🎓 Learning

| Команда | Какво прави |
|---|---|
| `/powerup` | **Интерактивни уроци** за Claude Code features |

---

## 📎 @ mentions — препратки към файлове

Когато въведеш `@`, Claude предлага автозавършване на пътища.

### Примери

```
@client/src/components/AcademyForm.jsx
   ↑ прочита този файл и го слага в контекста

@client/src/components/SiteSettingsAdmin/
   ↑ прочита цялата папка (структура)

@CLAUDE.md
   ↑ референция към главните правила
```

### Кога са най-полезни

- **Дебъг**: "Поправи бъга в @AttendanceForm.jsx" → веднага виждам кода без да го търся
- **Сравняване**: "Сравни @file1.js с @file2.js"
- **Pattern matching**: "Направи компонент по същия pattern като @ExistingComponent.jsx"
- **Документация**: "Провери @CLAUDE.md и кажи дали правилата позволяват X"

---

## ⌨️ Клавишни комбинации

### Общо управление

| Клавиш | Действие |
|---|---|
| `Enter` | Изпраща съобщението |
| `Shift+Enter` или `Option+Enter` (macOS) | Нов ред в мултилиниен вход |
| `\` + `Enter` | Алтернативен начин за нов ред (всички терминали) |
| `Ctrl+C` | Отмяна на текущо въвеждане или генериране |
| `Ctrl+D` | Изход от Claude Code (EOF) |
| `Ctrl+L` | Изчиства командния ред (без да трие историята) |
| `Ctrl+R` | Обратно търсене в историята |
| `Ctrl+O` | Включва/изключва transcript preview (детайлно tool usage) |
| `Ctrl+T` | Включва/изключва списък със задачи |
| `Ctrl+B` | Пусни команда във фона |
| `Ctrl+G` или `Ctrl+X Ctrl+E` | Отваря текстов редактор по default |
| `Ctrl+V` или `Cmd+V` | Paste изображение от clipboard |
| `Esc` + `Esc` | Rewind / отмотаване / обобщаване |
| `Shift+Tab` или `Alt+M` | Цикъл през permission modes |
| `Option+P` (mac) / `Alt+P` (win/linux) | Превключване на модел без триене на ред |
| `Option+T` / `Alt+T` | Включва extended thinking (ultrathink) |
| `Option+O` / `Alt+O` | Включва fast mode |
| `↑ / ↓` | Навигация през историята |
| `← / →` | Цикъл през табове в диалози/менюта |

### Редактиране на текст (readline-стил)

| Клавиш | Действие |
|---|---|
| `Ctrl+K` | Изтрива до края на реда |
| `Ctrl+U` | Изтрива от курсор до началото на реда |
| `Ctrl+Y` | Paste изтрит текст |
| `Alt+Y` (след Ctrl+Y) | Цикъл през paste историята |
| `Alt+B` | Курсор една дума назад |
| `Alt+F` | Курсор една дума напред |

---

## 🔥 Специални префикси

### `!` префикс — bash директно

```bash
! npm test
! git status
! ls -la
```

- Изпълнява команда **без** да минава през Claude
- Резултатът отива в чата → става контекст за следващия ми отговор
- Реално-време прогрес
- Поддържа фоново изпълнение (`Ctrl+B`)
- **Не изисква** одобрение

### `#` префикс — бърза memory бележка

```
# CSS rule: every component has unique CSS prefix
```

→ Запазва се автоматично в auto-memory.

---

## 🛠️ Какво могат built-in tools-овете

Имам пряк достъп до:

| Tool | Какво прави | Заместя ръчните |
|---|---|---|
| **Read** | Чете файлове (текст, код, изображения, PDF) | cat, head, tail |
| **Write** | Създава нов файл | echo > file, cat << EOF |
| **Edit** | Прави exact string replacement в файл | sed |
| **Glob** | Намира файлове по pattern | find, ls |
| **Grep** | Търси текст с regex | grep, rg |
| **Bash** | Изпълнява shell команди | npm, git, docker, всичко |
| **WebFetch** | Чете публични URL-и | curl |
| **WebSearch** | Интернет търсене | — |
| **Task** | Пуска subagent | — |

**Не само текст** — мога да чета и:
- 🖼 Изображения (PNG, JPG)
- 📄 PDF документи
- 📓 Jupyter notebooks (.ipynb)
- 📊 Текстови формати (csv, json, xml, yaml)

---

## 🤖 Subagents (Task tool)

Subagents са **отделни Claude инстанции**, които пускам във фон за специфични задачи. Те имат собствен контекст (не виждат текущия ни разговор) и връщат само финален резултат.

### Built-in subagents

| Агент | Кога |
|---|---|
| **Explore** | Бързо/задълбочено търсене в кодовата база |
| **Plan** | Дизайн на implementation план преди да започнем |
| **claude-code-guide** | Въпроси за самия Claude Code |
| **general-purpose** | Сложни research задачи с много стъпки |

### Как се извикват

❌ Грешно: `/Explore` (няма такава slash command)

✅ Правилно: с думи
```
"намери къде се ползва inviteGuestToRegister"
   → аз решавам да пусна Explore агент

"направи план как да добавим forum search"
   → аз решавам да пусна Plan агент

"как се настройват hooks?"
   → аз пускам claude-code-guide агент
```

Можеш и изрично да поискаш: *"пусни Explore агент за това"*.

### Кога са полезни

- **Защитават контекста ми** — резултатите от тежки търсения не пълнят моя контекст
- **Паралелизация** — мога да пусна 5 агента наведнъж за независими задачи
- **Worktree isolation** (`/batch`) — масови промени без да чупим develop-а

---

## 🧠 Memory система

Имам **persistent memory** между разговори. Живее в:
```
C:\Users\User\.claude\projects\C--Users-User-Documents-GitHub-Digital-Literacy-Wellbeing-60-plus\memory\
```

### Структура

| Файл | Цел |
|---|---|
| `MEMORY.md` | Главен индекс — виждам го винаги в началото на разговор |
| `feedback_*.md` | Твои правила и предпочитания (напр. git workflow rules) |
| `project_*.md` | Pending плановe и информация за проектни инициативи |
| `reference_*.md` | Техническа документация (SEO, VPS) |
| `user_profile.md` | Лична информация за теб |
| `plans-archive/` | Архивирани планове |

### Два типа memory

**1. CLAUDE.md (project-level)** — в корена на проекта
- Commit-ва се (всички разработчици на проекта го виждат)
- Универсални правила за проекта
- Архитектура, конвенции, команди

**2. Auto-memory (.claude/memory/)** — лично за теб
- НЕ се commit-ва
- Лични правила и preferences
- Project plans, work history

### Как се добавя нещо

- Просто кажи "запомни че..." или "запази в memory: ..."
- Или *"добави feedback файл за X правило"*
- Или **`# bookmark text`** като bash префикс — бърз bookmark

### Команди

- `/memory` — отваря memory manager
- `/init` — инициализира CLAUDE.md за нов проект

---

## 🎚 Permission modes (Shift+Tab)

Натискай **Shift+Tab** за цикъл през 4 режима:

| Режим | Поведение |
|---|---|
| **1. Default** | Питам преди destructive операции (write, edit, bash) |
| **2. Auto-accept edits** | Редактирам файлове + изпълнявам често-използвани команди БЕЗ да питам |
| **3. Plan mode** | **Само четене** — създавам план без никакви промени. Идеално за preview |
| **4. Auto mode** | Оценявам действия с фонови защитни проверки (research mode) |

### Кога кой режим

- **Default** — нормална работа, безопасност first
- **Auto-accept** — когато правим много дребни промени и доверяваш на действията ми
- **Plan mode** — преди голяма задача → "покажи ми план първо"
- **Auto mode** — за дълги, независими research задачи

---

## 🪝 Hooks — автоматизации

Hooks са **shell команди**, които системата (не аз) изпълнява автоматично при определени events.

### Примери

```json
{
  "hooks": {
    "preToolUse": [
      {
        "matcher": "Bash(git push:*)",
        "command": "npm test && npm run lint"
      }
    ],
    "postToolUse": [
      {
        "matcher": "Edit",
        "command": "echo 'File edited at $(date)' >> .claude/edit-log.txt"
      }
    ]
  }
}
```

### Полезни случаи

- "Преди всеки `git push` → пусни линтера"
- "Когато чета `.env` → блокирай"
- "След промяна на migration файл → автоматично пусни `sequelize:migrate`"
- "Преди commit → форматирай файла"

### Управление

- `/hooks` — преглед на конфигурацията
- `/update-config` — редактиране на settings.json (където живеят hooks)

---

## 🔌 MCP сървъри — интеграции

MCP (Model Context Protocol) = **външни интеграции**. Дават ми достъп до услуги извън файловата система.

### Конфигурирани в твоя setup

| Сървър | Какво прави |
|---|---|
| **Google Calendar** | Чете/създава събития |
| **Gmail** | Чете/праща имейли |
| **Canva** | Дизайнерски операции |
| **Stripe** | Плащания и payment data |

⚠️ **Не са auto-active** — трябва да минат през authentication flow. Когато ги поискаш първия път → ще те прекарам през login.

### Управление

- `/mcp` — преглед + OAuth authentication
- Конфигурация в `.mcp.json` (за плъгини) или global settings

### Примери

```
"Създай календарен event за 15 април в 14:00"
   → MCP Calendar action

"Прочети последния email от boss@company.com"
   → MCP Gmail action

"Покажи последните 5 транзакции в Stripe"
   → MCP Stripe action
```

---

## 🧩 Plugins — разширения

Plugins разширяват Claude Code с custom функции — skills, agents, hooks, MCP сървъри. Могат да се споделят между проекти и екипи.

### Структура на plugin

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Манифест (име, версия)
├── skills/
│   └── skill-name/
│       └── SKILL.md       # Slash командата
├── agents/
│   └── agent-name/
│       └── agent.md       # Custom subagent
├── hooks/
│   └── hooks.json         # Event hooks
└── .mcp.json              # MCP сървъри (опционално)
```

### Команди

- `/plugin` — управление
- `/reload-plugins` — reload без рестарт
- `--plugin-dir ./path` — тестване на локален plugin

### Инсталация

```bash
claude plugin install <plugin-name>
```

---

## 📝 Vim режим

Активира се в `/config` → Editor mode.

### Превключване на режим

| Команда | Действие |
|---|---|
| `Esc` | NORMAL режим (от INSERT) |
| `i`, `I`, `a`, `A`, `o`, `O` | INSERT режими (от NORMAL) |

### Навигация (NORMAL)

| Команда | Действие |
|---|---|
| `h`/`j`/`k`/`l` | ляво/долу/горе/дясно |
| `w`, `e`, `b` | приход/край/предишна дума |
| `0`, `$`, `^` | начало/край/първи символ на ред |
| `gg`, `G` | начало/край на текста |
| `f{char}`, `F{char}` | скок към следващ/предишен символ |

### Редактиране (NORMAL)

| Команда | Действие |
|---|---|
| `x` | изтрий символ |
| `dd`, `D` | изтрий ред / до края |
| `cc`, `C` | промени ред / до края |
| `yy`, `Y` | копирай ред |
| `p`, `P` | paste след/преди курсор |
| `.` | повтори последната промяна |

---

## 💡 Практически tips

### За да ме ползваш максимално

1. **Започвай sessions с `@CLAUDE.md`** — за да съм 100% в курса с правилата
2. **`@file` при дебъг** — вместо да обясняваш, дай ми пътя
3. **`/plan` за рискови задачи** — преди голяма промяна влизай в plan mode първо
4. **`/clear` в края на голяма задача** — освобождава контекста
5. **`/compact` ако разговорът става дълъг** — но искаш да продължиш със същата тема
6. **`/model` за тежки задачи** — Opus за планиране/refactoring, Haiku/Sonnet за обикновени неща
7. **`/cost` редовно** — следи разхода
8. **`!command`** ако искаш бързо да изпълниш нещо в shell, без да минава през мен
9. **`/permissions`** — задай auto-permissions за безопасни команди (като `git status`)
10. **`/powerup`** — built-in tutorials, ще те научат features интерактивно

### За продуктивност

- **Custom hooks** за повтарящи се операции (`pre:git push → npm test`)
- **`/batch` за големи refactors** — паралелизира до 30 worktree агента
- **`/loop 5m`** за фоново мониториране (deploy status, test runs)
- **`/schedule`** за нощни/седмични cron задачи

### За memory

- **Кажи "запомни"** — създавам feedback memory файл
- **# prefix** за бързи бележки
- **Преглед**: `/memory`
- **CLAUDE.md** в проекта — за правила, които искаш да commit-наш и да важат за всички разработчици

### Best workflow за нова задача

```
1. Влез в plan mode (Shift+Tab или /plan)
2. Опиши задачата
3. Аз правя план
4. Ти одобряваш
5. Излизаш от plan mode
6. Аз изпълнявам с auto-accept или default mode
7. Тестваш
8. Commit (по правилата от memory — питам първо)
```

---

## 🆘 Когато нещо не работи

| Проблем | Решение |
|---|---|
| Permission denied | `/permissions` → провери allow/deny rules; или `/update-config` |
| Дълъг бавен разговор | `/compact` или `/clear` |
| Не помня нещо от преди | Прегледай `/memory`; може би трябва да добавиш rule |
| Скъп model изяжда tokens | `/model` → превключи на Haiku |
| Объркан tool usage | `/debug` → активира verbose logging |
| Lost work | `Esc + Esc` → rewind |
| Не виждам какво правя | `Ctrl+O` → transcript view |

---

## 📚 Полезни линкове

- 📖 https://code.claude.com/docs — пълна официална документация
- 🐛 `/feedback` или `/bug` — bug report
- 💬 `/contact-support` — поддръжка

---

## 🎓 План за учене (постепенно)

### Седмица 1 — Основи
- [ ] `/help` — разгледай всички команди
- [ ] `/powerup` — мини всички interactive lessons
- [ ] `/memory` — разгледай съществуващите memory файлове
- [ ] Опитай `@file` mentions в реална задача

### Седмица 2 — Productivity
- [ ] `/plan` mode за рискова задача
- [ ] `/permissions` — задай auto-permissions
- [ ] `Shift+Tab` — научи 4-те permission modes
- [ ] `!command` и `# bookmark` префиксите

### Седмица 3 — Power user
- [ ] Subagents — *"пусни Explore агент за..."*
- [ ] `/batch` за голям refactor
- [ ] `/loop` за фоново мониториране
- [ ] Hooks — създай първия си hook

### Седмица 4 — Custom setup
- [ ] CLAUDE.md — добави project-specific rules
- [ ] Auto-memory feedback rules — запази предпочитания
- [ ] `/keybindings` — кастомизирай shortcuts
- [ ] MCP integrations — свържи Calendar/Gmail

---

> **Бележка:** Командите варират според версията на Claude Code и плана ти.
> Винаги най-надеждният начин е `/help` в самия Claude Code.
> Този документ е актуален към април 2026.
