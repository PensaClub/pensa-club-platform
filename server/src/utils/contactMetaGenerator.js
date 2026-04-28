const { generateHreflangTags } = require('./hreflangHelper');

const BASE_URL = 'https://pensa.club';

const TRANSLATIONS = {
    bg: {
        htmlLang: 'bg',
        ogLocale: 'bg_BG',
        title: 'Контакти | Pensa Club',
        description: 'Свържете се с екипа на Pensa Club за въпроси, партньорства, доброволчество или регистрация на пенсионерски клуб. София, България. Email и социални мрежи.',
        keywords: 'контакти, връзка с Pensa Club, имейл, София, доброволчество, партньорство, пенсионерски клуб регистрация',
        bodyFallback: 'Ако не бъдете пренасочени автоматично, кликнете тук',
    },
    en: {
        htmlLang: 'en',
        ogLocale: 'en_US',
        title: 'Contact | Pensa Club',
        description: 'Get in touch with the Pensa Club team for questions, partnerships, volunteering or to register a retirement club. Sofia, Bulgaria. Email and social media.',
        keywords: 'contact, Pensa Club contact, email, Sofia, volunteering, partnership, retirement club registration',
        bodyFallback: 'If you are not redirected automatically, click here',
    },
    de: {
        htmlLang: 'de',
        ogLocale: 'de_DE',
        title: 'Kontakt | Pensa Club',
        description: 'Kontaktieren Sie das Pensa Club Team für Fragen, Partnerschaften, Ehrenamt oder zur Registrierung eines Rentnerclubs. Sofia, Bulgarien. E-Mail und soziale Medien.',
        keywords: 'Kontakt, Pensa Club Kontakt, E-Mail, Sofia, Ehrenamt, Partnerschaft, Rentnerclub Registrierung',
        bodyFallback: 'Wenn Sie nicht automatisch weitergeleitet werden, klicken Sie hier',
    },
};

const buildLangUrl = (path, lang) => {
    if (lang === 'bg') return `${BASE_URL}${path}`;
    return `${BASE_URL}/${lang}${path}`;
};

function generateContactMetaHTML(lang = 'bg') {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.bg;
    const url = buildLangUrl('/contact', lang);
    const imageUrl = `${BASE_URL}/images/contactus/contactus.jpg`;

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
        "@type": "ContactPage",
        "name": "${t.title}",
        "description": "${t.description}",
        "url": "${url}",
        "image": "${imageUrl}",
        "inLanguage": "${t.htmlLang}",
        "mainEntity": {
            "@type": "Organization",
            "name": "Pensa Club",
            "alternateName": "Pensa Foundation",
            "url": "${BASE_URL}/",
            "logo": "${BASE_URL}/logo.png",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "бул. Скобелев, 13А",
                "addressLocality": "София",
                "addressCountry": "BG"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Support",
                "availableLanguage": ["Bulgarian", "German", "English"],
                "areaServed": ["BG", "DE"]
            },
            "sameAs": [
                "https://www.facebook.com/profile.php?id=61578204366479"
            ]
        }
    }
    </script>

    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/contact')}

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

module.exports = generateContactMetaHTML;
