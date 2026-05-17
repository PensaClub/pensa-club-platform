# Pensa.club — Digital Literacy & Wellbeing Platform for Citizens 60+

Pensa.club is a large, production web platform that helps senior citizens build
digital skills, keep learning, stay connected with their community, and take
part in civic life. It is built and maintained for the Bulgarian non-profit
**Pensa Foundation** and has been in continuous development for roughly two
years.

The platform is **fully trilingual** (Bulgarian / English / German) and is
designed end-to-end around an audience that mainstream software usually leaves
behind: large typography, an adjustable on-screen text-zoom control, a
high-contrast light/dark theme, and carefully simplified user flows.

**Live:** https://pensa.club

---

## Table of Contents

1. [What the Platform Does](#1-what-the-platform-does)
2. [Project Scale](#2-project-scale)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Database Layer](#7-database-layer)
8. [Feature Systems](#8-feature-systems)
   - [8.1 DigiBridge Academy](#81-digibridge-academy)
   - [8.2 Community Forum](#82-community-forum)
   - [8.3 ReAction Program](#83-reaction-program)
   - [8.4 Content Publishing](#84-content-publishing)
   - [8.5 Newsletter & Subscriptions](#85-newsletter--subscriptions)
   - [8.6 Bot Crawler — AI News Monitor](#86-bot-crawler--ai-news-monitor)
   - [8.7 Fact-Check](#87-fact-check)
   - [8.8 Clubs, Map, Classifieds & Games](#88-clubs-map-classifieds--games)
   - [8.9 Notifications](#89-notifications)
9. [AI Integration](#9-ai-integration)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [SEO System](#11-seo-system)
12. [Storage & File Management](#12-storage--file-management)
13. [Background Jobs](#13-background-jobs)
14. [Infrastructure & Deployment](#14-infrastructure--deployment)
15. [Security](#15-security)
16. [Performance](#16-performance)
17. [Internationalization](#17-internationalization)
18. [Engineering Conventions & Practices](#18-engineering-conventions--practices)
19. [About](#19-about)

---

## 1. What the Platform Does

Pensa.club is not a single app — it is several products integrated into one
codebase:

- **DigiBridge Academy** — a full Learning Management System with courses,
  lectures, live seminars, mentors, a credit system, tests, and certificates.
- **Community Forum** — a real-time, gamified discussion platform with spaces,
  posts, polls, reputation, badges, and moderation.
- **ReAction Program** — a civic-education outreach program coordinating mentor
  visits to pensioner clubs around the country.
- **Content Publishing** — articles, initiatives, projects, publications, and
  stories produced by the foundation, each with drafts, comments, and bookmarks.
- **Newsletter & Notification System** — weekly/monthly/event digests,
  admin-authored newsletters with scheduling and open/click tracking, plus
  browser-push, in-app, email, and SMS channels.
- **Bot Crawler** — an AI-assisted news-monitoring system for the editorial team.
- **Fact-Check** — a public misinformation-debunking module with citizen-submitted
  signals.
- **Clubs directory, interactive map, classifieds, and senior-friendly games.**

---

## 2. Project Scale

Concrete, verified figures for the codebase:

| Area | Scale |
|------|-------|
| React components | ~809 `.jsx` files |
| Top-level frontend feature modules | 86 directories |
| Component stylesheets | ~697 scoped CSS files |
| React context providers / API service factories | 25 / 25 |
| Application routes (frontend) | ~125, ~80 lazy-loaded |
| REST controllers | 50 |
| REST route definitions | ~876 across the 50 controllers |
| Sequelize database models | 118 |
| Database migrations | ~242 (May 2024 → May 2026) |
| Database seeders | 34 |
| Zod validation schema files | ~33 |
| Scheduled background jobs | 13 (12 wired at boot) |
| SEO meta generators | ~25 (one per content type) |
| Sitemap files | 1 index + 10 sub-sitemaps |
| Internationalization | 28 namespaces × 3 languages (84 translation files) |

---

## 3. Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18.3, Vite 6.3, React Router 6, react-i18next, Leaflet / React-Leaflet (+ marker clustering), Recharts, TipTap / Draft.js / Slate (rich-text editors), Framer Motion, Socket.IO client, Firebase JS SDK, jsPDF, qrcode.react |
| **Backend** | Node.js, Express 4.19, Sequelize 6.37, Socket.IO 4.8, node-cron, Zod, bcrypt, jsonwebtoken |
| **Database** | PostgreSQL 16 |
| **Authentication** | JWT (access + rotating refresh tokens), bcrypt, Firebase Admin, Google OAuth |
| **AI** | Anthropic Claude API (`@anthropic-ai/sdk`) — Haiku 4.5 / Sonnet 4.6 / Opus 4.7 |
| **Storage** | Firebase Storage / Google Cloud Storage (`@google-cloud/storage`), Google Drive API (`googleapis`) |
| **Messaging** | Zoho Mail REST API (email), Twilio (SMS), web-push (browser push) |
| **Media** | YouTube Data API (live streaming & video hosting), Firebase Resize Images extension |
| **Infrastructure** | Docker, Docker Compose, Nginx Proxy Manager, Let's Encrypt, GitHub Actions, Ubuntu VPS |
| **Other** | cheerio (HTML scraping), geoip-lite, pdfkit, archiver, multer, node-cache |

The project is written in **JavaScript (JSX)** throughout — no TypeScript. The
`client/` and `server/` directories are independent npm packages, each with its
own dependency tree.

---

## 4. System Architecture

```
                          ┌───────────────────────────┐
   Human visitor  ───────▶│   Nginx Proxy Manager     │
   Search/social bot ────▶│   (TLS, routing, headers) │
                          └─────────────┬─────────────┘
                       /  (humans)      │      /  (bots), /api, /socket.io, /sitemap
                          ▼             │             ▼
              ┌───────────────────┐     │   ┌───────────────────────┐
              │  client container │     │   │   server container    │
              │  React SPA (Vite) │     │   │   Express + Socket.IO  │
              └───────────────────┘     │   └───────────┬───────────┘
                                        │               │
                                        │   ┌───────────▼───────────┐
                                        │   │   db container        │
                                        │   │   PostgreSQL 16        │
                                        │   └───────────────────────┘
```

The platform is a **client-rendered Single-Page Application** backed by a REST
API. Because there is no server-side rendering for users, search-engine and
social crawlers are handled separately: the reverse proxy and a `botDetector`
middleware route bots to a server-side meta-rendering layer (see
[SEO System](#11-seo-system)).

The three application containers — `client`, `server`, `db` — run on a single
VPS, orchestrated by Docker Compose, behind Nginx Proxy Manager. The database
container is deliberately kept off the public-facing network.

---

## 5. Frontend Architecture

### Build & Tooling

The client is a **Vite 6** SPA. The dev server runs on port 3000 with polling
file-watch (a Docker/Windows workaround). Production builds output to `dist/`
with `sourcemap: 'hidden'` — maps are generated but not linked from the bundle,
so DevTools/Lighthouse can resolve them while regular visitors do not.
`client/index.html` carries a large hand-authored SEO head: seven JSON-LD
structured-data blocks (`Organization`, `WebSite`, `EducationalOrganization`,
`Course`, etc.), full Open Graph / Twitter Card meta, hreflang alternates, a
hero-image preload, third-party `preconnect` hints, and Google Analytics + Ads
tags.

### Routing & Language

`client/src/App.jsx` is the routing core. Language is encoded in the URL prefix
— `/` is Bulgarian (default), `/en/...` English, `/de/...` German. The top-level
router has exactly three routes, each wrapping a shared `<AppRoutes>` (~125
routes) in a `LanguageWrapper` that calls `i18n.changeLanguage()`. Routes are
**never duplicated per language**; `stripLangFromPath` keeps all layout logic
language-agnostic.

About **80 route components are lazy-loaded** through a custom `lazyWithRetry`
wrapper. When a code-split chunk fails to load after a deploy (stale hashed
filenames), `lazyWithRetry` forces a single page reload — guarded by a
10-second `sessionStorage` timestamp so it can never loop.

### State & Data Flow

The app enforces a strict three-layer data flow:

```
API service factory  →  Context provider  →  Component
```

There are **25 context providers**, nested ~23 levels deep in `App.jsx`, and
**25 API service factories**. Components never call a service factory directly —
they consume data and actions through a provider's `useXContext()` hook (each
hook throws if used outside its provider). All HTTP goes through a single
`requester` wrapper that injects the JWT, refreshes the access token before
every call when it is near expiry, sends the httpOnly refresh cookie, and
centrally handles `401` (redirect to sign-up) and `429` (returned as a
non-throwing envelope so rate limits are handled inline).

### Styling & Accessibility

Styling is **plain, component-scoped CSS** — roughly one stylesheet per
component, each with a unique short class prefix derived from the component name.
Global design tokens (~40 CSS custom properties for colors, spacing, font
sizes, radii, shadows) live in `App.css`. The font is self-hosted **Montserrat**
(variable font, `font-display: swap`). Light/dark theming is driven by a
`data-theme` attribute on `<html>`. For the 60+ audience there is a dedicated
**TextZoom** accessibility control (adjustable text size).

### Service Worker

A minimal service worker (`sw.js`) handles **Web Push notifications only** —
there is no offline caching and no web-app manifest, so the app is intentionally
not a full PWA.

---

## 6. Backend Architecture

### Bootstrap

The server is an **Express 4** monolith. `server/src/index.js` assembles the app
in a deliberate order: static OG images → `goneUrls` (HTTP 410 for permanently
removed URLs) → `botDetector` → `expressConfig` → the main router.
`expressConfig.js` creates the HTTP server, attaches Socket.IO, sets
`trust proxy`, configures a hardcoded CORS allowlist, and on boot tests the DB
connection, **auto-applies pending migrations**, preloads the email-template
cache, and starts the cron jobs.

### API Surface

A single `router.js` mounts **50 controllers**, each an Express `Router`,
totaling roughly **876 route definitions**. Controllers follow a uniform shape:
`isAuth → rbac.checkPermission(resource, action) → async handler`, with
`try/catch → next(err)` everywhere and a single central error handler that maps
`CustomError`, Zod errors, and Sequelize/PostgreSQL constraint errors to clean
HTTP responses. The public API has no `/api` prefix in code — the reverse proxy
rewrites `/api/x` → `/x`.

### Middleware

Application-level middleware runs in this order: `goneUrls` → `botDetector` →
body parsing → `dataTrimmer` (recursively trims every string in the request) →
CORS → cookie parsing → `ipBlocker` → `ipLogger`. Route-level guards add
`isAuth` (JWT verification, with live-DB re-verification for admin tokens),
`rbac` (config-driven permissions), `validateRequest` (Zod), and caching layers.
A recurring design principle is **fail-safe / fail-open**: `ipBlocker`,
`ipLogger`, `rateLimiter`, `botDetector`, the audit logger, and the notification
queue all swallow their own errors so infrastructure failures never break a user
request or a batch job.

### Runtime Configuration

A large amount of behavior is **editable at runtime without a redeploy**:
`site_settings`, `cron_settings`, per-bot crawler rows, SMS templates, and email
templates are all stored in the database, read live with short in-memory caches,
and editable from the admin panel. The crawler scheduler even re-syncs its cron
tasks every 5 minutes so schedule changes apply immediately.

---

## 7. Database Layer

PostgreSQL via **Sequelize 6**, with **118 models** and **~242 migrations**
spanning two years of development. A custom recursive model loader handles the
namespaced `club/` model folder. The schema is organized into ~15 functional
domains:

| Domain | Models (selection) |
|--------|--------------------|
| **Users & Auth** | `user_account`, `user_details`, `refreshToken`, `user_ads`, `admin_user_action` (immutable audit log), `useful_link` |
| **Content / CMS** | `article`, `mainImage`, `section`, `image`, `initiative`, `project`, `story`, `publication`, `comment`, `milestone`, `partner`, `sponsor`, `showcase_slide` |
| **Academy — Courses** | `course`, `course_module`, `lesson`, `lecture`, `presentation`, `lesson_test`, `lecture_test`, `test_question`, `test_answer` |
| **Academy — Students & Mentors** | `student`, `mentor`, `mentor_application`, `mentor_course`, `mentor_meeting`, `student_course`, `student_lesson`, `student_lecture`, `student_seminar`, `student_test_attempt` |
| **Academy — Seminars** | `seminar`, `seminar_session`, `seminar_facilitator`, `external_lecturer`, `seminar_material`, `seminar_video`, `seminar_review`, `seminar_guest_attendance`, `seminar_monthly_report` |
| **Academy — Credits** | `user_credits`, `user_credits_history`, `certificate` |
| **Forum** | 15 `forum_*` tables — spaces, posts, comments, reactions, polls, tags, bookmarks, reports, badges, user status, punishment logs |
| **Clubs** | `club_Club`, `club_ClubDetails`, `club_ClubLocation`, `club_ClubMember`, `club_ClubMembership`, `club_ClubActivity` |
| **ReAction / FactCheck** | `club_visit_request`, `mentor_availability`, `visit_feedback`, `visit_testimonial`, `reaction_gallery_item`, `fact_check_module`, `fact_check_signal` |
| **Bot Crawler** | `crawler_bot`, `crawler_source`, `crawler_run`, `crawler_finding` |
| **Newsletter** | `subscriber`, `subscriber_preference`, `newsletter`, `newsletter_log`, `notification_queue` |
| **Notifications** | `admin_notification`, `user_notification`, `push_subscription` |
| **Storage** | `shared_link`, `shared_link_download`, `file_share`, `drive_folder_password` |
| **Security & Logging** | `blocked_ip`, `whitelisted_ip`, `ip_visit`, `bot_log`, `client_error_log` |
| **Settings & Analytics** | `site_setting`, `cron_setting`, `email_template`, `content_view` |

Notable schema design decisions:

- **Polymorphic ("morphable") associations** — `image`, `section`, `comment`,
  `contact`, `sponsor`, `partner`, and `downloadMaterial` attach to many parent
  types via a `*_id` + `*_link_connection` discriminator.
- **No soft-delete** — there is no Sequelize `paranoid` deletion; visibility is
  controlled with `status` / `isDraft` / `isPublished` flags, and deletes are
  hard deletes inside transactions.
- **Immutable / append-only tables** — audit and log tables (`admin_user_action`,
  `crawler_run`, `mentor_activity_snapshot`, `forum_punishment_log`,
  `session_attendance`, the IP tables, `content_view`) disable `updatedAt`.
- **JSONB** is used extensively for flexible content (milestones, KPIs, club
  details, poll options, crawler criteria).
- Migrations are run **locally first** (`npx sequelize-cli db:migrate`) and then
  auto-applied on the VPS during deploy — never run manually on the server.

---

## 8. Feature Systems

### 8.1 DigiBridge Academy

A near-self-contained Learning Management System under the `/academy/*` URL
prefix. When the path starts with `/academy`, the app swaps in a dedicated
`DigiBridgeHeader` and two context providers.

**Courses** — a `course → course_module → lesson` hierarchy. Courses carry
difficulty level, duration, credit settings, and a certificate flag. The admin
`CourseContentManager` is a module/lesson tree editor with reordering and a test
editor. The `AcademyLessonPlayer` plays video and live-stream lessons with a
countdown, tracks watched seconds, and reports progress periodically. The
`coursesController` (~1,680 lines) exposes ~30 routes covering catalog, CRUD,
publish/unpublish, modules, lessons, lesson lifecycle (publish/start/stop), and
mentor assignment.

**Lectures** — standalone live/recorded/hybrid events with registration,
attendance marking, and a full lifecycle (`publish / unpublish / cancel /
complete / start / stop`).

**Seminars** — the largest single feature area; `seminarsController` is ~5,600
lines with ~70 routes. It covers a public catalog and detail page, registration
with optional admin approval, multi-day sessions, materials and videos, uploaded
physical attendance lists, QR-code check-in, guest attendance, a guest-to-user
invitation flow, monthly PDF reports, a seminar library, and reviews. A
**multi-facilitator system** links each seminar to any mix of platform mentors,
admins, and external lecturers through a junction table with a database CHECK
constraint ensuring exactly one facilitator type per row.

**Live streaming** is delivered via the **YouTube Data API**: OAuth tokens are
stored in a Docker volume and auto-refreshed; admins connect a YouTube account,
upload videos directly, and the lecture/seminar `start`/`stop` lifecycle flips
the entity to `live` with the stream URL embedded on the detail page.

**Mentors** — a become-a-mentor application flow, mentor directory, mentor
dashboards with chat, student-to-mentor pairing applications, and a detailed
mentor-statistics suite that reconciles Firebase chat activity with PostgreSQL
data via daily snapshots.

**Credits & evaluation** — students earn credits per entity (course, lecture,
seminar, test). Seminar credits combine attendance credits with a participation
multiplier (`active` = full, `moderate` = half, `passive` = none). Privileged
users (admin / moderator / mentor) get unrestricted access but earn zero
credits. A platform-wide `user_credits` rollup tracks a level
(`beginner → intermediate → advanced → master`).

**Tests** — a single unified test engine serves lessons, lectures, courses, and
seminars. Tests support attempt limits, time limits, question/answer shuffling,
and configurable passing scores; scoring handles single- and multiple-choice
questions, and a passing attempt awards credits and (for courses) can issue a
**verifiable PDF certificate** with a unique validation code.

### 8.2 Community Forum

A real-time, gamified discussion platform at `/academy/community`, backed by ~21
`forum_*` tables.

- **Spaces** — topical sub-communities with membership and per-space moderators.
- **Posts & comments** — four post types (discussion, article, poll, question),
  a TipTap rich-text editor, threaded comments with `@mentions` and comment
  quoting, and an image lightbox.
- **Reactions & polls** — emoji reactions with toggle semantics; single- or
  multiple-choice polls with expiry.
- **Gamification** — 10 badges with configurable thresholds, a credit system
  (reused from the Academy), a reputation score computed from posts, comments,
  reactions received, bookmarks, and "Post of the Week", and a leaderboard with
  weekly/monthly/all-time periods.
- **Moderation** — content reports with an auto-hide threshold, a full
  punishment system (warning / mute / restrict / temp-ban / perm-ban) with
  automatic escalation (3 warnings in 30 days → auto-mute), a 9-tab admin
  dashboard, and PDF exports.
- **Real-time** — Socket.IO powers live new-post/new-comment broadcasts, typing
  indicators, and a throttled online-user count.

Post publication is permission-aware: staff and VIP users publish instantly,
everyone else may be routed through a `pending` moderation queue depending on
settings. A weekly digest email summarizes top posts every Monday.

### 8.3 ReAction Program

A civic-education program coordinating free mentor visits to senior clubs (topics
include fake news, voter rights, and the election process).

- **Public** — a landing page, an online booking form, and a public
  request-tracking page (track and cancel by code).
- **Members** — a personal "my requests" view.
- **Admin panel** — a 5-tab interface (calendar, requests, statistics,
  testimonials, gallery) with mentor assignment, CSV export, and a custom-email
  modal.
- **Mentor panel** — a 4-tab interface (availability calendar, assignments,
  history, feedback).

A request moves through `new → reviewing → mentor_assigned → confirmed →
completed` (cancellable at any active stage), with a chain of conditional emails
and notifications at each transition. The public booking form is protected by
**multiple anti-spam layers**: a honeypot field, a minimum form-fill-time check,
per-IP rate limiting, and duplicate detection by user / email / phone. A daily
cron sends visit reminders two days ahead.

### 8.4 Content Publishing

Five long-form content types. **Articles** form a navigable chain via
`related / next / previous` pointers and carry a `usefulLinks` array — when a
link is added, the server fetches the target's Open Graph metadata (SSRF-hardened)
and **mirrors the preview image to the project's own Firebase bucket** so
previews never hot-link. **Initiatives, Projects, Publications, and Stories**
share an identical polymorphic data model (a parent row plus
discriminator-keyed `section` / `image` / `contact` / `sponsor` / `partner` /
`downloadMaterial` children and several many-to-many join tables) and an
identical delete-cascade transaction. Stories and publications add likes and
view counters; publications add a download counter. All five support drafts,
bookmarks, and a shared polymorphic comment system. An **ArticleLimit** system
caps how many articles an anonymous visitor can read before a friendly,
Lottie-animated assistant invites them to register.

### 8.5 Newsletter & Subscriptions

The largest backend subsystem — three controllers, a six-tab `AdminNewsletters`
UI, four cron jobs, and a reactive notification queue.

- Subscribers choose per-category preferences (seminars, courses, articles,
  initiatives, clubs, games, platform updates).
- Admins compose newsletters with a rich editor and a cross-content picker,
  preview them, schedule them, send tests, and track **opens** (1×1 tracking
  pixel) and **clicks** (redirect with an open-redirect-safe host whitelist).
- A **reactive queue** captures every content publish; daily/weekly/monthly cron
  jobs turn the queue into per-subscriber digests filtered by each subscriber's
  preferences.
- Subscriber lists export to **CSV** (Excel-friendly) and **branded PDF**.
- A separate **showcase slider** drives the homepage hero — manually curated, or
  auto-generated from the latest content of each type.

Email is delivered through the **Zoho Mail REST API** with branded,
admin-editable HTML templates.

### 8.6 Bot Crawler — AI News Monitor

An admin-only news-monitoring system. An editor defines a "bot" representing a
theme, attaches news sources, and the crawler engine periodically scans them.

- **Sources** are validated on add — SSRF protection, RSS auto-discovery,
  `robots.txt` parsing (the crawler honors `robots.txt` and identifies itself as
  `PensaClubNewsBot`), and a sample extraction preview.
- **Crawl runs** fetch each source (with conditional `ETag` / `If-Modified-Since`
  caching, a 10-second timeout, and a 5 MB body cap), parse **RSS** (a
  dependency-free RSS 2.0 / Atom parser) or **HTML** (cheerio-based, with
  admin-configured CSS selectors or a heuristic auto-extractor), canonicalize
  and SHA-256-hash each URL for deduplication, match against keyword criteria,
  and persist **findings**.
- Findings appear in the admin UI as cards; an editor can dismiss them or
  **start a new article directly from a finding** (the article form is
  pre-filled with the title, image, and a link back to the source — explicitly a
  verify-and-write workflow, never a copy).
- A dynamic scheduler runs one cron task per active bot and re-syncs every 5
  minutes so admin edits take effect without a restart.

### 8.7 Fact-Check

A public misinformation-debunking module. **Modules** are published verdicts
(`true / false / misleading / partially_true / unconfirmed`) with the claim,
the verification, sources, and an optional PDF. **Signals** are tips submitted by
the public — protected by the same multi-layer anti-spam approach as the
booking forms. A unified public feed merges modules and non-confidential
signals. Fact-check detail pages emit Schema.org `ClaimReview` JSON-LD.

### 8.8 Clubs, Map, Classifieds & Games

- **Clubs** — a directory of senior clubs, each decomposed into base / details /
  location / membership / members / activities models, with drafts, admin
  approval, ownership transfer, and eight contact/registration mailing forms
  that proxy email to the club.
- **Interactive map** — registered seniors are plotted on an OpenStreetMap /
  Leaflet map with marker clustering, filterable by skills, work options, and
  interests.
- **Classifieds** — a community ads section with ten categories, admin
  moderation (pending / approved / denied), rich search, and 30-day expiry.
- **Games** — a curated catalog of senior-friendly external games.

### 8.9 Notifications

Four independent channels: **browser push** (web-push + VAPID, with auto-cleanup
of expired subscriptions), **in-app notifications** (a notification bell with
unread counts), **admin notifications** (a separate admin bell), and **email**
(Zoho) / **SMS** (Twilio). The `notification_queue` table is the reactive
backbone connecting content publication to the newsletter digests.

---

## 9. AI Integration

The most carefully engineered AI component is the **LLM relevance scorer** for
the Bot Crawler (`server/src/services/llmScorer.js`), which wraps the
**Anthropic Claude API** to score each crawler finding's editorial relevance
from 0 to 100 with written reasoning.

The integration is built for safe, cost-controlled production use:

- **Model catalog** — Claude **Haiku 4.5** (default — fast and cheap),
  **Sonnet 4.6** (balanced), and **Opus 4.7** (most capable), each with its own
  per-token pricing used for internal cost accounting.
- **Prompt caching** — the per-bot system prompt is sent as an `ephemeral`
  cache-control content block, so repeated scoring within Anthropic's cache
  window costs a fraction of the regular input price.
- **Per-bot daily cost cap** — a hard guard refuses scoring once the day's spend
  reaches the bot's configured cap; token and cost counters reset on the
  Europe/Sofia calendar day.
- **Graceful degradation** — the SDK is lazily required so a missing dependency
  never blocks server boot; `scoreFinding` always returns an object (never
  throws), so a scoring failure still saves the finding, just without a score.
- **Defensive parsing** — a three-tier parser (strict JSON → first JSON block →
  regex fallback) extracts and clamps the score; transient API errors get one
  back-off retry.

Admins configure the model, temperature, token limit, minimum score,
auto-dismiss threshold, daily cost cap, and a custom system prompt — and can
run a live test scoring against a real or synthetic finding before enabling it.

---

## 10. Authentication & Authorization

**Authentication** uses two JWTs: a short-lived **access token** (15 minutes,
sent in the response body) and a **refresh token** (7 days, delivered as an
`httpOnly + secure + sameSite=strict` cookie). The refresh token carries a UUID
that is also persisted server-side, enabling **refresh-token rotation** — every
refresh issues a new pair and destroys the old token. Passwords are bcrypt-hashed;
Google sign-in verifies the Google ID token server-side. Admin-initiated password
resets additionally require an SMS code (with a 5-attempt limit). The JWT
identity field is `userId`.

**Authorization** is config-driven RBAC. Seven roles — `admin`, `moderator`,
`user`, `student`, `mentor`, `limited`, `guest` — are evaluated against a
per-resource permission matrix supporting nested sub-actions (e.g.
`initiative.draft.read`). A user flagged `isMentor` gains mentor permissions
even if their stored role is `user`. Admin access tokens are **re-verified
against the live database** on every request, so a demoted admin's still-valid
token is rejected immediately.

---

## 11. SEO System

Because the frontend is a client-rendered SPA, the platform implements a
**dual-rendering strategy**:

- **Human visitors** receive the React SPA.
- **Crawlers** are detected by a `botDetector` middleware (it matches
  Googlebot, Bingbot, Yandex, Baidu, Facebook, Twitter, LinkedIn, Slack,
  WhatsApp, Telegram, and others). The middleware strips the language prefix,
  matches the path against ~30 URL patterns, loads the relevant database record,
  and returns a fully server-rendered meta-HTML page produced by one of ~25
  per-content-type **meta generators** — with Open Graph, Twitter Card,
  canonical, hreflang, and (for richer types) Schema.org JSON-LD. Every crawler
  hit is logged and enriched with GeoIP data.

A trilingual **sitemap system** serves a sitemap index plus 10 sub-sitemaps;
every URL is emitted once per language with full `hreflang` alternates. Removed
URLs return **HTTP 410 Gone** (not 404) so search engines drop them faster. The
client-side `SEOHead` component additionally manages per-page meta for the SPA.

---

## 12. Storage & File Management

The platform uses three Google storage backends, all keyed to the same Firebase
project:

- **Firebase Storage / Google Cloud Storage** — the same bucket, accessed by the
  client via the Firebase SDK and by the server via the `@google-cloud/storage`
  SDK. The **Firebase Resize Images extension** generates WebP variants at
  200 / 600 / 1200 px; a `firebaseImageResize` helper rewrites image URLs to the
  right variant with a graceful fallback chain.
- **In-platform Cloud Storage file manager** — an admin file manager
  (list / upload / folder / rename / move / delete, on-the-fly ZIP download,
  500 MB upload cap) with protected root folders that cannot be removed
  wholesale, and an hourly storage-to-database sync cron.
- **Google Drive integration** — using a service account with domain-wide
  delegation to impersonate the foundation's Drive account, with a
  password-protected-folder feature backed by bcrypt hashes.

A **shared-links** system lets admins generate public download links with
optional passwords, expiry, and download caps; every download is audited.

---

## 13. Background Jobs

Thirteen `node-cron` jobs (12 wired at boot), all on the `Europe/Sofia`
timezone:

| Job | Schedule | Purpose |
|-----|----------|---------|
| Article cleanup | Sunday 00:00 | Removes expired articles |
| Mentor activity snapshots | Daily 00:05 | Reconciles Firebase + DB mentor stats |
| Visit reminders | Daily 09:00 | ReAction visit reminders, 2 days ahead |
| Seminar reminders | Hourly | SMS reminders ~24h / ~1h before a seminar |
| Forum digest | Monday 10:00 | Weekly top-posts email |
| Storage sync | Hourly | Cloud Storage → database reconciliation |
| Audit-log cleanup | Daily 03:00 | Purges audit records older than 1 year |
| Weekly digest | Monday 10:00 | Newsletter weekly digest |
| Scheduled newsletters | Every 15 min | Dispatches scheduled newsletters |
| Event batch | Daily 09:00 | "What's new" batched email |
| Monthly report | 1st of month 09:00 | Monthly platform report |
| Crawler scheduler | Per-bot, dynamic | One task per active crawler bot, re-synced every 5 min |

The newsletter-related jobs read their schedule and enabled state from the
database, so admins can retune them at runtime.

---

## 14. Infrastructure & Deployment

The platform runs on a self-managed **Ubuntu 20.04 LTS VPS**, fully
containerized.

### Containers

| Container | Role |
|-----------|------|
| `client` | React build, served as static files |
| `server` | Express API + Socket.IO |
| `db` | PostgreSQL 16 |
| `nginx-proxy-manager` | Reverse proxy, TLS termination, routing |

The `client` image is a multi-stage Node 18 build (Vite build with raised
memory limit, then served via `serve`); the `server` image runs on Node 20.
Two Docker networks separate concerns — an internal application network and a
proxy network — and **the database container is attached only to the internal
network**, so it is unreachable from the public edge.

### Reverse Proxy

Nginx Proxy Manager routes all traffic:

- `/api/*` → backend (the `/api` prefix is stripped)
- `/` → React client for humans, backend for bot User-Agents
- `/socket.io/` → backend, with WebSocket-upgrade headers and 24-hour timeouts
- `/sitemap*.xml` → backend, regardless of User-Agent
- HTTP → HTTPS redirect, with an animated maintenance page on `502`

TLS uses auto-renewing Let's Encrypt certificates (TLS 1.2 / 1.3 only, HTTP/2).
Security headers — HSTS (1-year), `X-Frame-Options: SAMEORIGIN`, and a
`Cross-Origin-Opener-Policy` tuned to keep Google Sign-In popups working — are
injected at the proxy layer.

### CI/CD

A GitHub Actions workflow deploys on every push to `main`: it takes a
`pg_dump` database backup, fast-forwards the VPS to the new commit, rebuilds the
client and server images with `--no-cache`, restarts the stack (under ~5 seconds
of downtime), and applies any pending database migrations automatically.

### Operational Notes

The VPS is modest (2 GB RAM / 2 CPU), so **4 GB of swap** was added because
`vite build` would otherwise run out of memory; the deploy timeout was raised
accordingly. Infrastructure changes and incidents are recorded in a living
`vps-specification.md` document.

---

## 15. Security

- **Authentication hardening** — short-lived access tokens, rotating refresh
  tokens with server-side revocation, bcrypt password hashing, live-DB
  re-verification of admin tokens, and SMS-code-gated admin password resets with
  attempt limiting.
- **Authorization** — config-driven per-resource RBAC on every protected route.
- **Application-level IP management** — a database-backed block/whitelist with
  an in-memory cache and a hardcoded system-IP whitelist; an admin UI for
  visits, blocks, and whitelist entries, with password confirmation required for
  sensitive transitions.
- **Rate limiting** — a custom per-IP limiter plus `express-rate-limit` on
  sensitive endpoints.
- **SSRF protection** — a centralized `networkSafety` helper validates every
  server-side fetch of a user-supplied URL (the news crawler, link previews),
  rejecting non-HTTP(S) protocols and any host resolving to a private,
  loopback, link-local, or carrier-grade-NAT address.
- **Edge hardening** — `fail2ban` on SSH, SQL-injection / path-traversal / XSS
  filtering at the reverse proxy, a locked-down CORS origin allowlist, and an
  isolated database container.
- **Input validation** — every write endpoint is validated with Zod schemas;
  `dataTrimmer` sanitizes all incoming strings.
- **Auditability** — an immutable, 1-year-retention admin audit log.

---

## 16. Performance

Performance is treated as a first-class, measured concern. A dedicated
optimization pass on the home page improved the **Lighthouse Performance score
from 53 to 70**, cut **Largest Contentful Paint from ~19.8 s to ~3.5 s**, and
reduced the main JavaScript bundle from **~5 MB to ~2.4 MB** uncompressed.

Techniques applied:

- **Route-level code splitting** — ~80 lazy-loaded route components.
- **Responsive WebP images** — three resized variants per upload, served through
  the `firebaseImageResize` helper.
- **Critical-path tuning** — hero-image preload with `fetchpriority="high"`,
  third-party `preconnect`, `font-display: swap`, deferred non-critical CSS, and
  a lightweight stats endpoint that replaced five full list fetches on the home
  page (≈700 KB → ≈20 KB).
- **Deferred non-critical work** — push-notification setup and other
  non-essential calls are deferred via `requestIdleCallback`.
- **Static-asset cache headers** — immutable 1-year caching for hashed assets.

The build deliberately keeps a **single JavaScript bundle** — a `manualChunks`
split was attempted and reverted after it broke React's dependency order in
production for React-consuming libraries.

---

## 17. Internationalization

The platform is fully trilingual — **Bulgarian (default), English, German**.
Translations use `react-i18next` with HTTP-loaded namespace files: **28
namespaces per language, 84 JSON files total**. Language is detected from the
URL path prefix first. Every new translation key ships in all three locales as a
hard project rule, and the i18n namespace name matches the component name.
Server-rendered crawler meta and the sitemap also fully cover all three
languages with `hreflang` alternates.

---

## 18. Engineering Conventions & Practices

A consistent set of conventions keeps a codebase of this size maintainable:

- **Strict data-flow layering** — services → context providers → components.
  Components never call a service factory directly.
- **One HTTP wrapper** — all API calls go through a single `requester` that
  centralizes token refresh and 401/429 handling.
- **Component-scoped CSS** — a unique short class prefix per component, a
  co-located lowercase-named stylesheet, global tokens only in `App.css`.
- **Component structure** — a main component file plus subcomponents in their
  own folders.
- **Internationalization is mandatory** — every new namespace/key ships in
  `bg / en / de`.
- **Responsive, accessible UI** — mobile-first CSS; the 60+ audience drives
  large typography, a text-zoom control, and high-contrast theming.
- **Fail-safe infrastructure** — IP checks, rate limiters, loggers, the audit
  log, and the notification queue all fail open so infrastructure faults never
  break user requests.
- **Runtime-configurable behavior** — settings, cron schedules, email/SMS
  templates, and crawler config live in the database and are editable from the
  admin panel without a redeploy.
- **Defensive image handling** — Firebase images are always rendered through the
  resize helper with a fallback chain ending in a placeholder.
- **Migration discipline** — migrations are run locally first, then auto-applied
  on deploy; the database is never migrated manually on the server.
- **Documented operations** — the VPS configuration, routing rules, and every
  production incident with its fix are kept in a living specification document.
- **AI-first development** — the platform is built with heavy use of modern AI
  coding tools, with every generated change reviewed and owned by the developer.

---

## 19. About

Pensa.club is built and maintained for **Pensa Foundation**, a Bulgarian
non-profit dedicated to the digital literacy and wellbeing of senior citizens.
The platform's development has been part of the foundation's civic and
educational mission, including the EU-supported "BRIDGE" project.

> _This README documents the platform's architecture and feature set. The full
> production source code is private; access for review is available on request._
