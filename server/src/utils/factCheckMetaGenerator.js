const { generateHreflangTags } = require('./hreflangHelper');

const escapeHtml = (text) => {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Генерира HTML с meta tags за главната страница Проверка на факти
 */
function generateFactCheckListMetaHTML() {
    const title = 'Проверка на факти — ПроВерка | Pensa Club';
    const description = 'Не вярвайте на слухове — проверете фактите. Платформа за борба с дезинформацията, насочена към възрастните хора в България. Програма ReАкция — Български фонд за жените.';
    const imageUrl = 'https://pensa.club/images/factcheck/factcheck.jpg';
    const url = 'https://pensa.club/fact-check';
    const keywords = 'проверка на факти, дезинформация, фалшиви новини, факт-чек, fact check, пенсионери, възрастни хора, Програма ReАкция, Български фонд за жените, Pensa Club';

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
            "name": "Проверка на факти и борба с дезинформацията"
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
    ${generateHreflangTags('/fact-check')}

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
 * Генерира HTML с meta tags за детайлна страница на fact-check модул
 * @param {Object} module - Sequelize fact_check_module обект
 */
function generateFactCheckDetailMetaHTML(module) {
    const verdictMap = {
        'false': 'Невярно',
        'misleading': 'Подвеждащо',
        'partially_true': 'Частично вярно',
    };

    const verdictLabel = verdictMap[module.verdict] || module.verdict;
    const claimPreview = escapeHtml(module.claimText.substring(0, 120));
    const title = escapeHtml(`${verdictLabel}: ${module.claimText.substring(0, 80)}`);
    const description = escapeHtml(module.verification.substring(0, 160));
    const imageUrl = 'https://pensa.club/images/factcheck/factcheck.jpg';
    const url = `https://pensa.club/fact-check/${module.slug}`;
    const keywords = `${escapeHtml(module.category)}, проверка на факти, ${verdictLabel}, дезинформация, Pensa Club`;

    return `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Basic Meta Tags -->
    <title>${title} | Pensa Club</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Pensa Foundation">

    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title} | Pensa Club">
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
    ${module.created_at ? `<meta property="article:published_time" content="${module.created_at}">` : ''}

    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title} | Pensa Club">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${title}">

    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ClaimReview",
        "url": "${url}",
        "claimReviewed": "${claimPreview}",
        "author": {
            "@type": "Organization",
            "name": "Pensa Club",
            "url": "https://pensa.club"
        },
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": "${module.verdict === 'false' ? '1' : module.verdict === 'misleading' ? '2' : '3'}",
            "bestRating": "5",
            "alternateName": "${verdictLabel}"
        },
        "itemReviewed": {
            "@type": "Claim",
            "name": "${claimPreview}",
            "datePublished": "${module.created_at || ''}"
        },
        "datePublished": "${module.created_at || ''}",
        "inLanguage": "bg"
    }
    </script>

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags(`/fact-check/${module.slug}`)}

    <!-- Redirect to React App -->
    <script>
        setTimeout(() => {
            window.location.href = '/fact-check/${module.slug}';
        }, 100);
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

module.exports = { generateFactCheckListMetaHTML, generateFactCheckDetailMetaHTML };
