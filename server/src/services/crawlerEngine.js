// server/src/services/crawlerEngine.js
//
// Phase 1: pulls each bot's configured RSS sources, parses them, applies the
// admin's keyword criteria and inserts unique findings. Idempotent on URL
// hash. Designed to be safe to call concurrently per-bot, but the cron
// scheduler (server/src/cron/crawlerScheduler.js) doesn't fan out — a single
// run per bot at a time is plenty for the volumes we expect.

const {
    crawler_bot,
    crawler_source,
    crawler_run,
    crawler_finding,
} = require('../sequelize/models');

const { parseRss } = require('../utils/rssParser');
const { canonicalize, urlHash } = require('../utils/urlCanonical');
const { safeFetchValidate } = require('../utils/networkSafety');
const { extractItems, autoExtractItems } = require('../utils/htmlScraper');

// Some sites (esp. govt + Cloudflare-protected ones like noi.bg) actively
// reject any UA that mentions "bot" — they drop the TCP connection at the
// edge before the request even reaches their app. We use a real Firefox UA
// here. Operators who want to identify us can still find us via the X-Bot
// header below.
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0';
const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const matchCriteria = (criteria, text) => {
    if (!criteria || !Array.isArray(criteria.keywords) || criteria.keywords.length === 0) {
        // No keywords configured -> let everything through. Admin can still
        // filter by source URL choice; this matches the "browse everything"
        // mental model in the spec.
        return true;
    }
    const haystack = (text || '').toString();
    const kws = criteria.keywords.map((k) => String(k || '').trim()).filter(Boolean);
    if (kws.length === 0) return true;

    const caseSensitive = !!criteria.caseSensitive;
    const probe = caseSensitive ? haystack : haystack.toLowerCase();
    const normKws = kws.map((k) => (caseSensitive ? k : k.toLowerCase()));

    if (criteria.match === 'all') {
        return normKws.every((k) => probe.includes(k));
    }
    return normKws.some((k) => probe.includes(k));
};

// Transient socket errors that warrant a retry without conditional headers.
// undici sometimes ends up with a stale TCP socket against load-balanced
// origins (BIG-IP, etc.); a single fresh attempt usually clears it.
const TRANSIENT_SOCKET_ERRORS = new Set([
    'UND_ERR_SOCKET',
    'UND_ERR_CONNECT_TIMEOUT',
    'ECONNRESET',
    'EPIPE',
]);

// Bounded fetch with one transparent retry on transient socket errors.
const safeFetchBody = async (url, headers = {}) => {
    const first = await safeFetchBodyOnce(url, headers);
    if (first.error && TRANSIENT_SOCKET_ERRORS.has(first.error.code)) {
        // Drop conditional headers — if a stale ETag is the trigger, the
        // origin's response without them will succeed.
        const retryHeaders = { ...headers };
        delete retryHeaders['If-None-Match'];
        delete retryHeaders['If-Modified-Since'];
        // Brief pause for the connection pool to settle.
        await sleep(250);
        return safeFetchBodyOnce(url, retryHeaders);
    }
    return first;
};

