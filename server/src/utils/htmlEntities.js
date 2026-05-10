// server/src/utils/htmlEntities.js
//
// Minimal HTML entity decoder used wherever we extract text from raw HTML/XML
// (article OG metadata, RSS feeds, etc.). Not an exhaustive named-entity
// table — covers the named entities common in feeds plus full numeric ranges.

const decodeHtmlEntities = (str) => {
    if (!str) return '';
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
};

module.exports = { decodeHtmlEntities };
