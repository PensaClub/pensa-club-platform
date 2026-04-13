/**
 * Meta generators for listing pages that previously had no bot detection handler.
 * These were causing 404 errors in Google Search Console because Googlebot
 * was being routed to the server but no handler existed for these paths.
 */

const { generateHreflangTags } = require('./hreflangHelper');

/**
 * Generic builder for a listing page meta HTML.
 * Returns a fully-formed HTML page with Open Graph, Twitter Card,
 * Schema.org structured data, canonical URL, and hreflang tags.
 */
function buildListMetaHTML({ title, description, keywords, imageUrl, url, path }) {
    return `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Basic Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Pensa Foundation">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    <meta property="og:locale:alternate" content="de_DE">
    <meta property="og:locale:alternate" content="en_US">

    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${title}">

    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "${title}",
        "description": "${description}",
        "url": "${url}",
        "image": "${imageUrl}",
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Club",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pensa.club/logo.png"
            }
        },
        "inLanguage": "bg"
    }
    </script>

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags(path)}

    <!-- Redirect to React App -->
    <meta http-equiv="refresh" content="0; url=${url}">
    <script>
        window.location.href = "${url}";
    </script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

// ─── INITIATIVES LIST ──────────────────────────────────────────────────────
function generateInitiativesListMetaHTML() {
    return buildListMetaHTML({
        title: 'Инициативи | Pensa Club',
        description: 'Социални инициативи и кампании на Фондация ПЕНСА за подпомагане на пенсионери. Разгледайте всички активни и приключили инициативи и се включете в каузите.',
        keywords: 'инициативи, пенсионери, социални каузи, доброволчество, Фондация ПЕНСА, Pensa Club, помощ за възрастни хора',
        imageUrl: 'https://pensa.club/images/initiatives/initiatives_cover.png',
        url: 'https://pensa.club/initiatives',
        path: '/initiatives',
    });
}

// ─── PROJECTS LIST ─────────────────────────────────────────────────────────
function generateProjectsListMetaHTML() {
    return buildListMetaHTML({
        title: 'Проекти | Pensa Club',
        description: 'Проекти на Фондация ПЕНСА за дигитална грамотност и благополучие на пенсионери в България. Образователни и социални проекти за хора над 60 години.',
        keywords: 'проекти, дигитална грамотност, пенсионери, образование, Фондация ПЕНСА, Pensa Club, проекти за възрастни',
        imageUrl: 'https://pensa.club/images/projects/projects_cover.png',
        url: 'https://pensa.club/projects',
        path: '/projects',
    });
}

// ─── PUBLICATIONS LIST ─────────────────────────────────────────────────────
function generatePublicationsListMetaHTML() {
    return buildListMetaHTML({
        title: 'Публикации | Pensa Club',
        description: 'Публикации, доклади и материали на Фондация ПЕНСА. Информация и анализи по теми за дигитална грамотност, пенсионна система и благополучие на пенсионери.',
        keywords: 'публикации, доклади, материали, Фондация ПЕНСА, дигитална грамотност, пенсионна система, Pensa Club',
        imageUrl: 'https://pensa.club/images/publications/publications_cover.jpg',
        url: 'https://pensa.club/publications',
        path: '/publications',
    });
}

// ─── STORIES LIST ──────────────────────────────────────────────────────────
function generateStoriesListMetaHTML() {
    return buildListMetaHTML({
        title: 'Истории | Pensa Club',
        description: 'Реални истории на пенсионери, които споделят опита си с дигиталните технологии. Вдъхновяващи разкази за активен живот, нови умения и онлайн общуване след 60.',
        keywords: 'истории, пенсионери, дигитален опит, активен живот, Pensa Club, реални разкази, технологии за възрастни',
        imageUrl: 'https://pensa.club/images/stories/stories_cover.jpg',
        url: 'https://pensa.club/stories',
        path: '/stories',
    });
}

// ─── CLUBS LIST ────────────────────────────────────────────────────────────
function generateClubsListMetaHTML() {
    return buildListMetaHTML({
        title: 'Клубове | Pensa Club',
        description: 'Клубове на пенсионери в България. Разгледайте всички клубове за хора над 60 години — спорт, изкуство, образование, социални дейности и забавления.',
        keywords: 'клубове за пенсионери, пенсионерски клубове, България, социални клубове, активен живот, Pensa Club',
        imageUrl: 'https://pensa.club/images/clubs/clubs_cover.jpg',
        url: 'https://pensa.club/clubs',
        path: '/clubs',
    });
}

module.exports = {
    generateInitiativesListMetaHTML,
    generateProjectsListMetaHTML,
    generatePublicationsListMetaHTML,
    generateStoriesListMetaHTML,
    generateClubsListMetaHTML,
};
