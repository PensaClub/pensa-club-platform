# VPS Команди — Бърза справка

---

## Docker — Контейнери

### Проверка на статуса
```bash
# Виж работещите контейнери
docker ps

# Виж всички контейнери (включително спрените)
docker ps -a
```

### Логове
```bash
# Последните 30 реда от server логовете
docker logs digital-literacy-wellbeing-60-plus-server-1 --tail 30

# Последните 20 реда от client логовете
docker logs digital-literacy-wellbeing-60-plus-client-1 --tail 20

# Последните 20 реда от database логовете
docker logs digital-literacy-wellbeing-60-plus-db-1 --tail 20

# Следи логовете в реално време (Ctrl+C за спиране)
docker logs digital-literacy-wellbeing-60-plus-server-1 -f

# Логове от последните 10 минути
docker logs digital-literacy-wellbeing-60-plus-server-1 --since 10m
```

### Рестартиране
```bash
# Рестарт само на сървъра (бързо, без rebuild)
docker compose restart server

# Рестарт на всичко
docker compose restart

# Спри и пусни сървъра (по-пълен рестарт)
docker compose down server && docker compose up -d server

# Rebuild и рестарт на сървъра (при промени в package.json)
docker compose up -d --build server

# Rebuild и рестарт на всичко
docker compose up -d --build client server

# Rebuild без кеш (при проблеми)
docker compose build --no-cache server && docker compose up -d server
```

### Влизане в контейнер
```bash
# Влез в server контейнера (shell)
docker exec -it digital-literacy-wellbeing-60-plus-server-1 sh

# Изпълни команда в контейнера без да влизаш
docker exec digital-literacy-wellbeing-60-plus-server-1 node -e "console.log('test')"

# Провери env variables
docker exec digital-literacy-wellbeing-60-plus-server-1 env | grep FIREBASE
```

### Почистване на Docker
```bash
# Изтрий всички неизползвани images, контейнери, volumes (ВНИМАНИЕ: освобождава място)
sudo docker system prune -a -f

# Виж колко място заема Docker
docker system df

# Изтрий само неизползвани images
docker image prune -f

# Изтрий само спрени контейнери
docker container prune -f
```

---

## База данни (PostgreSQL)

### Миграции
```bash
# Провери статус на миграциите
docker exec digital-literacy-wellbeing-60-plus-server-1 npx sequelize-cli db:migrate:status

# Изпълни pending миграции
docker exec digital-literacy-wellbeing-60-plus-server-1 npx sequelize-cli db:migrate

# Откати последната миграция (ВНИМАНИЕ)
docker exec digital-literacy-wellbeing-60-plus-server-1 npx sequelize-cli db:migrate:undo
```

### Backup
```bash
# Създай backup на базата
docker exec digital-literacy-wellbeing-60-plus-db-1 pg_dump -U pensaclub_user pensaclub > backup_$(date +%Y%m%d).sql

# Възстанови от backup (ВНИМАНИЕ: презаписва данните)
docker exec -i digital-literacy-wellbeing-60-plus-db-1 psql -U pensaclub_user pensaclub < backup_file.sql
```

---

## Fail2Ban — Защита от brute force

### Статус
```bash
# Виж всички jails и статус
sudo fail2ban-client status

# Виж конкретен jail (напр. sshd)
sudo fail2ban-client status sshd

# Виж nginx jail (ако е настроен)
sudo fail2ban-client status nginx-http-auth
```

### Блокирани IP адреси
```bash
# Списък с блокирани IP-та за sshd
sudo fail2ban-client status sshd | grep "Banned IP"

# Виж всички блокирани IP-та от всички jails
sudo fail2ban-client banned

# Виж fail2ban лог файл
sudo tail -50 /var/log/fail2ban.log

# Търси конкретно IP в логовете
sudo grep "Ban" /var/log/fail2ban.log | tail -20

# Виж кога е блокирано конкретно IP
sudo grep "192.168.1.1" /var/log/fail2ban.log
```

### Управление на IP адреси
```bash
# Отблокирай IP адрес
sudo fail2ban-client set sshd unbanip 192.168.1.1

# Блокирай IP адрес ръчно
sudo fail2ban-client set sshd banip 192.168.1.1

# Рестартирай fail2ban
sudo systemctl restart fail2ban
```

---

## Nginx Proxy Manager (NPM) — реално използван reverse proxy

> ⚠️ **ВАЖНО:** Системният nginx на хоста е **НЕАКТИВЕН**. Целият трафик минава през Nginx Proxy Manager (NPM) в Docker контейнер. Управлява се през web UI на `http://185.123.188.236:81`, не чрез `/etc/nginx/`.

### Достъп до NPM

| Параметър | Стойност |
|---|---|
| Web UI | `http://185.123.188.236:81` |
| Контейнер | `nginx-proxy-manager-app-1` |
| Конфигурация | `/data/nginx/proxy_host/1.conf` (в контейнера) |
| Error logs | `/data/logs/proxy-host-1_error.log` (в контейнера) |
| Access logs | `/data/logs/proxy-host-1_access.log` (в контейнера) |

### Команди за NPM

