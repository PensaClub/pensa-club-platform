/**
 * Генерира HTML с Open Graph meta tags за Projects
 * @param {Object} project - Project обект от базата данни
 * @returns {String} - HTML string с meta tags
 */
// server/src/utils/projectMetaGenerator.js
function generateProjectMetaHTML(project) {
    // Извличане на description
    let description = '';
    if (project.shortDescription) {
        description = typeof project.shortDescription === 'string'
            ? project.shortDescription.replace(/<[^>]*>/g, '').trim()
            : '';
    } else if (project.fullDescription) {
        description = typeof project.fullDescription === 'string'
            ? project.fullDescription.replace(/<[^>]*>/g, '').trim()
            : '';
    }
    description = description.substring(0, 160) || 'Проект от Pensa Club за пенсионери в България';

    // Image URL
    const imageUrl = project.mainImage?.src 
        ? (project.mainImage.src.startsWith('http') 
            ? project.mainImage.src 
            : `https://pensa.club${project.mainImage.src}`)
        : 'https://pensa.club/images/iniciatives/iniciatives-2.jpg';

    // Author
    const author = project.contact?.name || 'Pensa Foundation';

    // Published/Modified Time
    const publishedTime = project.timeline?.startDate || project.createdAt || '';
    const modifiedTime = project.timeline?.endDate || project.updatedAt || publishedTime;

    // Tags
    const tags = Array.isArray(project.tags) ? project.tags.join(', ') : '';
    const keywords = tags 
        ? `${tags}, проекти, Pensa Club, пенсионери, дигитална грамотност`
        : 'проекти, Pensa Club, пенсионери, дигитална грамотност';

    // URL
    const url = `https://pensa.club/projects/${project.slug}`;

    // Section (Category)
    const section = project.category || 'Проекти';

    return `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Basic Meta Tags -->
    <title>${project.title} | Pensa Club</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${author}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${project.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${project.title}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    
    <!-- Article Meta Tags -->
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}">` : ''}
    <meta property="article:author" content="${author}">
    <meta property="article:section" content="${section}">
    ${Array.isArray(project.tags) && project.tags.length > 0 
        ? project.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n    ')
        : ''}
    
    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${project.title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${project.title}">
    
    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": "${project.title}",
        "description": "${description}",
        "image": "${imageUrl}",
        "url": "${url}",
        "author": {
            "@type": "${project.contact?.name ? 'Person' : 'Organization'}",
            "name": "${author}"
        },
        "creator": {
            "@type": "Organization",
            "name": "Pensa Club",
            "url": "https://pensa.club"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Foundation",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pensa.club/logo.png"
            }
        },
        ${publishedTime ? `"datePublished": "${publishedTime}",` : ''}
        ${modifiedTime ? `"dateModified": "${modifiedTime}",` : ''}
        ${project.category ? `"genre": "${project.category}",` : ''}
        ${tags ? `"keywords": "${tags}",` : ''}
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
    <h1>${project.title}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generateProjectMetaHTML;