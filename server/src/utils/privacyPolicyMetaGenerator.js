const { generateHreflangTags } = require('./hreflangHelper');

function generatePrivacyPolicyMetaHTML() {
    const title = 'Политика за поверителност | Pensa Club';
    const description = 'Политика за поверителност и защита на лични данни на Pensa Club — как събираме, обработваме и защитаваме информацията на нашите потребители. Съответствие с GDPR.';
    const keywords = 'политика за поверителност, лични данни, GDPR, защита на данни, Pensa Club, права на потребителите, бисквитки, cookies';
    const imageUrl = 'https://pensa.club/images/privacy/Privacy_Policy.jpg';
    const url = 'https://pensa.club/privacy-policy';

    return `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Pensa Foundation">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

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

    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${title}">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${title}",
        "description": "${description}",
        "url": "${url}",
        "image": "${imageUrl}",
        "inLanguage": "bg",
        "isPartOf": {
            "@type": "WebSite",
            "name": "Pensa Club",
            "url": "https://pensa.club/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Foundation",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pensa.club/logo.png"
            }
        }
    }
    </script>

    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/privacy-policy')}

    <meta http-equiv="refresh" content="0; url=${url}">
    <script>window.location.href = "${url}";</script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generatePrivacyPolicyMetaHTML;
