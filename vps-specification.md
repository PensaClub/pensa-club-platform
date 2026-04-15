# VPS Сървърна Спецификация
### pensa.club — Digital Literacy Wellbeing 60+
*Генерирано: Март 2026*

---

## 1. Хостинг и OS

| Параметър | Стойност |
|-----------|----------|
| Hostname | `uxla0m4m.superdnsserver.net` |
| Публично IP | `185.123.188.236` |
| OS | Ubuntu 20.04.6 LTS (Focal Fossa) |
| Kernel | `Linux 5.4.0-216-generic #236-Ubuntu` |
| Архитектура | x86_64 |
| Docker мрежи (хост) | `172.17.0.1` / `172.18.0.1` / `172.19.0.1` |

---

## 2. Web сървър — архитектура

> Системният Nginx (v1.18.0) е инсталиран, но **НЕАКТИВЕН** от октомври 2025.
> Целият web трафик се управлява от **Nginx Proxy Manager (NPM)** в Docker контейнер.

### 2.1 Nginx Proxy Manager (Docker)

| Параметър | Стойност |
|-----------|----------|
| Контейнер | `nginx-proxy-manager-app-1` |
| Image | `jc21/nginx-proxy-manager:latest` |
| Статус | Up 5 months |
| Публични портове | `0.0.0.0:80` \| `0.0.0.0:81` (admin) \| `0.0.0.0:443` |
| Мрежа | `nginx-proxy` (external bridge) |
| Config source | `/data/nginx/proxy_host/1.conf` |

### 2.2 Routing за pensa.club

| Path | Метод | Destination | Бележка |
|------|-------|-------------|---------|
| `/api/*` | proxy_pass | `server:8080` | rewrite `/api/x` → `/x` |
| `/` (user) | proxy_pass | `client:3000` | React SPA |
| `/` (bot) | proxy_pass | `server:8080` | Bot detection (UA map) |
| HTTP | 301 redirect | HTTPS | Force SSL |
| 502 error | inline HTML | Maintenance page | Анимирана страница на BG |

### 2.3 SSL / TLS

| Параметър | Стойност |
|-----------|----------|
| Сертификат | Let's Encrypt (`npm-2/fullchain.pem`) |
| TLS версии | TLSv1.2 и TLSv1.3 (само) |
| HSTS | `max-age=63072000; preload` |
| HTTP/2 | Включен (`http2 on`) |
| ssl_prefer_server_ciphers | `off` |

---

## 3. Docker контейнери

| Контейнер | Image | Статус | Портове |
|-----------|-------|--------|---------|
| `dlwb-client-1` | `dlwb-client` (custom) | ✅ Up 6h | `3000/tcp` (internal only) |
| `dlwb-server-1` | `dlwb-server` (custom) | ✅ Up 6h | `8080/tcp` (internal only) |
| `dlwb-db-1` | `postgres:16` | ✅ Up 6h | `5432/tcp` (internal only) |
| `nginx-proxy-manager-app-1` | `jc21/nginx-proxy-manager:latest` | ✅ Up 5 months | `0.0.0.0:80,81,443` |

### 3.1 Docker мрежи

| Мрежа | Gateway | Описание |
|-------|---------|---------|
| `bridge` | `172.17.0.1` | Стандартна Docker bridge |
| `dlwb_default` | `172.18.0.1` | Вътрешна мрежа на app стека |
| `nginx-proxy` | `172.19.0.1` | External bridge: NPM + client + server |
| `host` | — | Host мрежа |
| `none` | — | Null driver |

### 3.2 IP адреси на контейнерите

| Контейнер | IP адреси |
|-----------|-----------|
| `client-1` | `172.18.0.4` (dlwb_default) / `172.19.0.3` (nginx-proxy) |
| `server-1` | `172.18.0.3` (dlwb_default) / `172.19.0.2` (nginx-proxy) |
| `db-1` | `172.18.0.2` (dlwb_default **само** — изолиран!) |
| `nginx-proxy-manager` | `172.19.0.4` (nginx-proxy) |

