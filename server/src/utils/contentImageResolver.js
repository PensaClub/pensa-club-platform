// server/src/utils/contentImageResolver.js
//
// Single source of truth for "give me a thumbnail URL for this content row".
// Each content type stores its main image differently:
//
//   seminar     → thumbnailUrl (direct field)
//   course      → thumbnailUrl (direct field)
//   article     → mainImage hasOne assoc → sources[] (array of URLs)
//   initiative  → mainImage hasOne assoc → src (single URL)
//   project     → mainImage hasOne assoc → src
//   publication → mainImage hasOne assoc → src
//   club (Club) → mainImage column (direct STRING field)
//
// Fallback chain for ALL types:
//   1. type-specific direct/assoc field
//   2. mainImage gallery first item (when applicable)
//   3. Pensa Club logo placeholder

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://pensa.club';
const DEFAULT_PLACEHOLDER = `${PUBLIC_BASE_URL.replace(/\/$/, '')}/images/homePage/logo-2.png`;

const absolutize = (url) => {
    if (!url) return null;
    const s = String(url).trim();
    if (!s) return null;
    if (/^(https?:)?\/\//i.test(s)) return s;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(s)) return s;
    const base = PUBLIC_BASE_URL.replace(/\/$/, '');
    return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
};

/**
 * Returns sequelize `include` clauses needed to resolve a thumbnail
 * for the given content type. Use when querying.
 */
const includeForContentImage = (contentType, models) => {
    if (!models) return [];
    const { mainImage, image } = models;
    switch (contentType) {
        case 'article':
            return mainImage
                ? [{ model: mainImage, as: 'mainImage', required: false }]
                : [];
        case 'initiative':
        case 'project':
        case 'publication':
            return image
                ? [{ model: image, as: 'mainImage', required: false }]
                : [];
        // seminar/course/club have direct fields — no include needed
        default:
            return [];
    }
};

/**
 * Extracts a usable thumbnail URL from a content row, with fallback chain.
 * Always returns a valid URL (placeholder if nothing else worked).
 *
 * Accepts either Sequelize instance or plain object (raw:true compatible).
 */
const resolveContentImage = (row, contentType) => {
    if (!row) return DEFAULT_PLACEHOLDER;
    const get = (path) => {
        // Support both `row.foo` and `row.toJSON()` shapes
        const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
        return path.split('.').reduce(
            (acc, k) => (acc != null ? acc[k] : undefined),
            data,
        );
    };

    let candidate = null;

    switch (contentType) {
        case 'seminar':
        case 'course':
            candidate = get('thumbnailUrl');
            break;

        case 'article': {
            // mainImage.sources is an array of URLs (different sizes)
            const sources = get('mainImage.sources');
            if (Array.isArray(sources) && sources.length > 0) {
                candidate = sources[0];
            }
            break;
        }

        case 'initiative':
        case 'project':
        case 'publication':
            candidate = get('mainImage.src');
            break;

        case 'club':
            candidate = get('mainImage');
            break;

        default:
            candidate = get('thumbnailUrl') || get('mainImage') || null;
    }

    const abs = absolutize(candidate);
    return abs || DEFAULT_PLACEHOLDER;
};

module.exports = {
    includeForContentImage,
    resolveContentImage,
    DEFAULT_PLACEHOLDER,
};