const safeFetchBodyOnce = async (url, headers = {}) => {
    const validation = await safeFetchValidate(url);
    if (!validation.ok) {
        return { error: { code: validation.code, message: validation.message } };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const resp = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/html;q=0.8, */*;q=0.5',
                'Accept-Language': 'bg-BG,bg;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Upgrade-Insecure-Requests': '1',
                // Self-identification via custom header — operators who check
                // headers (rare) can find us; bot-blockers don't sniff this.
                'X-Bot-Identifier': 'PensaClubNewsBot/1.0 (+https://pensa.club)',
                ...headers,
            },
        });

        if (resp.status === 304) {
            clearTimeout(timer);
            return { notModified: true, etag: resp.headers.get('etag'), lastModified: resp.headers.get('last-modified') };
        }
        if (!resp.ok) {
            clearTimeout(timer);
            return { error: { code: 'HTTP_' + resp.status, message: `HTTP ${resp.status}` } };
        }

        const declared = parseInt(resp.headers.get('content-length') || '0', 10);
        if (declared && declared > MAX_BODY_BYTES) {
            clearTimeout(timer);
            return { error: { code: 'BODY_TOO_LARGE', message: `Declared body ${declared} > ${MAX_BODY_BYTES}` } };
        }

        const reader = resp.body && resp.body.getReader ? resp.body.getReader() : null;
        if (!reader) {
            const text = await resp.text();
            clearTimeout(timer);
            if (text.length > MAX_BODY_BYTES) {
                return { error: { code: 'BODY_TOO_LARGE', message: 'Body exceeded cap' } };
            }
            return {
                body: text,
                etag: resp.headers.get('etag'),
                lastModified: resp.headers.get('last-modified'),
            };
        }

        let received = 0;
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.length;
            if (received > MAX_BODY_BYTES) {
                try { await reader.cancel(); } catch (_) { /* noop */ }
                clearTimeout(timer);
                return { error: { code: 'BODY_TOO_LARGE', message: 'Body exceeded cap' } };
            }
            chunks.push(value);
        }
        clearTimeout(timer);

        const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        return {
            body: buf.toString('utf8'),
            etag: resp.headers.get('etag'),
            lastModified: resp.headers.get('last-modified'),
        };
    } catch (err) {
        clearTimeout(timer);
        // Surface the underlying cause so the History tab tells the admin
        // *why* it failed (TLS, ECONNREFUSED, abort/timeout, etc.).
        const detail = err?.cause?.code || err?.code || err?.name;
        const message = err?.message || 'Fetch failed';
        const code = err?.name === 'AbortError' ? 'TIMEOUT' : (detail || 'FETCH_ERROR');
        return { error: { code, message: detail ? `${detail}: ${message}` : message } };
    }
};

const truncate = (s, max) => {
    if (!s) return s;
    if (s.length <= max) return s;
    return s.slice(0, max);
};

// Append (or replace) a page parameter on a URL — for HTML pagination.
// Tries to match the site's existing scheme: if URL already has page=N as
// a query, replaces it; if path-style /page/N/ is present, replaces that;
// otherwise appends ?page=N or &page=N depending on whether other params exist.
const appendPageParam = (url, n) => {
    try {
        const u = new URL(url);
        // Existing path-style /page/N or /page/N/
        const m = u.pathname.match(/(.*\/page\/)\d+(\/?)$/);
        if (m) {
            u.pathname = `${m[1]}${n}${m[2]}`;
            return u.toString();
        }
        // Existing ?page= or &page= query
        if (u.searchParams.has('page')) {
            u.searchParams.set('page', String(n));
            return u.toString();
        }
        // Default: append &page=N
        u.searchParams.set('page', String(n));
        return u.toString();
    } catch {
        return url;
    }
};

// Detect whether a body looks like XML (RSS/Atom). Quick check — proper
// validation happens in parseRss.
const looksLikeFeed = (body) => {
    if (!body) return false;
    const head = body.trim().slice(0, 512).toLowerCase();
    return /<\?xml|<rss\b|<feed\b/.test(head);
};