### 3.3 Docker Compose — обобщение

| Параметър | Стойност |
|-----------|----------|
| Файл | `/root/Digital-Literacy-Wellbeing-60-plus/docker-compose.yml` |
| client build args | `VITE_API_URL`, Firebase keys x6, reCAPTCHA, GA, Google Client ID |
| server env | `env_file: ./.env` |
| db volume | `postgres_data:/var/lib/postgresql/data/` |
| external network | `nginx-proxy` (трябва да съществува предварително) |
| db isolation | db е **САМО** в default мрежа — не е достъпна от NPM ✅ |

---

## 4. IP адреси — Whitelist и конфигурация

| IP адрес | Тип | Описание |
|----------|-----|---------|
| `78.154.13.95` | 🟢 **WHITELIST** | Твоето IP — никога не се блокира (fail2ban ignoreip) |
| `127.0.0.1/8` | 🟢 **WHITELIST** | Localhost — никога не се блокира |
| `::1` | 🟢 **WHITELIST** | IPv6 localhost — никога не се блокира |
| `185.123.188.236` | 🔵 **SERVER** | Публично IP на VPS-а |
| `172.17.0.1` | 🔵 **SERVER** | Docker bridge gateway (хост) |
| `172.18.0.1` | 🔵 **SERVER** | dlwb_default мрежа gateway |
| `172.19.0.1` | 🔵 **SERVER** | nginx-proxy мрежа gateway |
| `172.19.0.4` | 🟡 **INTERNAL** | nginx-proxy-manager контейнер |
| `172.19.0.3` | 🟡 **INTERNAL** | client контейнер |
| `172.19.0.2` | 🟡 **INTERNAL** | server контейнер |
| `172.18.0.2` | 🟡 **INTERNAL** | db (postgres) контейнер |

### 4.1 Отворени портове (iptables INPUT)

| Порт | Протокол | Описание |
|------|---------|---------|
| `22` | TCP | SSH достъп |
| `80` | TCP | HTTP → NPM (redirect към HTTPS) |
| `443` | TCP | HTTPS → NPM |
| `81` | TCP | NPM Admin панел ⚠️ (публично достъпен!) |
| `25`, `465` | TCP | SMTP / SMTPS (mail) |
| `143`, `993` | TCP | IMAP / IMAPS |
| `110`, `995` | TCP | POP3 / POP3S |
| `21` | TCP | FTP |
| `53` | TCP+UDP | DNS |
| `1022`, `8022` | TCP | Алтернативни SSH портове |

---

## 5. Trust Proxy

> ✅ **КОНФИГУРИРАНО** (Март 2026)

| Параметър | Стойност |
|-----------|----------|
| Файл | `server/src/config/expressConfig.js` |
| Настройка | `app.set('trust proxy', 1)` |
| Резултат | `req.ip` връща реалното IP на клиента |
| Rate limiting | Работи правилно — всеки потребител = уникално IP |

---

## 6. IP Management система (приложно ниво)

> ✅ **Добавена Март 2026** — управление на IP адреси от админ панела

### 6.1 Middleware

| Middleware | Файл | Описание |
|-----------|------|---------|
| `ipBlocker` | `server/src/middlewares/ipBlocker.js` | Проверява IP срещу blocklist (in-memory кеш, TTL 60s). **Fail-safe**: при грешка — пропуска |
| `ipLogger` | `server/src/middlewares/ipLogger.js` | Логва уникални IP посещения на ден (in-memory буфер, flush на 30s) |

### 6.2 Бази данни таблици

| Таблица | Описание |
|---------|---------|
| `ip_visits` | Уникални IP посещения (ip_address, user_agent, visit_count, last_visited_at) |
| `blocked_ips` | Блокирани IP адреси (ip_address, reason, blocked_by FK → user_accounts) |
| `whitelisted_ips` | Whitelist с `is_system` флаг (11 seed-нати системни IP-та) |

