// server/src/utils/rssParser.js
//
// Tiny dependency-free RSS 2.0 / Atom 1.0 parser. We don't pull in a full XML
// library because the feeds we ingest are publisher-controlled, well-formed
// enough, and Phase 1 only needs title/link/description/date/image.
// Robustness: any single malformed tag must not abort the whole feed.

const { decodeHtmlEntities } = require('./htmlEntities');

const stripCdata = (s) => {
    if (!s) return '';
    return s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
};

const cleanText = (s) => {
    if (!s) return '';
    const noCdata = stripCdata(s.trim());
    return decodeHtmlEntities(noCdata).trim();
};

// Strip HTML tags from a string. RSS feeds often embed HTML inside CDATA
// blocks of <description> / <content>, and we want plain text in the DB
// (the email + UI render the description as a snippet). Image-extraction
// needs to happen BEFORE this — keep extractFirstImgInHtml(...) calls on
// the raw description, not the stripped version.
const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '');

// Match the inner text of <tag>...</tag>, taking the first occurrence within
// the supplied block. Tag matching is case-insensitive and ignores attrs.
const extractTag = (block, tag) => {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = block.match(re);
    return m ? cleanText(m[1]) : '';
};

const extractAllTags = (block, tag) => {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const out = [];
    let m;
    while ((m = re.exec(block))) {
        const v = cleanText(m[1]);
        if (v) out.push(v);
    }
    return out;
};

// Atom <link href="..."/> — supports both self-closing and opening forms.
// Prefers rel="alternate" or no rel.
const extractAtomLink = (block) => {
    const re = /<link\b([^>]*?)\/?>/gi;
    let m;
    let fallback = '';
    while ((m = re.exec(block))) {
        const attrs = m[1] || '';
        const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
        if (!hrefMatch) continue;
        const relMatch = attrs.match(/\brel\s*=\s*["']([^"']+)["']/i);
        const rel = relMatch ? relMatch[1].toLowerCase() : '';
        const href = decodeHtmlEntities(hrefMatch[1]);
        if (!rel || rel === 'alternate') return href;
        if (!fallback) fallback = href;
    }
    return fallback;
};

// RSS <enclosure url="..." type="image/..." /> — return the first image url.
const extractEnclosureImage = (block) => {
    const re = /<enclosure\b([^>]*)\/?>(?:<\/enclosure>)?/gi;
    let m;
    while ((m = re.exec(block))) {
        const attrs = m[1] || '';
        const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
        const urlMatch = attrs.match(/\burl\s*=\s*["']([^"']+)["']/i);
        if (!urlMatch) continue;
        const t = typeMatch ? typeMatch[1].toLowerCase() : '';
        if (!t || t.startsWith('image/')) return decodeHtmlEntities(urlMatch[1]);
    }
    return '';
};

// Look for media:content / media:thumbnail (MRSS extension) — common on news
// sites like BBC, NYT.
const extractMediaImage = (block) => {
    const re = /<media:(?:content|thumbnail)\b([^>]*)\/?>/gi;
    let m;
    while ((m = re.exec(block))) {
        const attrs = m[1] || '';
        const urlMatch = attrs.match(/\burl\s*=\s*["']([^"']+)["']/i);
        if (urlMatch) return decodeHtmlEntities(urlMatch[1]);
    }
    return '';
};

// Last-resort: scrape <img src> from CDATA description/content.
const extractFirstImgInHtml = (htmlText) => {
    if (!htmlText) return '';
    const m = htmlText.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
    return m ? decodeHtmlEntities(m[1]) : '';
};

const splitItems = (xml, openTag, closeTag) => {
    const re = new RegExp(`<${openTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${closeTag}>`, 'gi');
    const out = [];
    let m;
    while ((m = re.exec(xml))) out.push(m[1]);
    return out;
};

const parseDate = (raw) => {
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return d;
};

const parseRss = (xmlString) => {
    if (!xmlString || typeof xmlString !== 'string') {
        return { items: [] };
    }

    const isAtom = /<feed\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2005\/Atom["']/i.test(xmlString)
        || /<entry\b/i.test(xmlString) && !/<item\b/i.test(xmlString);

    const items = [];

    if (!isAtom) {
        const blocks = splitItems(xmlString, 'item', 'item');
        for (const block of blocks) {
            try {
                const title = extractTag(block, 'title');
                const link = extractTag(block, 'link');
                const description = extractTag(block, 'description');
                const pubDate = parseDate(extractTag(block, 'pubDate') || extractTag(block, 'dc:date'));
                const categories = extractAllTags(block, 'category');
                const image = extractEnclosureImage(block)
                    || extractMediaImage(block)
                    || extractFirstImgInHtml(description);
                if (!title && !link) continue;
                items.push({
                    title,
                    link,
                    description: stripHtml(description).replace(/\s+/g, ' ').trim(),
                    pubDate,
                    image: image || null,
                    categories,
                });
            } catch (_) {
                // Bad item — skip, keep parsing the rest.
            }
        }
    } else {
        const blocks = splitItems(xmlString, 'entry', 'entry');
        for (const block of blocks) {
            try {
                const title = extractTag(block, 'title');
                const link = extractAtomLink(block);
                const description = extractTag(block, 'summary') || extractTag(block, 'content');
                const pubDate = parseDate(extractTag(block, 'published') || extractTag(block, 'updated'));
                const categories = extractAllTags(block, 'category');
                const image = extractMediaImage(block) || extractFirstImgInHtml(description);
                if (!title && !link) continue;
                items.push({
                    title,
                    link,
                    description: stripHtml(description).replace(/\s+/g, ' ').trim(),
                    pubDate,
                    image: image || null,
                    categories,
                });
            } catch (_) {
                // ignore bad entry
            }
        }
    }

    return { items };
};

module.exports = { parseRss };
