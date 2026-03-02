const { generateHreflangTags } = require('./hreflangHelper');

// server/src/utils/publicationMetaGenerator.js

/**
 * Генерира HTML с meta tags за публикация (за социални ботове)
 */
function generatePublicationMetaHTML(publication) {
    const baseUrl = 'https://pensa.club';
    const url = `${baseUrl}/publications/${publication.slug}`;
    
    // Изображение
    let imageUrl = `${baseUrl}/images/iniciatives/iniciatives-2.jpg`;
    if (publication.image?.src) {
        imageUrl = publication.image.src.startsWith('http') 
            ? publication.image.src 
            : `${baseUrl}${publication.image.src}`;
    }

    // Описание
    const cleanDescription = publication.shortDescription
        ? publication.shortDescription.replace(/<[^>]*>/g, '').substring(0, 200)
        : 'Публикация от Pensa Club - Платформа за дигитална грамотност';

    // Дата
    const publishedDate = publication.publishedAt 
        ? new Date(publication.publishedAt).toISOString() 
        : new Date(publication.createdAt).toISOString();
    
    const modifiedDate = publication.updatedAt 
        ? new Date(publication.updatedAt).toISOString() 
        : publishedDate;

    // Tags
    const tags = publication.tags || [];
    const tagsMeta = tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n    ');

    // Категория
    const categoryMap = {
        'guides': 'Ръководства',
        'research': 'Изследвания',
        'reports': 'Доклади',
        'tutorials': 'Уроци',
        'news': 'Новини',
        'other': 'Други'
    };
    const category = categoryMap[publication.category] || publication.category || 'Публикации';

    // Schema.org structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": publication.title,
        "description": cleanDescription,
        "image": imageUrl,
        "author": {
            "@type": publication.author ? "Person" : "Organization",
            "name": publication.author || "Pensa Club"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Club",
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
            }
        },
        "datePublished": publishedDate,
        "dateModified": modifiedDate,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        },
        "keywords": tags.join(', ') || "дигитална грамотност, пенсионери",
        "articleSection": category,
        "inLanguage": "bg",
        "url": url
    };

    return `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Basic Meta Tags -->
    <title>${publication.title} | Pensa Club</title>
    <meta name="description" content="${cleanDescription}">
    <meta name="keywords" content="${tags.join(', ')}, публикации, Pensa Club, дигитална грамотност">
    <meta name="author" content="${publication.author || 'Pensa Club'}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    ${generateHreflangTags(url.replace('https://pensa.club', ''))}
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${publication.title}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${publication.title}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    <meta property="og:locale:alternate" content="de_DE">
    <meta property="og:locale:alternate" content="en_US">
    
    <!-- Article Meta -->
    <meta property="article:published_time" content="${publishedDate}">
    <meta property="article:modified_time" content="${modifiedDate}">
    <meta property="article:author" content="${publication.author || 'Pensa Club'}">
    <meta property="article:section" content="${category}">
    ${tagsMeta}
    
    <!-- Facebook -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${publication.title}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${publication.title}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
</head>
<body>
    <h1>${publication.title}</h1>
    <p>${cleanDescription}</p>
    <p>Автор: ${publication.author || 'Pensa Club'}</p>
    <p>Категория: ${category}</p>
    <a href="${url}">Прочети публикацията</a>
</body>
</html>`;
}

module.exports = generatePublicationMetaHTML;