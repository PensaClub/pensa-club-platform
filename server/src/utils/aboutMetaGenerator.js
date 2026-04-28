const { generateHreflangTags } = require('./hreflangHelper');

function generateAboutMetaHTML() {
    const title = 'За Pensa Club — мисия, екип и партньори | Pensa Club';
    const description = 'Pensa Foundation създава Pensa Club, за да обедини 150+ пенсионерски клуба, доброволни ментори и общности в дигиталното пространство. Виж нашата мисия, екип, партньори и историята на DigiBridge Academy.';
    const keywords = 'Pensa Foundation, мисия, екип, партньори, DigiBridge Academy, EU Civic Innovation Fund, пенсионерски клубове, дигитална грамотност, доброволчество';
    const imageUrl = 'https://pensa.club/images/about_us/about-us.webp';
    const url = 'https://pensa.club/about';

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
        "@type": "AboutPage",
        "name": "${title}",
        "description": "${description}",
        "url": "${url}",
        "image": "${imageUrl}",
        "inLanguage": "bg",
        "mainEntity": {
            "@type": "Organization",
            "name": "Pensa Club",
            "alternateName": "Pensa Foundation",
            "url": "https://pensa.club/",
            "logo": "https://pensa.club/logo.png",
            "foundingDate": "2023",
            "description": "Иновативна дигитална платформа за подобряване качеството на живот на възрастните хора в България",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "BG",
                "addressLocality": "София"
            },
            "sameAs": [
                "https://www.facebook.com/profile.php?id=61578204366479"
            ],
            "areaServed": ["BG", "DE"],
            "knowsAbout": [
                "Дигитална грамотност",
                "Образование за възрастни",
                "Технологии за пенсионери",
                "Интернет безопасност",
                "Доброволчество"
            ]
        }
    }
    </script>

    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/about')}

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

module.exports = generateAboutMetaHTML;
