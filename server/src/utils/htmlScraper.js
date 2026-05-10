// server/src/utils/htmlScraper.js
//
// Phase 2: HTML scraping for the bot crawler. Two extraction modes:
//   1. extractItems(html, baseUrl, selectors) — admin-configured CSS selectors
//      with optional `selector@attr` notation for attribute extraction.
//   2. autoExtractItems(html, baseUrl) — heuristic scrape for sites without
//      admin-configured selectors. Looks for <article>/news-card-ish blocks
//      that contain a heading and a link.
//
// Both paths share the same shape: { items, used } where `items` is an array
// of { title, link, image, description, publishedAt } and `used` is metadata
// the validation endpoint reports back to the admin.

const cheerio = require('cheerio');

const MAX_ITEMS = 50;
const MAX_TITLE_LEN = 500;
const MAX_DESCRIPTION_LEN = 500;
const AUTO_DESCRIPTION_LEN = 200;

// Class-name patterns we consider "article-like" wrappers when nothing better
// is configured. Covers WordPress/Drupal/Hugo blog conventions, Beaver
// Builder + Elementor + Avada loop classes, govt-CMS templates (e.g. noi.bg),
// and common search-result / archive markup. Still conservative — bigger
// nets bring in nav/footer noise. Word-boundary matching means partial hits
// like `hentry`, `fl-post-feed-post`, `elementor-loop-item`, `feed-item`,
// `wp-block-post-template-...` already pass via the smaller core keywords
// (entry, post, item) without needing per-framework rules.
const AUTO_CLASS_RE = /\b(article|news|post|story|item|card|entry|publication|tile|teaser|loop-wrapper|list-item|hentry|permalink|excerpt|archive-item|result|link-card|media-object|headline|feed-item|search-result|blog-item)\b/i;

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4'];

const truncate = (s, max) => {
    if (!s) return s;
    const str = String(s);
    if (str.length <= max) return str;
    return str.slice(0, max);
};

const cleanText = (s) => {
    if (!s) return '';
    return String(s).replace(/\s+/g, ' ').trim();
};

// Defensive: some sites embed escaped HTML inside description-bearing
// elements (e.g. JSON-LD snippets, lazy-render markup leaking into <p>),
// or use templates where cheerio's `.text()` ends up returning raw `<img>`
// markup as if it were text. Strip every tag-like sequence to make sure
// only human-readable text reaches the DB.
const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '');

