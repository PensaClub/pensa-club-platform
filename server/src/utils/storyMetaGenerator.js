// server/src/utils/storyMetaGenerator.js

/**
 * Генерира HTML с meta tags за история (за социални ботове)
 */
function generateStoryMetaHTML(story) {
    const baseUrl = 'https://pensa.club';
    const url = `${baseUrl}/stories/${story.slug}`;
    
    // Изображение
    let imageUrl = `${baseUrl}/images/iniciatives/iniciatives-2.jpg`;
    if (story.image?.src) {
        imageUrl = story.image.src.startsWith('http') 
            ? story.image.src 
            : `${baseUrl}${story.image.src}`;
    }

    // Описание
    const cleanDescription = story.shortDescription
        ? story.shortDescription.replace(/<[^>]*>/g, '').substring(0, 200)
        : 'История от Pensa Club - Платформа за дигитална грамотност';

    // Дата
    const publishedDate = story.publishedAt 
        ? new Date(story.publishedAt).toISOString() 
        : new Date(story.createdAt).toISOString();
    
    const modifiedDate = story.updatedAt 
        ? new Date(story.updatedAt).toISOString() 
        : publishedDate;

    // Tags
    const tags = story.tags || [];
    const tagsMeta = tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n    ');

    // Категория
    const categoryMap = {
        'personal': 'Лични истории',
        'success': 'Успешни истории',
        'community': 'Общност',
        'learning': 'Обучение',
        'technology': 'Технологии',
        'other': 'Други'
    };
    const category = categoryMap[story.category] || story.category || 'Истории';

    // Schema.org structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": story.title,
        "description": cleanDescription,
        "image": imageUrl,
        "author": {
            "@type": story.author ? "Person" : "Organization",
            "name": story.author || "Pensa Club"
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
        "keywords": tags.join(', ') || "дигитална грамотност, пенсионери, истории",
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
    <title>${story.title} | Pensa Club</title>
    <meta name="description" content="${cleanDescription}">
    <meta name="keywords" content="${tags.join(', ')}, истории, Pensa Club, дигитална грамотност">
    <meta name="author" content="${story.author || 'Pensa Club'}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${story.title}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${story.title}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    <meta property="og:locale:alternate" content="de_DE">
    <meta property="og:locale:alternate" content="en_US">
    
    <!-- Article Meta -->
    <meta property="article:published_time" content="${publishedDate}">
    <meta property="article:modified_time" content="${modifiedDate}">
    <meta property="article:author" content="${story.author || 'Pensa Club'}">
    <meta property="article:section" content="${category}">
    ${tagsMeta}
    
    <!-- Facebook -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${story.title}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${story.title}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
</head>
<body>
    <h1>${story.title}</h1>
    <p>${cleanDescription}</p>
    <p>Автор: ${story.author || 'Pensa Club'}</p>
    <p>Категория: ${category}</p>
    <a href="${url}">Прочети историята</a>
</body>
</html>`;
}

module.exports = generateStoryMetaHTML;