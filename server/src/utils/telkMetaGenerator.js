const { generateHreflangTags } = require('./hreflangHelper');

function generateTelkMetaHTML() {
    const title = 'ТЕЛК, РКМЕ и РЗИ в България | Pensa Club';
    const description = 'Пълен справочник с контактна информация за ТЕЛК, РКМЕ и РЗИ във всички 28 региона на България. Адреси, телефони, работно време и председатели на медицинските комисии.';
    const imageUrl = 'https://pensa.club/images/rkme.jpeg';
    const url = 'https://pensa.club/telk-rkme-rzi';
    const keywords = 'ТЕЛК, РКМЕ, РЗИ, НЕЛК, медицински комисии, България, инвалидност, експертиза, здравна инспекция, пенсионери, Pensa Club';

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
        "@type": "GovernmentService",
        "name": "${title}",
        "description": "${description}",
        "url": "${url}",
        "image": "${imageUrl}",
        "provider": {
            "@type": "Organization",
            "name": "Pensa Club",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pensa.club/logo.png"
            }
        },
        "areaServed": {
            "@type": "Country",
            "name": "Bulgaria"
        },
        "serviceType": "Medical Expertise Commission Directory",
        "inLanguage": "bg"
    }
    </script>

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags(url.replace('https://pensa.club', ''))}

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

module.exports = generateTelkMetaHTML;