### 6.3 Whitelisted IP адреси (DB-managed)

| IP адрес | Label | Тип |
|----------|-------|-----|
| `78.154.13.95` | Admin IP | 🔒 System |
| `127.0.0.1` | Localhost IPv4 | 🔒 System |
| `::1` | Localhost IPv6 | 🔒 System |
| `185.123.188.236` | VPS public IP | 🔒 System |
| `172.17.0.1` | Docker bridge gateway | 🔒 System |
| `172.18.0.1` | dlwb_default gateway | 🔒 System |
| `172.19.0.1` | nginx-proxy gateway | 🔒 System |
| `172.19.0.4` | NPM container | 🔒 System |
| `172.19.0.3` | Client container | 🔒 System |
| `172.19.0.2` | Server container | 🔒 System |
| `172.18.0.2` | DB container | 🔒 System |

> **Всички IP-та** (включително системни) могат да се премахват/блокират от админ панела — с потвърждение на парола.

### 6.4 Админ UI

| Таб | Достъп | Описание |
|-----|--------|---------|
| Visits | Admin | IP посещения — търсене, блокиране |
| Blocked | Admin | Блокирани IP-та — ръчно добавяне, отблокиране |
| Whitelist | Admin | Whitelist — добавяне, премахване (парола), блокиране (парола) |

### 6.5 Block/Unblock от Fact-Check сигнали

- Админ модал за сигнали показва IP + User Agent (info бутон ℹ)
- Бутони Ban / Unblock до IP-то — **само за админи** (модераторите нямат достъп)
- Изисква парола за всяко действие

---

## 7. Сигурност

### 7.1 Fail2ban

| Параметър | Стойност |
|-----------|----------|
| Статус | ✅ Активен |
| Защитена услуга | `sshd` |
| bantime | `604800` сек (7 дни) |
| findtime | `600` сек (10 мин) |
| maxretry | 2 опита |
| ignoreip | `127.0.0.1/8` `::1` `78.154.13.95` |
| Текущо банирани | 251 IP адреса |
| Общо банирани | 3230 IP адреса |
| Общо неуспешни опити | 9994 |

### 7.2 Bot Detection (Nginx map)

| Параметър | Стойност |
|-----------|----------|
| Засечени ботове | Facebook, Twitter, LinkedIn, Slack, WhatsApp, Telegram, Google, Bing |
| Bot → destination | `server:8080` (Node.js — за Open Graph / SSR meta tags) |
| User → destination | `client:3000` (React SPA) |

### 7.3 Nginx защити (block-exploits)

| Тип атака | Статус |
|-----------|--------|
| SQL Injection | ✅ Блокирано (`union select`, `concat...`) |
| File Injection | ✅ Блокирано (path traversal) |
| XSS | ✅ Блокирано (script tags в query string) |
| Spam keywords | ✅ Блокирано |
| Вредни User-Agents | ✅ Блокирано (`libwww-perl`, `GetRight`, `GrabNet` и др.) |

---

## 8. Приложен стек

| Компонент | Технология |
|-----------|-----------|
| Frontend | React (Vite build) — контейнер port `3000` |
| Backend | Node.js / Express — контейнер port `8080` |
| База данни | PostgreSQL 16 — port `5432` (само вътрешно) |
| ORM/Query builder | Sequelize |
| Auth | JWT (bcrypt) + Firebase Authentication |
| Storage | Firebase Storage |
| Analytics | Google Analytics (GA4) |
| Anti-bot | reCAPTCHA |
| i18n | `bg` / `en` / `de` |
| CI/CD | GitHub Actions → auto-deploy при push към `main` |
| Reverse Proxy | Nginx Proxy Manager (Docker) |
| SSL | Let's Encrypt (auto-renew) |
| Real-time | Socket.IO (закачен към Express HTTP server, порт 8080) |
| Push Notifications | web-push + Service Worker (`sw.js`) |
| Email | Zoho Mail API (OAuth) |
| SMS | Twilio |
| Cron Jobs | node-cron (seminar reminders, forum digest, mentor activity, article cleanup, visit reminders) |

