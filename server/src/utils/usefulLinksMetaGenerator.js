/**
 * Генерира HTML с Open Graph meta tags за страницата Полезни връзки
 * @returns {String} - HTML string с meta tags
 */
const { generateHreflangTags } = require('./hreflangHelper');

function generateUsefulLinksMetaHTML() {
    const title = 'Полезни връзки за пенсионери | Pensa Club';
    const description = 'Подбрана колекция от полезни сайтове и онлайн ресурси за хора над 60 години — здраве, финанси, държавни услуги, образование, технологии и още.';
    const imageUrl = 'https://pensa.club/images/pensa-club-card.png?v=2';
    const url = 'https://pensa.club/useful-links';
    const keywords = 'полезни връзки, сайтове за пенсионери, онлайн ресурси, здраве, финанси, държавни услуги, електронно управление, образование, технологии, Pensa Club';

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
            "url": "https://pensa.club",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pensa.club/images/homePage/logo-2.png"
            }
        },
        "about": {
            "@type": "Thing",
            "name": "Полезни онлайн ресурси за хора 60+"
        },
        "audience": {
            "@type": "Audience",
            "audienceType": "Пенсионери и хора над 60 години"
        },
        "inLanguage": "bg"
    }
    </script>

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/useful-links')}

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

module.exports = generateUsefulLinksMetaHTML;
