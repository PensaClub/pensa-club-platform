const { generateHreflangTags } = require('./hreflangHelper');

const BASE_URL = 'https://pensa.club';

const TRANSLATIONS = {
    bg: {
        htmlLang: 'bg',
        ogLocale: 'bg_BG',
        title: 'За Pensa Club — мисия, екип и партньори | Pensa Club',
        description: 'Pensa Foundation създава Pensa Club, за да обедини 150+ пенсионерски клуба, доброволни ментори и общности в дигиталното пространство. Виж нашата мисия, екип, партньори и историята на DigiBridge Academy.',
        keywords: 'Pensa Foundation, мисия, екип, партньори, DigiBridge Academy, EU Civic Innovation Fund, пенсионерски клубове, дигитална грамотност, доброволчество',
        bodyFallback: 'Ако не бъдете пренасочени автоматично, кликнете тук',
    },
    en: {
        htmlLang: 'en',
        ogLocale: 'en_US',
        title: 'About Pensa Club — mission, team and partners | Pensa Club',
        description: 'Pensa Foundation runs Pensa Club to connect 150+ retirement clubs, volunteer mentors and communities in the digital space. Discover our mission, team, partners and the story of DigiBridge Academy.',
        keywords: 'Pensa Foundation, mission, team, partners, DigiBridge Academy, EU Civic Innovation Fund, retirement clubs, digital literacy, volunteering',
        bodyFallback: 'If you are not redirected automatically, click here',
    },
    de: {
        htmlLang: 'de',
        ogLocale: 'de_DE',
        title: 'Über Pensa Club — Mission, Team und Partner | Pensa Club',
        description: 'Pensa Foundation betreibt Pensa Club, um 150+ Rentnerclubs, freiwillige Mentoren und Gemeinschaften im digitalen Raum zu vereinen. Entdecken Sie unsere Mission, unser Team, unsere Partner und die Geschichte der DigiBridge Academy.',
        keywords: 'Pensa Foundation, Mission, Team, Partner, DigiBridge Academy, EU Civic Innovation Fund, Rentnerclubs, digitale Kompetenz, Ehrenamt',
        bodyFallback: 'Wenn Sie nicht automatisch weitergeleitet werden, klicken Sie hier',
    },
};

const buildLangUrl = (path, lang) => {
    if (lang === 'bg') return `${BASE_URL}${path}`;
    return `${BASE_URL}/${lang}${path}`;
};

function generateAboutMetaHTML(lang = 'bg') {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.bg;
    const url = buildLangUrl('/about', lang);
    const imageUrl = `${BASE_URL}/images/about_us/about-us.webp`;

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
        "@type": "AboutPage",
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
            "foundingDate": "2023",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "BG",
                "addressLocality": "София"
            },
            "sameAs": [
                "https://www.facebook.com/profile.php?id=61578204366479"
            ],
            "areaServed": ["BG", "DE"]
        }
    }
    </script>

    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/about')}

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

module.exports = generateAboutMetaHTML;
