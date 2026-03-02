/**
 * Генерира HTML с Open Graph meta tags за Clubs
 * @param {Object} club - Club обект от базата данни
 * @returns {String} - HTML string с meta tags
 */
const { generateHreflangTags } = require('./hreflangHelper');

function generateClubMetaHTML(club) {
    // Извличане на description
    let description = '';
    if (club.shortDescription) {
        description = typeof club.shortDescription === 'string'
            ? club.shortDescription.replace(/<[^>]*>/g, '').trim()
            : '';
    }
    description = description.substring(0, 160) || `Клуб за пенсионери ${club.name} в България. Присъединете се към нашата общност.`;

    // Image URL
    const imageUrl = club.mainImage 
        ? (club.mainImage.startsWith('http') 
            ? club.mainImage 
            : `https://pensa.club${club.mainImage}`)
        : (club.logo
            ? (club.logo.startsWith('http')
                ? club.logo
                : `https://pensa.club${club.logo}`)
            : 'https://pensa.club/images/iniciatives/iniciatives-2.jpg');

    // Author
    const author = club.name;

    // Tags/Keywords
    const baseKeywords = [
        'клуб за пенсионери',
        club.name,
        club.category,
        'Pensa Club',
        'активни пенсионери',
        'социални дейности',
        'трета възраст'
    ];

    if (club.tags && Array.isArray(club.tags)) {
        baseKeywords.push(...club.tags);
    }

    const keywords = baseKeywords.filter(Boolean).join(', ');

    // URL
    const url = `https://pensa.club/clubs/${club.slug}`;

    return `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Basic Meta Tags -->
    <title>${club.name} | Pensa Club</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${author}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${club.name}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${club.name}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    
    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${club.name}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${club.name}">
    
    <!-- Structured Data (Schema.org) - Organization -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "${club.name}",
        "description": "${description}",
        "url": "${url}",
        ${club.logo ? `"logo": "${club.logo.startsWith('http') ? club.logo : 'https://pensa.club' + club.logo}",` : ''}
        ${club.mainImage ? `"image": "${imageUrl}",` : ''}
        ${club.foundedYear ? `"foundingDate": "${club.foundedYear}-01-01",` : ''}
        "memberOf": {
            "@type": "Organization",
            "name": "Pensa Club"
        },
        ${club.rating ? `
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ${club.rating},
            "ratingCount": ${club.views || 1}
        },` : ''}
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
    <h1>${club.name}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generateClubMetaHTML;