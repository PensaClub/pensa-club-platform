/**
 * Генерира HTML с Open Graph meta tags за Games страницата
 * @returns {String} - HTML string с meta tags
 */
function generateGamesMetaHTML() {
    const title = 'Игри за пенсионери | Pensa Club';
    const description = 'Безплатни онлайн игри за пенсионери - шах, судоку, пасианс, табла, тетрис, маджонг и други. Тренирайте ума си докато се забавлявате!';
    const imageUrl = 'https://pensa.club/images/games/gaming-room.jpg';
    const url = 'https://pensa.club/games';
    const keywords = 'онлайн игри, игри за пенсионери, безплатни игри, шах, судоку, пасианс, табла, тетрис, маджонг, Pensa Club';

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
    <meta property="og:image:alt" content="${title}">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    <meta property="og:locale:alternate" content="de_DE">
    <meta property="og:locale:alternate" content="en_US">
    
    <!-- Facebook Meta Tags -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${title}">
    
    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "${title}",
        "description": "${description}",
        "url": "${url}",
        "image": "${imageUrl}",
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Club",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pensa.club/logo.png"
            }
        },
        "mainEntity": {
            "@type": "ItemList",
            "name": "Игри за пенсионери",
            "numberOfItems": 8,
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Шах", "url": "https://www.chess.com/club/pensa-club"},
                {"@type": "ListItem", "position": 2, "name": "Судоку", "url": "https://sudoku.bg/"},
                {"@type": "ListItem", "position": 3, "name": "Пасианс", "url": "https://pasiansigra.com/"},
                {"@type": "ListItem", "position": 4, "name": "Табла", "url": "https://belot.bg/tabla/"},
                {"@type": "ListItem", "position": 5, "name": "Тетрис", "url": "https://tetris.com/play-tetris"},
                {"@type": "ListItem", "position": 6, "name": "2048", "url": "https://play2048.co/"},
                {"@type": "ListItem", "position": 7, "name": "Шашки", "url": "https://lidraughts.org/"},
                {"@type": "ListItem", "position": 8, "name": "Маджонг", "url": "https://mahjong.bg/"}
            ]
        },
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
    <h1>${title}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generateGamesMetaHTML;