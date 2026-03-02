/**
 * Генерира HTML с правилни Open Graph meta tags за социални мрежи
 * @param {Object} article - Sequelize article обект
 * @returns {String} - HTML страница с meta tags
 */
const { generateHreflangTags } = require('./hreflangHelper');

function generateArticleMetaHTML(article) {
    // Почистване на HTML tags от summary
    const cleanSummary = article.summary
        ? article.summary.replace(/<[^>]*>/g, '').substring(0, 160)
        : 'Прочети статията в Pensa Club';
    
    // Извличане на главна снимка
    const mainImageUrl = article.mainImage?.sources?.[0] 
        || 'https://pensa.club/images/iniciatives/iniciatives-2.jpg';
    
    // Escape специални символи за HTML
    const escapeHtml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    
    const title = escapeHtml(article.title);
    const description = escapeHtml(cleanSummary);
    const author = escapeHtml(article.author || 'Pensa Club');
    
    return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- Primary Meta Tags -->
  <title>${title} | Pensa Club</title>
  <meta name="title" content="${title} | Pensa Club" />
  <meta name="description" content="${description}" />
  <meta name="author" content="${author}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://pensa.club/articles/${article.slug}" />
  <meta property="og:title" content="${title} | Pensa Club" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${mainImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:site_name" content="Pensa Club" />
  <meta property="og:locale" content="bg_BG" />
  <meta property="og:locale:alternate" content="de_DE" />
  <meta property="og:locale:alternate" content="en_US" />
  
  <!-- Facebook Page -->
  <meta property="fb:pages" content="61578204366479" />
  <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479" />
  <meta property="article:author" content="${author}" />
  ${article.publishDate ? `<meta property="article:published_time" content="${article.publishDate}" />` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} | Pensa Club" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${mainImageUrl}" />
  <meta name="twitter:image:alt" content="${title}" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://pensa.club/articles/${article.slug}" />
  ${generateHreflangTags(`/articles/${article.slug}`)}
  
  <!-- Auto-redirect след 1 секунда (само за обикновени браузъри) -->
  <script>
    // Проверка дали е bot (bots не изпълняват JavaScript)
    setTimeout(() => {
      window.location.href = '/articles/${article.slug}';
    }, 1000);
  </script>
  
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      max-width: 600px;
    }
    .logo {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    h1 {
      font-size: 28px;
      margin: 20px 0;
      line-height: 1.4;
    }
    .description {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .status {
      font-size: 14px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">📚 Pensa Club</div>
    <h1>${title}</h1>
    <p class="description">${description}</p>
    <div class="spinner"></div>
    <p class="status">Зареждане на статията...</p>
  </div>
</body>
</html>`;
}

module.exports = generateArticleMetaHTML;