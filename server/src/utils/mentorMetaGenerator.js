/**
 * Генерира HTML с Open Graph meta tags за Mentor профил
 * @param {Object} mentor - Mentor обект от базата данни
 * @returns {String} - HTML string с meta tags
 */
function generateMentorMetaHTML(mentor) {
    const title = `${mentor.name} - Ментор по ${mentor.specialization || 'дигитална грамотност'} | DigiBridge Academy`;
    
    let description = `Запознайте се с ${mentor.name}, ментор в DigiBridge Academy.`;
    if (mentor.specialization) {
        description += ` Специализация: ${mentor.specialization}.`;
    }
    if (mentor.experience) {
        const expText = typeof mentor.experience === 'string' 
            ? mentor.experience.replace(/<[^>]*>/g, '').substring(0, 100)
            : '';
        if (expText) {
            description += ` ${expText}`;
        }
    }
    description = description.substring(0, 160);

    const keywords = [
        'ментор',
        mentor.name,
        mentor.specialization,
        'дигитална грамотност',
        'DigiBridge Academy',
        'обучение',
        'пенсионери'
    ].filter(Boolean).join(', ');

    const url = `https://pensa.club/academy/mentors/${mentor.id}`;
    const imageUrl = mentor.photoUrl 
        ? (mentor.photoUrl.startsWith('http') 
            ? mentor.photoUrl 
            : `https://pensa.club${mentor.photoUrl}`)
        : 'https://pensa.club/images/default-mentor.png';

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
    <meta name="author" content="${mentor.name}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="profile">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${mentor.name}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    <meta property="profile:first_name" content="${mentor.name.split(' ')[0]}">
    <meta property="profile:last_name" content="${mentor.name.split(' ').slice(1).join(' ')}">
    
    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${mentor.name}">
    
    <!-- Structured Data (Schema.org) - Person -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "${mentor.name}",
        "description": "${description}",
        "image": "${imageUrl}",
        "url": "${url}",
        "jobTitle": "Ментор по дигитална грамотност",
        "worksFor": {
            "@type": "EducationalOrganization",
            "name": "DigiBridge Academy",
            "url": "https://pensa.club/academy"
        },
        ${mentor.specialization ? `"knowsAbout": "${mentor.specialization}",` : ''}
        ${mentor.email ? `"email": "${mentor.email}",` : ''}
        ${mentor.rating ? `
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ${mentor.rating},
            "ratingCount": ${mentor.reviewsCount || 1}
        },` : ''}
        "inLanguage": "bg"
    }
    </script>
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    
    <!-- Redirect to React App -->
    <meta http-equiv="refresh" content="0; url=${url}">
    <script>
        window.location.href = "${url}";
    </script>
</head>
<body>
    <h1>${mentor.name}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generateMentorMetaHTML;