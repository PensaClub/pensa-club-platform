/**
 * Генерира HTML с Open Graph meta tags за курсове (за ботове)
 * @param {Object} course - Sequelize course обект
 * @returns {String} - HTML страница с meta tags
 */
function generateCourseMetaHTML(course) {
    const cleanDescription = course.shortDescription
        ? course.shortDescription.replace(/<[^>]*>/g, '').substring(0, 160)
        : 'Безплатен онлайн курс в DigiBridge Academy';

    const imageUrl = course.thumbnailUrl
        || 'https://pensa.club/images/digibridge/hero-image.jpg';

    const escapeHtml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const title = escapeHtml(course.name);
    const description = escapeHtml(cleanDescription);
    const category = escapeHtml(course.category || 'Дигитална грамотност');
    const keywords = [
        ...(course.tags || []),
        course.category,
        'курс', 'DigiBridge Academy', 'дигитална грамотност', 'Pensa Club', 'безплатен курс', 'обучение за пенсионери'
    ].filter(Boolean).map(escapeHtml).join(', ');

    // Schema.org Course
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.name,
        "description": cleanDescription,
        "url": `https://pensa.club/academy/courses/${course.slug}`,
        "provider": {
            "@type": "Organization",
            "name": "DigiBridge Academy",
            "url": "https://pensa.club/academy",
            "sameAs": ["https://www.facebook.com/profile.php?id=61578204366479"]
        },
        "isAccessibleForFree": true,
        "courseMode": "online",
        "inLanguage": ["bg", "de", "en"],
        "educationalLevel": course.difficultyLevel || "beginner",
        "image": imageUrl,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BGN",
            "availability": "https://schema.org/InStock"
        }
    };

    if (course.estimatedHours) {
        structuredData.timeRequired = `PT${course.estimatedHours}H`;
    }
    if (course.rating > 0) {
        structuredData.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": course.rating,
            "bestRating": 5,
            "ratingCount": course.enrolledCount || 1
        };
    }

    return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Primary Meta Tags -->
  <title>${title} | DigiBridge Academy</title>
  <meta name="title" content="${title} | DigiBridge Academy" />
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${keywords}" />
  <meta name="author" content="DigiBridge Academy" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://pensa.club/academy/courses/${course.slug}" />
  <meta property="og:title" content="${title} | DigiBridge Academy" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
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
  <meta property="article:section" content="${category}" />
  ${course.publishedAt ? `<meta property="article:published_time" content="${course.publishedAt}" />` : ''}
  ${course.updatedAt ? `<meta property="article:modified_time" content="${course.updatedAt}" />` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} | DigiBridge Academy" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:image:alt" content="${title}" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://pensa.club/academy/courses/${course.slug}" />

  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(structuredData)}
  </script>

  <script>
    setTimeout(() => {
      window.location.href = '/academy/courses/${course.slug}';
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
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
    }
    .container { text-align: center; padding: 40px; max-width: 600px; }
    .logo { font-size: 48px; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    h1 { font-size: 28px; margin: 20px 0; line-height: 1.4; }
    .description { font-size: 16px; opacity: 0.9; margin-bottom: 30px; }
    .spinner { border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .status { font-size: 14px; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎓 DigiBridge Academy</div>
    <h1>${title}</h1>
    <p class="description">${description}</p>
    <div class="spinner"></div>
    <p class="status">Зареждане на курса...</p>
  </div>
</body>
</html>`;
}

/**
 * Генерира HTML за листата с курсове (статична страница)
 * @returns {String} - HTML страница с meta tags
 */
function generateCoursesListMetaHTML() {
    const title = 'Курсове за дигитална грамотност | DigiBridge Academy';
    const description = 'Безплатни онлайн курсове за дигитална грамотност, интернет сигурност, мобилни устройства и офис приложения. DigiBridge Academy — обучение за възрастни хора 60+.';
    const imageUrl = 'https://pensa.club/images/digibridge/hero-image.jpg';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": "https://pensa.club/academy/courses",
        "isPartOf": {
            "@type": "WebSite",
            "name": "Pensa Club",
            "url": "https://pensa.club"
        },
        "provider": {
            "@type": "EducationalOrganization",
            "name": "DigiBridge Academy",
            "url": "https://pensa.club/academy"
        }
    };

    return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />
  <meta name="keywords" content="курсове, дигитална грамотност, DigiBridge Academy, Pensa Club, безплатни курсове, обучение, пенсионери, 60+" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://pensa.club/academy/courses" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Pensa Club" />
  <meta property="og:locale" content="bg_BG" />
  <meta property="fb:pages" content="61578204366479" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <link rel="canonical" href="https://pensa.club/academy/courses" />
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  <script>setTimeout(() => { window.location.href = '/academy/courses'; }, 1000);</script>
  <style>
    body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; }
    .container { text-align: center; padding: 40px; }
    .logo { font-size: 48px; font-weight: bold; margin-bottom: 20px; }
    h1 { font-size: 28px; margin: 20px 0; }
    .spinner { border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎓 DigiBridge Academy</div>
    <h1>Курсове за дигитална грамотност</h1>
    <div class="spinner"></div>
    <p>Зареждане...</p>
  </div>
</body>
</html>`;
}

module.exports = { generateCourseMetaHTML, generateCoursesListMetaHTML };
