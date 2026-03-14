const { generateHreflangTags } = require('./hreflangHelper');

/**
 * Генерира HTML с meta tags за главната страница на Програма ReАкция
 */
function generateReactionLandingMetaHTML() {
    const title = 'Програма ReАкция — Медийна грамотност за възрастни | Pensa Club';
    const description = 'Безплатни менторски посещения за медийна грамотност в пенсионерски клубове. Програма ReАкция е инициатива на Български фонд за жените и Фондация ПЕНСА.';
    const imageUrl = 'https://pensa.club/images/reaction/reaction.jpg';
    const url = 'https://pensa.club/reaction';
    const keywords = 'Програма ReАкция, медийна грамотност, дигитална грамотност, пенсионери, възрастни хора, менторски посещения, пенсионерски клубове, дезинформация, фалшиви новини, Български фонд за жените, Фондация ПЕНСА, Pensa Club';

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
    <meta property="og:image:alt" content="Програма ReАкция — менторски посещения за медийна грамотност">
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
    <meta name="twitter:image:alt" content="Програма ReАкция — менторски посещения за медийна грамотност">

    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
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
            "name": "Медийна грамотност и дигитална грамотност за възрастни хора"
        },
        "audience": {
            "@type": "Audience",
            "audienceType": "Възрастни хора и пенсионери"
        },
        "sponsor": [
            {
                "@type": "Organization",
                "name": "Български фонд за жените",
                "url": "https://bgfundforwomen.org"
            },
            {
                "@type": "Organization",
                "name": "Фондация ПЕНСА",
                "url": "https://pensa.club"
            }
        ],
        "inLanguage": "bg"
    }
    </script>

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/reaction')}

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

/**
 * Генерира HTML с meta tags за страницата за заявка на посещение (ReАкция)
 */
function generateReactionBookMetaHTML() {
    const title = 'Заяви менторско посещение — Програма ReАкция | Pensa Club';
    const description = 'Заявете безплатно менторско посещение за вашия пенсионерски клуб. Обучени ментори ще проведат разговор за медийна грамотност, разпознаване на дезинформация и дигитални умения.';
    const imageUrl = 'https://pensa.club/images/reaction/reaction.jpg';
    const url = 'https://pensa.club/reaction/book';
    const keywords = 'заяви посещение, менторско посещение, пенсионерски клуб, медийна грамотност, дигитална грамотност, дезинформация, фалшиви новини, безплатно обучение, възрастни хора, Програма ReАкция, Български фонд за жените, Фондация ПЕНСА';

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
    <meta property="og:image:alt" content="Заяви менторско посещение — Програма ReАкция">
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
    <meta name="twitter:image:alt" content="Заяви менторско посещение — Програма ReАкция">

    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
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
        "mainEntity": {
            "@type": "Service",
            "name": "Менторско посещение за медийна грамотност",
            "description": "Безплатно посещение от обучен ментор в пенсионерски клуб за разговор относно медийна грамотност и дигитални умения",
            "provider": {
                "@type": "Organization",
                "name": "Фондация ПЕНСА"
            },
            "isRelatedTo": {
                "@type": "EducationalOccupationalProgram",
                "name": "Програма ReАкция"
            },
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BGN",
                "description": "Безплатно"
            }
        },
        "audience": {
            "@type": "Audience",
            "audienceType": "Пенсионерски клубове и възрастни хора"
        },
        "inLanguage": "bg"
    }
    </script>

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/reaction/book')}

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

module.exports = { generateReactionLandingMetaHTML, generateReactionBookMetaHTML };