// When the user pastes an HTML page URL, look for the actual feed in it.
// Returns the discovered feed URL or null. Tries: (1) <link rel="alternate"
// type="application/rss+xml|atom+xml"> in the page <head>; (2) common feed
// paths at the same origin (/rss, /feed, /atom.xml, /rss.xml, /index.xml).
const discoverRssUrl = async (pageUrl, htmlBody) => {
    // (1) Parse <link rel="alternate"> tags out of the HTML.
    const linkRe = /<link\b[^>]*\brel\s*=\s*["']?(?:alternate)["']?[^>]*>/gi;
    const matches = (htmlBody || '').match(linkRe) || [];
    for (const tag of matches) {
        if (!/type\s*=\s*["']?application\/(rss\+xml|atom\+xml|xml)/i.test(tag)) continue;
        const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
        if (!hrefMatch) continue;
        try {
            const candidate = new URL(hrefMatch[1], pageUrl).toString();
            // Verify it actually returns a feed — cheap probe.
            const probe = await safeFetchBody(candidate);
            if (probe.body && looksLikeFeed(probe.body)) return candidate;
        } catch (_) { /* try next */ }
    }

    // (2) Brute-force common paths at the origin.
    let origin;
    try { origin = new URL(pageUrl).origin; } catch (_) { return null; }
    const candidates = ['/rss', '/feed', '/atom.xml', '/rss.xml', '/index.xml', '/rss/', '/feed/'];
    for (const p of candidates) {
        const candidate = origin + p;
        try {
            const probe = await safeFetchBody(candidate);
            if (probe.body && looksLikeFeed(probe.body)) return candidate;
        } catch (_) { /* try next */ }
    }
    return null;
};

const runBot = async (botId, { trigger = 'cron' } = {}) => {
    const bot = await crawler_bot.findByPk(botId);
    if (!bot) {
        throw new Error(`crawler bot ${botId} not found`);
    }

    const startedAt = new Date();
    const run = await crawler_run.create({
        botId,
        trigger,
        startedAt,
        status: 'running',
        sourcesScanned: 0,
        itemsSeen: 0,
        itemsNew: 0,
    });

    const errors = [];
    let sourcesScanned = 0;
    let itemsSeen = 0;
    let itemsNew = 0;
    let successfulSources = 0;

    const sources = await crawler_source.findAll({
        where: { botId, active: true },
        order: [['id', 'ASC']],
    });

    let lastDomain = null;
    for (const source of sources) {
        sourcesScanned += 1;

        // Honour rssUrl ONLY for explicitly-RSS sources. Older runs may have
        // auto-discovered a feed and persisted rssUrl on an 'auto' source; if
        // the admin then bumped maxPages (clear HTML pagination intent), we
        // must NOT keep dragging the legacy feed URL — fall back to the
        // original page URL so HTML scraping + pagination work as expected.
        const fetchUrl = (source.sourceType === 'rss' && source.rssUrl)
            ? source.rssUrl
            : source.url;
        const headers = {};
        if (source.etag) headers['If-None-Match'] = source.etag;
        if (source.lastModified) headers['If-Modified-Since'] = source.lastModified;

        // Per-source crawl-delay (only meaningful when consecutive sources
        // share a host; this is the common case for Phase 1 single-domain
        // monitoring per bot, so we just blanket-sleep before next source
        // when same host is repeated).
        try {
            const u = new URL(fetchUrl);
            if (lastDomain && u.host === lastDomain && (source.robotsCrawlDelay || 0) > 0) {
                await sleep(source.robotsCrawlDelay * 1000);
            }
            lastDomain = u.host;
        } catch (_) { /* invalid url surfaces in the fetch step */ }

        const result = await safeFetchBody(fetchUrl, headers);
        if (result.error) {
            errors.push({
                sourceId: source.id,
                sourceName: source.name,
                code: result.error.code,
                message: result.error.message,
            });
            continue;
        }

        // Update conditional-GET tokens regardless of whether body changed —
        // that's exactly what the server told us.
        const headerUpdates = {};
        if (result.etag) headerUpdates.etag = truncate(result.etag, 255);
        if (result.lastModified) headerUpdates.lastModified = truncate(result.lastModified, 64);
        if (Object.keys(headerUpdates).length) {
            try { await source.update(headerUpdates); } catch (_) { /* non-fatal */ }
        }

        if (result.notModified) {
            successfulSources += 1;
            continue;
        }

        // Three-way fork: source.sourceType can be 'rss', 'html', or 'auto'.
        //   • 'rss': always feed path (with auto-discovery if the URL points
        //     to an HTML page that advertises a feed).
        //   • 'html': always scrape, ignore any embedded feed link.
        //   • 'auto': try feed path UNLESS the admin set maxPages > 1, which
        //     is a clear signal they want HTML pagination (RSS doesn't
        //     paginate, so picking RSS would silently lose history). We also
        //     intentionally DO NOT persist any sourceType / rssUrl change
        //     during auto runs — the user keeps the freedom to switch later
        //     just by changing maxPages or sourceType in the UI.
        const declaredType = source.sourceType || 'rss';
        let body = result.body;
        let mode = null; // 'rss' | 'html'
        let scrapedItems = null;

        const userWantsPagination = (source.maxPages || 1) > 1;
        const tryFeedPath = declaredType === 'rss'
            || (declaredType === 'auto' && !userWantsPagination);

        if (tryFeedPath && looksLikeFeed(body)) {
            mode = 'rss';
        } else if (tryFeedPath) {
            // Body is HTML — try to discover a feed.
            const discovered = await discoverRssUrl(fetchUrl, body);
            if (discovered) {
                // Persist ONLY for explicit 'rss' sources — for 'auto' we
                // don't lock the user in (see comment block above).
                if (declaredType === 'rss') {
                    try { await source.update({ rssUrl: discovered, sourceType: 'rss' }); } catch (_) { /* non-fatal */ }
                }
                const probe = await safeFetchBody(discovered);
                if (probe.body && looksLikeFeed(probe.body)) {
                    body = probe.body;
                    mode = 'rss';
                }
            }
        }

        if (!mode) {
            // Either declared 'html', or feed discovery exhausted — scrape.
            if (!body || typeof body !== 'string') {
                errors.push({
                    sourceId: source.id,
                    sourceName: source.name,
                    code: 'NO_HTML_BODY',
                    message: 'Empty body for HTML source.',
                });
                continue;
            }
            try {
                const useConfigured = source.htmlSelectors
                    && typeof source.htmlSelectors === 'object'
                    && source.htmlSelectors.item
                    && source.htmlSelectors.title
                    && source.htmlSelectors.link;
                const extracted = useConfigured
                    ? extractItems(body, fetchUrl, source.htmlSelectors)
                    : autoExtractItems(body, fetchUrl);

                if (!extracted.items.length) {
                    errors.push({
                        sourceId: source.id,
                        sourceName: source.name,
                        code: 'NO_ITEMS_EXTRACTED',
                        message: useConfigured
                            ? 'Configured selectors did not match any items.'
                            : 'Auto-scrape found no article-like blocks.',
                    });
                    continue;
                }
                scrapedItems = extracted.items;
                mode = 'html';
                // Don't persist sourceType for 'auto' — keep the source
                // pliant so admin can flip behavior later via maxPages alone.
            } catch (err) {
                errors.push({
                    sourceId: source.id,
                    sourceName: source.name,
                    code: 'PARSE_ERROR',
                    message: err && err.message ? err.message : 'HTML parse failed',
                });
                continue;
            }
        }

        let items = [];
        if (mode === 'rss') {
            try {
                const parsed = parseRss(body);
                items = parsed.items.map((item) => ({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    image: item.image,
                    publishedAt: item.pubDate || null,
                }));
            } catch (err) {
                errors.push({
                    sourceId: source.id,
                    sourceName: source.name,
                    code: 'PARSE_ERROR',
                    message: err && err.message ? err.message : 'parse failed',
                });
                continue;
            }
        } else {
            items = scrapedItems || [];
        }

        successfulSources += 1;

        // Optional time cutoff. Items with no publishedAt always pass through —
        // we don't want to drop articles just because a feed omits the date.
        const cutoffMs = (bot.lookBackDays && bot.lookBackDays > 0)
            ? Date.now() - bot.lookBackDays * 86_400_000
            : null;

        // Multi-page crawling for HTML sources. Iterate ?page=2..maxPages,
        // append items, stop early when a page yields nothing new or all
        // items are older than the cutoff (so we don't waste requests on a
        // history we wouldn't keep anyway).
        if (mode === 'html' && (source.maxPages || 1) > 1) {
            const maxPages = Math.min(source.maxPages, 50);
            const seenLinksThisRun = new Set(items.map((it) => it.link).filter(Boolean));
            for (let page = 2; page <= maxPages; page++) {
                const pageUrl = appendPageParam(fetchUrl, page);
                const pageRes = await safeFetchBody(pageUrl);
                if (pageRes.error || !pageRes.body) break;

                let pageItems = [];
                try {
                    const useConfigured = source.htmlSelectors
                        && source.htmlSelectors.item
                        && source.htmlSelectors.title
                        && source.htmlSelectors.link;
                    const extracted = useConfigured
                        ? extractItems(pageRes.body, pageUrl, source.htmlSelectors)
                        : autoExtractItems(pageRes.body, pageUrl);
                    pageItems = extracted.items || [];
                } catch (_) { break; }

                // Drop links we've already collected on earlier pages — typical
                // when pagination repeats sticky/featured items at the top.
                const fresh = pageItems.filter((it) => it.link && !seenLinksThisRun.has(it.link));
                if (fresh.length === 0) break;
                fresh.forEach((it) => seenLinksThisRun.add(it.link));
                items.push(...fresh);

                // If the cutoff is set and EVERY fresh item on this page is
                // older than it, no point fetching more pages — older still.
                if (cutoffMs) {
                    const datedFresh = fresh.filter((it) => it.publishedAt);
                    if (datedFresh.length === fresh.length
                        && datedFresh.every((it) => new Date(it.publishedAt).getTime() < cutoffMs)) {
                        break;
                    }
                }

                if (source.robotsCrawlDelay > 0) await sleep(source.robotsCrawlDelay * 1000);
            }
        }

        for (const item of items) {
            itemsSeen += 1;
            const link = item.link;
            if (!link) continue;
            const canonical = canonicalize(link);
            if (!canonical) continue;
            const hash = urlHash(canonical);

            const existing = await crawler_finding.findOne({
                where: { botId, urlHash: hash },
                attributes: ['id'],
            });
            if (existing) continue;

            if (cutoffMs && item.publishedAt) {
                const ts = new Date(item.publishedAt).getTime();
                if (Number.isFinite(ts) && ts < cutoffMs) continue;
            }

            const haystack = `${item.title || ''} ${item.description || ''}`;
            if (!matchCriteria(bot.criteria, haystack)) continue;

            try {
                await crawler_finding.create({
                    botId,
                    sourceId: source.id,
                    runId: run.id,
                    externalUrl: truncate(canonical, 1000),
                    urlHash: hash,
                    title: truncate(item.title || '(untitled)', 500),
                    description: item.description || null,
                    imageUrl: item.image ? truncate(item.image, 1000) : null,
                    publishedAt: item.publishedAt || null,
                    status: 'new',
                });
                itemsNew += 1;
            } catch (err) {
                // Composite unique index races (parallel runs) land here too.
                if (err && err.name !== 'SequelizeUniqueConstraintError') {
                    errors.push({
                        sourceId: source.id,
                        sourceName: source.name,
                        code: 'INSERT_ERROR',
                        message: err.message,
                    });
                }
            }
        }
    }

    let status;
    if (errors.length === 0) status = 'success';
    else if (successfulSources > 0) status = 'partial_failure';
    else status = 'failed';

    await run.update({
        finishedAt: new Date(),
        status,
        sourcesScanned,
        itemsSeen,
        itemsNew,
        errorLog: errors.length ? errors : null,
    });

    await bot.update({
        lastRunAt: new Date(),
        lastRunStatus: status,
    });

    return {
        runId: run.id,
        status,
        sourcesScanned,
        itemsSeen,
        itemsNew,
        errors,
    };
};

module.exports = {
    runBot,
    matchCriteria,
    safeFetchBody,
    looksLikeFeed,
    discoverRssUrl,
};