```bash
# Виж nginx конфигурацията за pensa.club
docker exec nginx-proxy-manager-app-1 cat /data/nginx/proxy_host/1.conf

# Виж последните грешки в NPM
docker exec nginx-proxy-manager-app-1 tail -50 /data/logs/proxy-host-1_error.log

# Следи grешки в реално време
docker exec nginx-proxy-manager-app-1 tail -f /data/logs/proxy-host-1_error.log

# Виж достъпи (последни 30)
docker exec nginx-proxy-manager-app-1 tail -30 /data/logs/proxy-host-1_access.log

# Провери дали nginx конфигурацията е валидна
docker exec nginx-proxy-manager-app-1 nginx -t

# Reload на nginx вътре в NPM контейнера (без downtime)
docker exec nginx-proxy-manager-app-1 nginx -s reload

# Рестарт на целия NPM контейнер
docker restart nginx-proxy-manager-app-1

# Виж кои контейнери са в nginx-proxy мрежата (с IP-та)
docker network inspect nginx-proxy | grep -A 3 "Name\|IPv4Address"
```

### Тест на връзка от NPM към друг контейнер

NPM контейнерът **няма `curl` или `wget`**, но има `node`:

```bash
# Тест към server container (HTTP)
docker exec nginx-proxy-manager-app-1 node -e "
const http = require('http');
http.get('http://digital-literacy-wellbeing-60-plus-server-1:8080/api/health', r => {
  let d = ''; r.on('data', c => d += c);
  r.on('end', () => console.log(r.statusCode, d));
}).on('error', e => console.log('ERR', e.message));
"

# Тест на Socket.IO handshake от NPM към server
docker exec nginx-proxy-manager-app-1 node -e "
const http = require('http');
http.get('http://digital-literacy-wellbeing-60-plus-server-1:8080/socket.io/?EIO=4&transport=polling', r => {
  let d = ''; r.on('data', c => d += c);
  r.on('end', () => console.log(r.statusCode, d));
}).on('error', e => console.log('ERR', e.message));
"
# Очаквано: 200 0{"sid":"...","upgrades":["websocket"],...}

# Тест на WebSocket upgrade през NPM към pensa.club (end-to-end)
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
# Очаквано: UPGRADE OK: 101
```

### Тест на Socket.IO директно в server контейнера

```bash
# Проверка дали Socket.IO handshake работи вътре в server:8080
docker exec digital-literacy-wellbeing-60-plus-server-1 sh -c 'node -e "
const http = require(\"http\");
http.get(\"http://localhost:8080/socket.io/?EIO=4&transport=polling\", r => {
  let d = \"\"; r.on(\"data\", c => d += c);
  r.on(\"end\", () => console.log(r.statusCode, d));
}).on(\"error\", e => console.log(\"ERR\", e.message));"'
# Очаквано: 200 0{"sid":"...","upgrades":["websocket"],"pingInterval":25000,...}
```

---

## Nginx (системен) — НЕАКТИВЕН

> ⚠️ Системният nginx е **спрян** от октомври 2025. Команди по-долу са само за справка — не се използват в production.

```bash
# Провери статус (ще покаже inactive)
sudo systemctl status nginx

# Логове (старо, не се пълни)
sudo tail -30 /var/log/nginx/access.log
sudo tail -30 /var/log/nginx/error.log

# Провери конфигурацията
sudo nginx -t
```

---

## Системни команди

### Дисково пространство
```bash
# Виж свободно място
df -h

# Виж най-големите папки
du -sh /* 2>/dev/null | sort -rh | head -10

# Виж размер на Docker данните
sudo du -sh /var/lib/docker/
```

### Памет и CPU
```bash
# Виж използвана памет
free -h

# Виж натоварване на CPU и процеси
top

# По-красив вариант (ако е инсталиран)
htop
```

### SSH
```bash
# Виж кой е логнат в момента
who

# Виж последните логвания
last -10

# Виж неуспешни опити за логване
sudo grep "Failed password" /var/log/auth.log | tail -20
```

---

## Deploy — Бърз процес

### Ръчен deploy
```bash
cd ~/Digital-Literacy-Wellbeing-60-plus

# 1. Вземи последния код
git pull origin main

# 2. Rebuild и рестарт
docker compose up -d --build client server

# 3. Провери логовете
docker logs digital-literacy-wellbeing-60-plus-server-1 --tail 20
```

### При проблеми с deploy
```bash
# Спри всичко
docker compose down

# Почисти Docker кеша
sudo docker system prune -a -f

# Rebuild от нулата
docker compose up -d --build

# Провери дали всичко работи
docker ps
docker logs digital-literacy-wellbeing-60-plus-server-1 --tail 30
```

---

## YouTube OAuth

### Провери токени
```bash
# Виж YouTube tokens файл
docker exec digital-literacy-wellbeing-60-plus-server-1 cat /app/youtube-tokens/tokens.json 2>/dev/null || echo "No tokens file"
```

### Re-authorize (при изтекъл token)
```
Отвори в браузъра: https://pensa.club/api/youtube/auth
```

---

## SSL Сертификати

```bash
# Провери кога изтича SSL сертификатът
sudo certbot certificates

# Поднови сертификата
sudo certbot renew

# Автоматично подновяване (трябва да е настроен cron)
sudo certbot renew --dry-run
```
