/**
 * Генерира HTML с Open Graph meta tags за Academy главна страница
 * @returns {String} - HTML string с meta tags
 */
const { generateHreflangTags } = require('./hreflangHelper');

function generateAcademyMetaHTML() {
    const title = 'DigiBridge Academy - Дигитална грамотност за всички | Pensa Club';
    const description = 'Безплатна платформа за обучение по дигитална грамотност. Свържете се с ментор и започнете своето дигитално пътешествие днес. Част от европейския проект BRIDGE.';
    const keywords = 'дигитална грамотност, обучение онлайн, ментори, BRIDGE проект, безплатни курсове, пенсионери, възрастни, Pensa Club, образование';
    const url = 'https://pensa.club/academy';
    const imageUrl = 'https://pensa.club/images/digibridge/hero-image.jpg';

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
    <meta property="og:image:alt" content="DigiBridge Academy">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    
    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="DigiBridge Academy">
    
    <!-- Structured Data (Schema.org) - EducationalOrganization -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "DigiBridge Academy",
        "description": "${description}",
        "url": "${url}",
        "logo": "https://pensa.club/images/digibridge/logo.png",
        "image": "${imageUrl}",
        "parentOrganization": {
            "@type": "Organization",
            "name": "Pensa Foundation",
            "url": "https://pensa.club"
        },
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BG"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "info@pensa.club"
        },
        "sameAs": [
            "https://www.facebook.com/profile.php?id=61578204366479"
        ],
        "inLanguage": ["bg", "de", "en"]
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
    <h1>DigiBridge Academy</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generateAcademyMetaHTML;