const resolveUrl = (raw, baseUrl) => {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    if (!trimmed) return null;
    // Skip JS-style or data: URIs — they're never article links.
    if (/^(javascript:|data:|mailto:|tel:|#)/i.test(trimmed)) return null;
    try {
        return new URL(trimmed, baseUrl).toString();
    } catch (_) {
        return null;
    }
};

// Bulgarian + English month names → 1-based index. Used by the heuristic
// date parser below to handle "22 април 2026" / "22 April 2026" style strings
// that JS's Date constructor can't read on its own.
const MONTH_NAMES = {
    'януари': 1, 'февруари': 2, 'март': 3, 'април': 4, 'май': 5, 'юни': 6,
    'юли': 7, 'август': 8, 'септември': 9, 'октомври': 10, 'ноември': 11, 'декември': 12,
    'ян.': 1, 'фев.': 2, 'мар.': 3, 'апр.': 4, 'юн.': 6, 'юл.': 7, 'авг.': 8, 'сеп.': 9, 'окт.': 10, 'ное.': 11, 'дек.': 12,
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
    'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
};

// Heuristic date parser that handles all common Bulgarian + English news-site
// formats. Returns a Date or null.
//
// Recognised patterns (in priority order):
//   • ISO 8601 / Date-readable (the cheap path) — `2026-04-22`, `2026-04-22T14:30:00Z`
//   • dd.mm.yyyy           — `22.04.2026`, `22.04.2026 г.`
//   • dd/mm/yyyy           — `22/04/2026`
//   • dd-mm-yyyy           — `22-04-2026`
//   • yyyy-mm-dd           — `2026-04-22`
//   • dd <month> yyyy      — `22 април 2026`, `22 април 2026 г.`, `22 April 2026`
//   • <month> dd, yyyy     — `April 22, 2026`
//
// Time component (optional) is parsed when present: `, 14:30` or ` 14:30`.
const parseDateSafe = (raw) => {
    if (!raw) return null;
    const trimmed = cleanText(raw);
    if (!trimmed) return null;

    // Strip Bulgarian "г." (year suffix) and trailing punctuation noise.
    const cleaned = trimmed.replace(/\sг\.?$/i, '').trim();

    // Cheap path: native Date parser handles ISO and many RFC variants.
    const native = new Date(cleaned);
    if (!Number.isNaN(native.getTime())) {
        // Reject obviously bogus parses (e.g. "1.0" → 2001-01-01) by requiring
        // the year to look reasonable (1990..2100).
        const y = native.getFullYear();
        if (y >= 1990 && y <= 2100) return native;
    }

    // Optional trailing time — capture and apply at the end.
    let timePart = null;
    const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
        timePart = {
            h: parseInt(timeMatch[1], 10),
            m: parseInt(timeMatch[2], 10),
            s: timeMatch[3] ? parseInt(timeMatch[3], 10) : 0,
        };
    }

    const datePart = cleaned.replace(/\s*\d{1,2}:\d{2}(?::\d{2})?\s*$/, '').trim();

    let y = null, mo = null, d = null;

    // dd.mm.yyyy / dd/mm/yyyy / dd-mm-yyyy
    let m = datePart.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (m) {
        d = parseInt(m[1], 10); mo = parseInt(m[2], 10); y = parseInt(m[3], 10);
    }

    // yyyy-mm-dd / yyyy.mm.dd / yyyy/mm/dd
    if (y === null) {
        m = datePart.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
        if (m) { y = parseInt(m[1], 10); mo = parseInt(m[2], 10); d = parseInt(m[3], 10); }
    }

    // dd <month> yyyy
    if (y === null) {
        m = datePart.match(/^(\d{1,2})[\s.,]+([\p{L}.]+)[\s.,]+(\d{4})/u);
        if (m) {
            const mn = m[2].toLowerCase();
            if (MONTH_NAMES[mn]) { d = parseInt(m[1], 10); mo = MONTH_NAMES[mn]; y = parseInt(m[3], 10); }
        }
    }

    // <month> dd, yyyy
    if (y === null) {
        m = datePart.match(/^([\p{L}.]+)[\s.,]+(\d{1,2})[\s.,]+(\d{4})/u);
        if (m) {
            const mn = m[1].toLowerCase();
            if (MONTH_NAMES[mn]) { mo = MONTH_NAMES[mn]; d = parseInt(m[2], 10); y = parseInt(m[3], 10); }
        }
    }

    if (y === null || mo === null || d === null) return null;
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return null;

    const date = new Date(
        y,
        mo - 1,
        d,
        timePart ? timePart.h : 12, // noon default avoids TZ midnight rollovers
        timePart ? timePart.m : 0,
        timePart ? timePart.s : 0,
    );
    if (Number.isNaN(date.getTime())) return null;
    return date;
};

// Class / itemprop patterns that strongly suggest a date-bearing element.
// Used by the auto-extract path when no <time datetime> is present.
const DATE_CLASS_RE = /\b(date|datetime|time|publish|posted|published|when|meta-date|post-date|entry-date|article-date|news-date)\b/i;
const DATE_ITEMPROP_RE = /\b(datePublished|dateCreated|dateModified)\b/i;

// Try every reasonable strategy to find a published date inside `root`.
// Returns a Date or null. Never throws.
const findPublishedAt = ($, root) => {
    if (!root || !root.length) return null;

    // 1. <time datetime="..."> (most reliable, machine-readable).
    const timeAttr = root.find('time[datetime]').first();
    if (timeAttr.length) {
        const dt = parseDateSafe(timeAttr.attr('datetime'));
        if (dt) return dt;
    }

    // 2. <time>text</time> — element exists but no datetime attr.
    const timeEl = root.find('time').first();
    if (timeEl.length) {
        const dt = parseDateSafe(timeEl.text());
        if (dt) return dt;
    }

    // 3. <meta itemprop="datePublished" content="...">
    const metaItemprop = root.find('meta[itemprop]').filter((_i, el) => DATE_ITEMPROP_RE.test($(el).attr('itemprop') || '')).first();
    if (metaItemprop.length) {
        const dt = parseDateSafe(metaItemprop.attr('content'));
        if (dt) return dt;
    }

    // 4. Element with class hinting at a date (or itemprop datePublished).
    const classMatch = root.find('[class], [itemprop]').filter((_i, el) => {
        const cls = $(el).attr('class') || '';
        const ip = $(el).attr('itemprop') || '';
        return DATE_CLASS_RE.test(cls) || DATE_ITEMPROP_RE.test(ip);
    });
    for (let i = 0; i < classMatch.length; i++) {
        const el = $(classMatch[i]);
        // Try datetime attr first (some sites stick it on a span), then text.
        const attrDt = el.attr('datetime') || el.attr('data-time') || el.attr('content');
        if (attrDt) {
            const dt = parseDateSafe(attrDt);
            if (dt) return dt;
        }
        const txtDt = parseDateSafe(el.text());
        if (txtDt) return txtDt;
    }

    return null;
};

// Selector strings may carry attribute notation: `a@href`, `time@datetime`,
// `img@src`. Returns { sel, attr } where attr is null for normal selectors.
const splitSelectorAttr = (selStr) => {
    if (!selStr || typeof selStr !== 'string') return null;
    const trimmed = selStr.trim();
    if (!trimmed) return null;
    const at = trimmed.indexOf('@');
    if (at === -1) return { sel: trimmed, attr: null };
    return {
        sel: trimmed.slice(0, at).trim(),
        attr: trimmed.slice(at + 1).trim() || null,
    };
};

// Extract a value from `el` using a selector that may have multiple
// comma-separated alternates (CSS standard) plus optional @attr notation.
// Returns the first non-empty match, or '' if none.
const extractValue = ($, root, selStr, mode = 'text') => {
    const split = splitSelectorAttr(selStr);
    if (!split) return '';
    const { sel, attr } = split;

    let found = null;
    try {
        // cheerio supports comma-separated selectors natively.
        found = root.find(sel).first();
    } catch (_) {
        return '';
    }
    if (!found || !found.length) return '';

    if (attr) {
        const v = found.attr(attr);
        return v ? String(v).trim() : '';
    }
    if (mode === 'html') return found.html() || '';
    return cleanText(found.text());
};

// Resolve an image URL from common attributes (lazy-load patterns first).
const extractImageFromEl = ($, el, attrPreference) => {
    if (!el || !el.length) return '';
    if (attrPreference) {
        const v = el.attr(attrPreference);
        if (v) return v.trim();
    }
    const candidates = ['data-src', 'data-original', 'data-lazy-src', 'src', 'data-srcset', 'srcset'];
    for (const a of candidates) {
        const v = el.attr(a);
        if (v) {
            // srcset: take the first URL.
            const trimmed = String(v).trim();
            if (a.includes('srcset')) {
                const first = trimmed.split(',')[0]?.trim().split(/\s+/)[0];
                if (first) return first;
            } else {
                return trimmed;
            }
        }
    }
    return '';
};

// ─────────────────────────────────────────────────────────────────────────
// Configured-selector extraction
// ─────────────────────────────────────────────────────────────────────────

const extractItems = (html, baseUrl, selectors) => {
    const out = { items: [], used: { matched: 0, sample: [] } };
    if (!html || typeof html !== 'string') return out;
    if (!selectors || typeof selectors !== 'object') return out;
    if (!selectors.item || !selectors.title || !selectors.link) {
        return out;
    }

    let $;
    try {
        $ = cheerio.load(html);
    } catch (_) {
        return out;
    }

    let nodes;
    try {
        nodes = $(selectors.item);
    } catch (_) {
        return out;
    }
    out.used.matched = nodes.length;

    nodes.each((_idx, el) => {
        if (out.items.length >= MAX_ITEMS) return false;

        const root = $(el);

        const title = cleanText(extractValue($, root, selectors.title));
        if (!title) return;

        // Link extraction: prefer admin-configured selector, but if it returns
        // a relative URL and selectors uses just `a` without `@href`, default
        // to href anyway.
        const linkSplit = splitSelectorAttr(selectors.link);
        let rawLink = '';
        if (linkSplit) {
            try {
                const target = root.find(linkSplit.sel).first();
                if (target && target.length) {
                    if (linkSplit.attr) {
                        rawLink = target.attr(linkSplit.attr) || '';
                    } else {
                        rawLink = target.attr('href') || '';
                    }
                }
            } catch (_) { /* skip */ }
        }
        const link = resolveUrl(rawLink, baseUrl);
        if (!link) return;

        let imageUrl = null;
        if (selectors.image) {
            const split = splitSelectorAttr(selectors.image);
            if (split) {
                try {
                    const imgEl = root.find(split.sel).first();
                    if (imgEl && imgEl.length) {
                        const raw = extractImageFromEl($, imgEl, split.attr);
                        imageUrl = resolveUrl(raw, baseUrl);
                    }
                } catch (_) { /* skip */ }
            }
        }

        let description = null;
        if (selectors.description) {
            const txt = cleanText(stripHtml(extractValue($, root, selectors.description)));
            if (txt) description = truncate(txt, MAX_DESCRIPTION_LEN);
        }

        let publishedAt = null;
        if (selectors.published) {
            const split = splitSelectorAttr(selectors.published);
            if (split) {
                try {
                    const target = root.find(split.sel).first();
                    if (target && target.length) {
                        const raw = split.attr
                            ? target.attr(split.attr)
                            : target.text();
                        publishedAt = parseDateSafe(raw);
                    }
                } catch (_) { /* skip */ }
            }
        }
        // Fallback to heuristic when configured selector returns nothing or
        // an unparseable string — better than dropping the date entirely.
        if (!publishedAt) publishedAt = findPublishedAt($, root);

        out.items.push({
            title: truncate(title, MAX_TITLE_LEN),
            link,
            image: imageUrl || null,
            description,
            publishedAt,
        });
    });

    out.used.sample = out.items.slice(0, 3).map((i) => ({
        title: i.title,
        link: i.link,
    }));
    return out;
};

// ─────────────────────────────────────────────────────────────────────────
// Heuristic auto-extraction
// ─────────────────────────────────────────────────────────────────────────

// Stable-ish CSS selector for a node — used to suggest a selector to admins.
// Prefers a class that matches the article-pattern; otherwise tag + first
// matching class; otherwise just the tag name.
const suggestSelector = ($, el) => {
    const tag = (el.tagName || el.name || 'div').toLowerCase();
    const cls = $(el).attr('class') || '';
    if (!cls) return tag;
    const classes = cls.trim().split(/\s+/).filter(Boolean);
    const articleish = classes.find((c) => AUTO_CLASS_RE.test(c));
    if (articleish) return `${tag}.${articleish}`;
    if (classes.length) return `${tag}.${classes[0]}`;
    return tag;
};

const autoExtractItems = (html, baseUrl) => {
    const out = { items: [], used: { matched: 0, sample: [] }, suggestedSelectors: null };
    if (!html || typeof html !== 'string') return out;

    let $;
    try {
        $ = cheerio.load(html);
    } catch (_) {
        return out;
    }

    // Strip noise — script/style/nav/footer tags rarely contain articles
    // and their inner text just dilutes our extraction heuristics.
    $('script, style, noscript, nav, footer, header, aside').remove();

    // Candidate set: <article> + class-pattern matches.
    const seen = new Set();
    const candidates = [];

    $('article').each((_i, el) => {
        if (seen.has(el)) return;
        seen.add(el);
        candidates.push(el);
    });
    $('[class]').each((_i, el) => {
        if (seen.has(el)) return;
        const cls = $(el).attr('class') || '';
        if (!AUTO_CLASS_RE.test(cls)) return;
        seen.add(el);
        candidates.push(el);
    });

    // Filter: must have a usable title source AND at least one href.
    // Heading is preferred but not required — many modern card layouts
    // (and govt CMSes like noi.bg) put titles on `<a class="entry-title">`
    // instead of headings. We accept any link with non-trivial text length
    // as a title fallback. Skip wrappers that contain other candidates (we
    // want the leaves).
    const TITLE_CLASS_RE = /\b(entry-title|title|headline|name|heading)\b/i;
    const candidateSet = new Set(candidates);
    const filtered = candidates.filter((el) => {
        const root = $(el);
        const hasLink = root.find('a[href]').length > 0;
        if (!hasLink) return false;

        const hasHeading = HEADING_TAGS.some((t) => root.find(t).length > 0);
        const hasTitleClass = root.find(`[class]`).filter((_i, child) => {
            const c = $(child).attr('class') || '';
            return TITLE_CLASS_RE.test(c);
        }).length > 0;
        // A link with substantial text qualifies as a title source.
        const longLink = root.find('a[href]').toArray().some((a) => {
            const txt = cleanText($(a).text());
            return txt.length >= 12;
        });
        if (!hasHeading && !hasTitleClass && !longLink) return false;

        // Skip if this element contains another candidate — let the inner one
        // win so we don't accumulate the page wrapper.
        let containsAnother = false;
        root.find('*').each((_i, child) => {
            if (candidateSet.has(child)) {
                containsAnother = true;
                return false;
            }
            return undefined;
        });
        return !containsAnother;
    });

    out.used.matched = filtered.length;

    const seenLinks = new Set();
    let firstSelector = null;

    for (const el of filtered) {
        if (out.items.length >= MAX_ITEMS) break;
        const root = $(el);

        // Title resolution chain: first heading → element with title-like
        // class → text of the first substantial link (>= 12 chars).
        let title = '';
        for (const t of HEADING_TAGS) {
            const h = root.find(t).first();
            if (h.length) {
                title = cleanText(h.text());
                if (title) break;
            }
        }
        if (!title) {
            const titleClassEl = root.find('[class]').filter((_i, child) => {
                const c = $(child).attr('class') || '';
                return TITLE_CLASS_RE.test(c);
            }).first();
            if (titleClassEl.length) title = cleanText(titleClassEl.text());
        }
        if (!title) {
            const a = root.find('a[href]').toArray().find((node) => {
                const txt = cleanText($(node).text());
                return txt.length >= 12;
            });
            if (a) title = cleanText($(a).text());
        }
        if (!title) continue;

        // Link: prefer href inside the heading, else first article-level <a>.
        let rawLink = '';
        for (const t of HEADING_TAGS) {
            const a = root.find(`${t} a[href]`).first();
            if (a.length) {
                rawLink = a.attr('href') || '';
                if (rawLink) break;
            }
        }
        if (!rawLink) {
            const a = root.find('a[href]').first();
            if (a.length) rawLink = a.attr('href') || '';
        }
        const link = resolveUrl(rawLink, baseUrl);
        if (!link) continue;
        if (seenLinks.has(link)) continue;
        seenLinks.add(link);

        const imgEl = root.find('img').first();
        const rawImg = imgEl.length ? extractImageFromEl($, imgEl, null) : '';
        const image = resolveUrl(rawImg, baseUrl);

        let description = '';
        const p = root.find('p').first();
        if (p.length) {
            description = cleanText(stripHtml(p.text()));
        }
        if (!description) {
            // Fallback: text of the wrapper minus the title.
            const full = cleanText(stripHtml(root.text()));
            if (full && full.length > title.length) {
                description = full.replace(title, '').trim();
            }
        }
        if (description) description = truncate(description, AUTO_DESCRIPTION_LEN);

        // Published time — try every reasonable strategy (see findPublishedAt).
        const publishedAt = findPublishedAt($, root);

        if (!firstSelector) firstSelector = suggestSelector($, el);

        out.items.push({
            title: truncate(title, MAX_TITLE_LEN),
            link,
            image: image || null,
            description: description || null,
            publishedAt,
        });
    }

    if (out.items.length > 0 && firstSelector) {
        out.suggestedSelectors = {
            item: firstSelector,
            title: HEADING_TAGS.join(', '),
            link: 'a@href',
            image: 'img@src',
            description: 'p',
            published: 'time@datetime',
        };
    }

    out.used.sample = out.items.slice(0, 3).map((i) => ({
        title: i.title,
        link: i.link,
    }));

    return out;
};

module.exports = {
    extractItems,
    autoExtractItems,
};
