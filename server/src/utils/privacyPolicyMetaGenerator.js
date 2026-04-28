const { generateHreflangTags } = require('./hreflangHelper');

const BASE_URL = 'https://pensa.club';

const TRANSLATIONS = {
    bg: {
        htmlLang: 'bg',
        ogLocale: 'bg_BG',
        title: 'Политика за поверителност | Pensa Club',
        description: 'Политика за поверителност и защита на лични данни на Pensa Club — как събираме, обработваме и защитаваме информацията на нашите потребители. Съответствие с GDPR.',
        keywords: 'политика за поверителност, лични данни, GDPR, защита на данни, Pensa Club, права на потребителите, бисквитки, cookies',
        bodyFallback: 'Ако не бъдете пренасочени автоматично, кликнете тук',
    },
    en: {
        htmlLang: 'en',
        ogLocale: 'en_US',
        title: 'Privacy Policy | Pensa Club',
        description: 'Pensa Club privacy policy and personal data protection — how we collect, process and protect our users\' information. GDPR compliant.',
        keywords: 'privacy policy, personal data, GDPR, data protection, Pensa Club, user rights, cookies',
        bodyFallback: 'If you are not redirected automatically, click here',
    },
    de: {
        htmlLang: 'de',
        ogLocale: 'de_DE',
        title: 'Datenschutzerklärung | Pensa Club',
        description: 'Datenschutzerklärung und Schutz personenbezogener Daten von Pensa Club — wie wir die Informationen unserer Nutzer sammeln, verarbeiten und schützen. DSGVO-konform.',
        keywords: 'Datenschutzerklärung, personenbezogene Daten, DSGVO, Datenschutz, Pensa Club, Nutzerrechte, Cookies',
        bodyFallback: 'Wenn Sie nicht automatisch weitergeleitet werden, klicken Sie hier',
    },
};

const buildLangUrl = (path, lang) => {
    if (lang === 'bg') return `${BASE_URL}${path}`;
    return `${BASE_URL}/${lang}${path}`;
};

function generatePrivacyPolicyMetaHTML(lang = 'bg') {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.bg;
    const url = buildLangUrl('/privacy-policy', lang);
    const imageUrl = `${BASE_URL}/images/privacy/Privacy_Policy.jpg`;

    return `
<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${t.title}</title>
    <meta name="description" content="${t.description}">
    <meta name="keywords" content="${t.keywords}">
    <meta name="author" content="Pensa Foundation">
    <meta http-equiv="content-language" content="${t.htmlLang}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

    <meta property="og:type" content="website">
    <meta property="og:title" content="${t.title}">
    <meta property="og:description" content="${t.description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${t.title}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="${t.ogLocale}">
    <meta property="og:locale:alternate" content="bg_BG">
    <meta property="og:locale:alternate" content="de_DE">
    <meta property="og:locale:alternate" content="en_US">

    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${t.title}">
    <meta name="twitter:description" content="${t.description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${t.title}">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${t.title}",
        "description": "${t.description}",
        "url": "${url}",
        "image": "${imageUrl}",
        "inLanguage": "${t.htmlLang}",
        "isPartOf": {
            "@type": "WebSite",
            "name": "Pensa Club",
            "url": "${BASE_URL}/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Foundation",
            "logo": {
                "@type": "ImageObject",
                "url": "${BASE_URL}/logo.png"
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
    <h1>${t.title}</h1>
    <p>${t.description}</p>
    <p>${t.bodyFallback}: <a href="${url}">${url}</a></p>
</body>
</html>
    `.trim();
}

module.exports = generatePrivacyPolicyMetaHTML;
