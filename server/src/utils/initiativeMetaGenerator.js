/**
 * Генерира HTML с Open Graph meta tags за Initiatives
 * @param {Object} initiative - Initiative обект от базата данни
 * @returns {String} - HTML string с meta tags
 */
const { generateHreflangTags } = require('./hreflangHelper');

function generateInitiativeMetaHTML(initiative) {
    // Извличане на description
    let description = '';
    if (initiative.shortDescription) {
        description = typeof initiative.shortDescription === 'string'
            ? initiative.shortDescription.replace(/<[^>]*>/g, '').trim()
            : '';
    } else if (initiative.detailedDescription) {
        description = typeof initiative.detailedDescription === 'string'
            ? initiative.detailedDescription.replace(/<[^>]*>/g, '').trim()
            : '';
    }
    description = description.substring(0, 160) || 'Инициатива от Pensa Club за дигитална грамотност и социално включване на пенсионери.';

    // Image URL
    const imageUrl = initiative.mainImage?.src 
        ? (initiative.mainImage.src.startsWith('http') 
            ? initiative.mainImage.src 
            : `https://pensa.club${initiative.mainImage.src}`)
        : 'https://pensa.club/images/iniciatives/iniciatives-2.jpg';

    // Author
    const author = initiative.responsible?.name || initiative.organization?.name || 'Pensa Foundation';

    // Published/Modified Time
    const publishedTime = initiative.startDate || initiative.createdAt || '';
    const modifiedTime = initiative.endDate || initiative.updatedAt || publishedTime;

    // Tags
    const tags = Array.isArray(initiative.tags) ? initiative.tags.join(', ') : '';
    const keywords = tags 
        ? `${tags}, инициативи, Pensa Club, пенсионери, дигитална грамотност, социално включване`
        : 'инициативи, Pensa Club, пенсионери, дигитална грамотност, социално включване';

    // URL
    const url = `https://pensa.club/initiatives/${initiative.slug}`;

    // Section (Category)
    const section = initiative.category || 'Инициативи';

    // Event Status for Schema.org
    const eventStatusMap = {
        'active': 'https://schema.org/EventScheduled',
        'completed': 'https://schema.org/EventScheduled',
        'upcoming': 'https://schema.org/EventScheduled',
        'cancelled': 'https://schema.org/EventCancelled',
        'postponed': 'https://schema.org/EventPostponed'
    };
    const eventStatus = eventStatusMap[initiative.status] || 'https://schema.org/EventScheduled';

    // Location for Schema.org
    let locationJSON = '';
    if (initiative.location && initiative.location.length > 0) {
        const firstLocation = initiative.location[0];
        locationJSON = `
        "location": {
            "@type": "Place",
            "name": "${firstLocation.address || 'Различни локации'}",
            ${firstLocation.coordinates ? `
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": ${firstLocation.coordinates.lat},
                "longitude": ${firstLocation.coordinates.lng}
            },` : ''}
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "BG"
            }
        },`;
    }

    return `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Basic Meta Tags -->
    <title>${initiative.title} | Pensa Club</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${author}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${initiative.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${initiative.title}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    
    <!-- Article Meta Tags -->
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}">` : ''}
    <meta property="article:author" content="${author}">
    <meta property="article:section" content="${section}">
    ${Array.isArray(initiative.tags) && initiative.tags.length > 0 
        ? initiative.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n    ')
        : ''}
    
    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${initiative.title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${initiative.title}">
    
    <!-- Structured Data (Schema.org) - Event -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "${initiative.title}",
        "description": "${description}",
        "image": "${imageUrl}",
        "url": "${url}",
        ${initiative.startDate ? `"startDate": "${initiative.startDate}",` : ''}
        ${initiative.endDate ? `"endDate": "${initiative.endDate}",` : ''}
        "eventStatus": "${eventStatus}",
        "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
        "organizer": {
            "@type": "Organization",
            "name": "${initiative.organization?.name || 'Pensa Club'}",
            "url": "${initiative.organization?.website || 'https://pensa.club'}"
        },
        ${locationJSON}
        ${initiative.expectedBudget ? `
        "offers": {
            "@type": "Offer",
            "price": "${initiative.expectedBudget}",
            "priceCurrency": "${initiative.currency || 'BGN'}",
            "availability": "https://schema.org/InStock"
        },` : ''}
        ${initiative.category ? `"genre": "${initiative.category}",` : ''}
        ${tags ? `"keywords": "${tags}",` : ''}
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
    <h1>${initiative.title}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generateInitiativeMetaHTML;