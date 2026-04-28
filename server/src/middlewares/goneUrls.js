/**
 * Returns HTTP 410 Gone for URLs that used to exist but have been
 * permanently removed (old features, renamed routes, deleted content).
 *
 * Why 410 and not 404:
 *   404 = "not found right now" → search engines keep retrying for months.
 *   410 = "permanently gone" → search engines drop the URL faster (~weeks)
 *         and stop spending crawl budget on it.
 *
 * Used to clean up orphan URLs Google still has from earlier site versions:
 * /elite-membership, /craigslist, /join-community, /suggest-user, and the
 * specific old initiative slug /initiatives/nece-hope-festival-oslo-2025.
 *
 * Matches both the bare path and the /en/, /de/ language variants because
 * Googlebot probes all three.
 */
const GONE_PATHS = [
    '/elite-membership',
    '/craigslist',
    '/join-community',
    '/suggest-user',
    '/initiatives/nece-hope-festival-oslo-2025',
];

const buildPattern = (path) => new RegExp(`^(?:/(?:en|de))?${path.replace(/\//g, '\\/')}\\/?$`);
const GONE_PATTERNS = GONE_PATHS.map(buildPattern);

const HTML_410 = `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex">
    <title>410 Gone</title>
</head>
<body>
    <h1>410 Gone</h1>
    <p>This page has been permanently removed.</p>
    <p>Тази страница е премахната завинаги. <a href="https://pensa.club/">Към началната страница</a>.</p>
</body>
</html>`;

function goneUrlsMiddleware(req, res, next) {
    if (GONE_PATTERNS.some((pattern) => pattern.test(req.path))) {
        res.status(410)
            .set('Content-Type', 'text/html; charset=utf-8')
            .send(HTML_410);
        return;
    }
    next();
}

module.exports = goneUrlsMiddleware;