---

## 9. Socket.IO конфигурация (добавено Март 2026)

| Параметър | Стойност |
|-----------|----------|
| Пакет | `socket.io` (server) + `socket.io-client` (client) |
| Transport | WebSocket (primary) + HTTP polling (fallback) |
| Порт | Същият `8080` — закачен към HTTP server |
| Auth | JWT token от `socket.handshake.auth.token` |
| CORS | Същите origins като Express (`pensa.club`, `localhost:3000`) |
| Файл (server) | `server/src/config/expressConfig.js` — `http.createServer(app)` + `new Server(server)` |
| Файл (handlers) | `server/src/sockets/socketHandler.js` |
| Файл (auth) | `server/src/sockets/socketAuth.js` |
| Файл (client) | `client/src/components/contexts/SocketProvider.jsx` |

### 9.1 Nginx Proxy Manager — WebSocket support

> ✅ **ФИКСИРАНО (Април 2026)** — решение подробно описано по-долу.

#### Какво е "Websockets Support" в NPM?

Nginx Proxy Manager има toggle **"Websockets Support"** в `Edit Proxy Host → Details`. Когато е включен, NPM добавя към главния `server{}` блок тези директиви:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $http_connection;
proxy_http_version 1.1;
```

Тези headers са задължителни, за да може HTTP connection-ът да бъде **upgrade-нат към WebSocket протокола** (HTTP 101 Switching Protocols). Без тях, WebSocket заявките връщат 200 OK от NPM и бланк body — клиентът се опитва да ги третира като WebSocket и fail-ва с `WebSocket connection failed`.

#### Проблемът (преди фикса)

Дори със включен "Websockets Support":
- **Всички заявки** (включително `/socket.io/*`) отиваха към `client:3000` (React SPA)
- React SPA няма Socket.IO handler → WebSocket upgrade fail-ва
- В Console се появяваше спам: `WebSocket connection to 'wss://pensa.club/socket.io/...' failed`
- Browser reconnect loop-ваше безкрайно (`reconnectionAttempts: Infinity` в `SocketProvider.jsx`)

NPM routing-ът към `/api/*` (който отива към `server:8080`) не обхващаше `/socket.io/*`, защото Socket.IO по default слуша на path `/socket.io/`, не `/api/socket.io/`.

#### Решението (Април 2026)

Добавен **custom `location /socket.io/`** блок в NPM Advanced config, който проксва директно към server контейнера:

**NPM UI → Edit Proxy Host за pensa.club → Advanced → Custom Nginx Configuration:**

(Добавя се **в долната част**, след съществуващия `location @maintenance { ... }` блок — НЕ премахвай bot detection и maintenance page!)

```nginx
location /socket.io/ {
    proxy_pass http://digital-literacy-wellbeing-60-plus-server-1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
}
```

**Обяснение на директивите:**
- `proxy_pass` — насочва към server контейнера (не към client)
- `proxy_http_version 1.1` — задължително за WebSocket (HTTP/1.0 не поддържа upgrade)
- `Upgrade $http_upgrade` + `Connection "upgrade"` — hint към upstream за WebSocket
- `Host $host` — запазва original hostname
- `X-Real-IP` + `X-Forwarded-For` — за правилно логване на client IP от страна на сървъра
- `proxy_read_timeout / proxy_send_timeout 86400s` — 24 часа timeout за дългоживеещи WebSocket връзки (default е 60s → връзката би се разпадала всяка минута)

#### Потвърждение, че работи

1. **От NPM към server (директно):**
   ```bash
   docker exec digital-literacy-wellbeing-60-plus-server-1 sh -c 'node -e "
   const http = require(\"http\");
   http.get(\"http://localhost:8080/socket.io/?EIO=4&transport=polling\", r => {
     let d = \"\"; r.on(\"data\", c => d += c);
     r.on(\"end\", () => console.log(r.statusCode, d));
   }).on(\"error\", e => console.log(\"ERR\", e.message));"'
   ```
   Очаквано: `200 0{"sid":"...","upgrades":["websocket"],...}`

2. **End-to-end WebSocket upgrade през NPM:**
   ```bash
   docker exec nginx-proxy-manager-app-1 node -e "
   const https = require('https');
   const req = https.request({
     hostname: 'localhost', port: 443,
     path: '/socket.io/?EIO=4&transport=websocket',
     method: 'GET',
     headers: {
       'Host': 'pensa.club',
       'Upgrade': 'websocket',
       'Connection': 'Upgrade',
       'Sec-WebSocket-Version': '13',
       'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
     },
     rejectUnauthorized: false,
   }, r => console.log('STATUS:', r.statusCode, r.statusMessage));
   req.on('error', e => console.log('ERR:', e.message));
   req.on('upgrade', (r, s, h) => { console.log('UPGRADE OK:', r.statusCode); s.destroy(); });
   req.end();
   "
   ```
   Очаквано: `UPGRADE OK: 101`

3. **От браузъра:** DevTools → Network → филтър **WS** → `socket.io/?EIO=4&transport=websocket` трябва да има статус **`101 Switching Protocols`**

### 9.2 Sitemap.xml — NPM routing

> ✅ **ДОБАВЕНО (Април 2026)** — sitemap генератор в server + explicit NPM location rule.

#### Проблемът

Google Search Console и други SEO инструменти използват различни User-Agent стрингове (`Googlebot-Smartphone`, `Google-Read-Aloud`, `AdsBot-Google` и др.), които **не се хващат** от bot detection UA map-а в NPM. Когато Google Search Console опитва да прочете `sitemap.xml`, заявката отива към `client:3000` (React SPA) и получава 404, защото `serve -s` връща `index.html` за всички непознати пътища.

Резултат в GSC: **"Sitemap не можа да бъде прочетена"**

#### Решението

Добавен **explicit `location ~ ^/sitemap.*\.xml$`** блок в NPM Advanced config, който прокси-ва ВСИЧКИ заявки за sitemap файлове директно към server контейнера — **независимо от User-Agent**.

**NPM UI → Edit Proxy Host за pensa.club → Advanced → Custom Nginx Configuration:**

(Добавя се в долната част, след `location /socket.io/` блока — НЕ премахвай bot detection, maintenance page и socket.io блока!)

```nginx
location ~ ^/sitemap.*\.xml$ {
    proxy_pass http://digital-literacy-wellbeing-60-plus-server-1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Обяснение на директивите:**
- `location ~ ^/sitemap.*\.xml$` — regex match за `/sitemap.xml`, `/sitemap-articles.xml`, `/sitemap-static.xml`, `/sitemap-initiatives.xml`, `/sitemap-projects.xml`, `/sitemap-publications.xml`, `/sitemap-stories.xml`, `/sitemap-clubs.xml`, `/sitemap-academy.xml`, `/sitemap-factcheck.xml`, `/sitemap-forum.xml`
- `proxy_pass` — директно към server контейнера, bypass на `serve -s` SPA fallback
- Headers — стандартни за запазване на client IP и протокол

#### Server-side имплементация

**Utility:** `server/src/utils/sitemapGenerator.js`
- `generateSitemapIndex()` — главен sitemap index
- `generateStaticSitemap()` — статични страници
- `generateContentSitemap(model, where, pathPrefix, opts)` — универсална функция за динамично съдържание
- Всички URL-и имат hreflang alternates за BG/EN/DE

**Controller:** `server/src/controllers/sitemapController.js`
- 10 endpoint-а (index + 9 sub-sitemaps)
- Всеки връща `Content-Type: application/xml; charset=utf-8`
- Cache header: `public, max-age=3600` (1 час)
- Прочитат моделите със съответните филтри:

| Sitemap | Модел | Филтър |
|---------|-------|--------|
| `/sitemap-articles.xml` | `article` | Всички (няма draft поле) |
| `/sitemap-initiatives.xml` | `initiative` | `isDraft: false` + `publishedAt !== null` |
| `/sitemap-projects.xml` | `project` | `isDraft: false` |
| `/sitemap-publications.xml` | `publication` | `isDraft: false` + `publishedAt !== null` |
| `/sitemap-stories.xml` | `story` | `isDraft: false` + `publishedAt !== null` |
| `/sitemap-clubs.xml` | `club_Club` | `isDraft: false` + `status: 'active'` |
| `/sitemap-academy.xml` | `course`, `seminar`, `mentor` | Courses: `isDraft: false` + `publishedAt !== null`; Seminars: `isPublished: true` + `publishedAt !== null`; Mentors: `status: 'active'` |
| `/sitemap-factcheck.xml` | `fact_check_module` | `status: 'published'` |
| `/sitemap-forum.xml` | `forum_post` | `status: 'published'` + `publishedAt !== null` |

**Router:** `server/src/router.js` — `router.use(sitemapController)` на root level (преди всички други routes).

#### robots.txt

**Файл:** `client/public/robots.txt`

Добавени:
- `Disallow:` правила за admin, profile, auth pages, error pages
- `Sitemap: https://pensa.club/sitemap.xml` директива

#### Потвърждение, че работи

1. **От браузъра директно (без bot user-agent):**
   ```
   https://pensa.club/sitemap.xml
   ```
   Очаквано: XML sitemap index с 9 sub-sitemaps

2. **С curl:**
   ```bash
   curl -v https://pensa.club/sitemap.xml 2>&1 | grep -E "HTTP|Content-Type"
   ```
   Очаквано: `HTTP/2 200` + `content-type: application/xml; charset=utf-8`

3. **В Google Search Console:**
   - Sitemap секция → "Добавяне на нова Sitemap" → `sitemap.xml` → Изпращане
   - Очаквано състояние: **"Успешно"** с брой намерени страници ~342 (92 dynamic items × 3 езика + 22 static × 3)

### 9.3 Push Notifications — VAPID keys

| Параметър | Стойност |
|-----------|----------|
| Пакет | `web-push` |
| VAPID keys | В `.env` файла (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) |
| Service Worker | `client/public/sw.js` |
| DB таблица | `push_subscriptions` (endpoint, keys_p256dh, keys_auth, user_id) |
| Endpoint | `POST /api/push/subscribe`, `DELETE /api/push/unsubscribe`, `GET /api/push/vapid-key` |
| Контролер | `server/src/controllers/pushController.js` |

> ⚠️ **При deploy на VPS:** VAPID keys трябва да се добавят в `.env` файла на сървъра.

---

## 10. Forum / Community система (добавено Март 2026)

| Компонент | Описание |
|-----------|----------|
| URL | `/academy/community` |
| Модели | `forum_post`, `forum_comment`, `forum_reaction`, `forum_space`, `forum_bookmark`, `forum_report`, `forum_poll`, `forum_user_status`, `forum_user_badge`, `forum_punishment_log` |
| Gamification | Badges (10 типа), Credits (интеграция с `user_credits`), Reputation score, Leaderboard |
| Real-time | Socket.IO — live коментари, typing indicators, online count |
| Email | Нотификации при коментар + седмичен digest (понеделник 10:00) |
| Push | Browser push notifications при нов коментар |
| SEO | `forumMetaGenerator.js` + `botDetector.js` pattern за `/academy/community` |
| OG Image | `server/public/images/forum/networking_people.jpg` |
| Admin | `/academy/admin/forum` — 9 таба (Overview, Posts, Comments, Spaces, Reports, Users, Rules, Settings, Analytics) |

---

## 11. Полезни VPS команди

```bash
# SSH връзка
ssh root@185.123.188.236

# Виж логове на сървъра
cd /root/Digital-Literacy-Wellbeing-60-plus
docker compose logs --tail=50 server
docker compose logs --tail=50 client
docker compose logs --tail=50 db

# Rebuild и рестарт
docker compose up -d --build client server

# Само рестарт (без rebuild)
docker compose restart server
docker compose restart client

# Виж статус на контейнерите
docker compose ps

# Влез в сървърен контейнер
docker compose exec server sh

# Влез в DB контейнер
docker compose exec db psql -U postgres -d pensaclub_db

# Виж последните миграции
docker compose exec server npx sequelize-cli db:migrate:status

# Ръчно пусни миграции
docker compose exec server npx sequelize-cli db:migrate

# Виж дисково пространство
df -h

# Виж Docker disk usage
docker system df
```

---

## 12. Препоръки и Action Items

| Приоритет | Действие | Статус |
|-----------|---------|--------|
| 🟢 **DONE** | `app.set('trust proxy', 1)` — добавено в `server/src/config/expressConfig.js` | ✅ Март 2026 |
| 🟢 **DONE** | Socket.IO интеграция — real-time коментари, typing, online count | ✅ Март 2026 |
| 🟢 **DONE** | Push Notifications — web-push + Service Worker | ✅ Март 2026 |
| 🟢 **DONE** | Forum Gamification — badges, credits, leaderboard, analytics | ✅ Март 2026 |
| 🟢 **DONE** | NPM — добавен `location /socket.io/` в Advanced config за pensa.club proxy host (прокси към server:8080, WebSocket upgrade headers, 24h timeouts) — виж раздел 9.1 | ✅ Април 2026 |
| 🟡 **TODO** | Добави VAPID keys в `.env` на VPS | ⚠️ При deploy |
| 🟡 **MED** | NPM Admin (port 81) е публично достъпен — добави auth или IP ограничение | ⚠️ ПРОВЕРИ |
| 🟡 **MED** | Системният Nginx е inactive — деинсталирай (`apt remove nginx`) | ⚠️ ПОЧИСТИ |
| 🟢 **OK** | db контейнерът не е в `nginx-proxy` — правилно изолиран | ✅ OK |
| 🟢 **OK** | Fail2ban активен — 7-дневни банове, 9994 блокирани опита | ✅ OK |
| 🟢 **OK** | SSL/TLS само TLS 1.2+ с HSTS preload | ✅ OK |
| 🟢 **OK** | HTTP/2 включен | ✅ OK |

| Приоритет | Действие | Статус |
|-----------|---------|--------|
| 🟢 **DONE** | `app.set('trust proxy', 1)` — добавено в `server/src/config/expressConfig.js` | ✅ Март 2026 |
| 🟡 **MED** | NPM Admin (port 81) е публично достъпен — добави auth или IP ограничение | ⚠️ ПРОВЕРИ |
| 🟡 **MED** | Системният Nginx е inactive — деинсталирай (`apt remove nginx`) | ⚠️ ПОЧИСТИ |
| 🟢 **OK** | db контейнерът не е в `nginx-proxy` — правилно изолиран | ✅ OK |
| 🟢 **OK** | Fail2ban активен — 7-дневни банове, 9994 блокирани опита | ✅ OK |
| 🟢 **OK** | SSL/TLS само TLS 1.2+ с HSTS preload | ✅ OK |
| 🟢 **OK** | HTTP/2 включен | ✅ OK |
| 🟢 **OK** | Bot detection → SSR meta tags за социални мрежи | ✅ OK |
