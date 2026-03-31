const { generateHreflangTags } = require('./hreflangHelper');

/**
 * Генерира HTML с meta tags за DigiBridge Общност (Forum Community)
 */
function generateForumCommunityMetaHTML() {
    const title = 'DigiBridge Общност — Дискусии, споделяне и учене заедно | Pensa Club';
    const description = 'Присъединете се към DigiBridge Общност — платформа за дискусии, споделяне на опит и взаимопомощ между възрастни хора. Публикувайте, коментирайте и се свързвайте с други участници.';
    const imageUrl = 'https://pensa.club/images/forum/networking_people.jpg';
    const url = 'https://pensa.club/academy/community';
    const keywords = 'DigiBridge общност, форум за възрастни, дискусии, споделяне на опит, дигитална грамотност, пенсионери, общност, Pensa Club, DigiBridge Academy, социална мрежа за възрастни, взаимопомощ';

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
    <meta property="og:image:alt" content="DigiBridge Общност — дискусии и споделяне за възрастни хора">
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
    <meta name="twitter:image:alt" content="DigiBridge Общност — дискусии и споделяне за възрастни хора">

    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
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
            "name": "Дискусионен форум за дигитална грамотност и споделяне на опит"
        },
        "audience": {
            "@type": "Audience",
            "audienceType": "Възрастни хора и пенсионери"
        },
        "inLanguage": "bg"
    }
    </script>

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/academy/community')}

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

module.exports = { generateForumCommunityMetaHTML };
