const { generateHreflangTags } = require('./hreflangHelper');

/**
 * Генерира HTML с meta tags за каталожната страница на семинарите
 */
function generateSeminarsListMetaHTML() {
    const title = 'Семинари за дигитална грамотност | DigiBridge Academy';
    const description = 'Безплатни присъствени семинари за дигитална грамотност. Практически занятия, дискусии и работилници с квалифицирани ментори в пенсионерските клубове.';
    const imageUrl = 'https://pensa.club/images/academy/academy-seminars-og.jpg';
    const url = 'https://pensa.club/academy/seminars';
    const keywords = 'семинари, дигитална грамотност, обучение, безплатно, пенсионери, DigiBridge Academy, Pensa Club, присъствени обучения, 60+';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": url,
        "image": imageUrl,
        "isPartOf": {
            "@type": "WebSite",
            "name": "Pensa Club",
            "url": "https://pensa.club"
        },
        "provider": {
            "@type": "EducationalOrganization",
            "name": "DigiBridge Academy",
            "url": "https://pensa.club/academy"
        },
        "about": {
            "@type": "Thing",
            "name": "Семинари за дигитална грамотност"
        },
        "audience": {
            "@type": "Audience",
            "audienceType": "Възрастни хора и пенсионери"
        },
        "inLanguage": "bg"
    };

    return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${keywords}" />
  <meta name="author" content="Pensa Foundation" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:site_name" content="Pensa Club" />
  <meta property="og:locale" content="bg_BG" />
  <meta property="og:locale:alternate" content="de_DE" />
  <meta property="og:locale:alternate" content="en_US" />
  <meta property="fb:pages" content="61578204366479" />
  <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:image:alt" content="${title}" />
  <link rel="canonical" href="${url}" />
  ${generateHreflangTags('/academy/seminars')}
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  <meta http-equiv="refresh" content="0; url=${url}" />
  <script>window.location.href = "${url}";</script>
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
    <h1>Семинари за дигитална грамотност</h1>
    <div class="spinner"></div>
    <p>Зареждане...</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}" style="color: white;">кликнете тук</a>.</p>
  </div>
</body>
</html>`;
}

/**
 * Генерира HTML с Open Graph meta tags за детайл на семинар (за ботове)
 * @param {Object} seminar - Sequelize seminar обект
 * @returns {String} - HTML страница с meta tags
 */
function generateSeminarDetailMetaHTML(seminar) {
    const cleanDescription = seminar.shortDescription
        ? seminar.shortDescription.replace(/<[^>]*>/g, '').substring(0, 160)
        : seminar.description
            ? seminar.description.replace(/<[^>]*>/g, '').substring(0, 160)
            : 'Безплатен семинар в DigiBridge Academy';

    const imageUrl = seminar.thumbnailUrl
        || 'https://pensa.club/images/academy/academy-seminars-og.jpg';

    const escapeHtml = (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const title = escapeHtml(seminar.title);
    const description = escapeHtml(cleanDescription);
    const category = escapeHtml(seminar.category || 'Дигитална грамотност');
    const facilitatorName = escapeHtml(seminar.facilitator?.name || 'DigiBridge Academy');
    const keywords = [
        ...(seminar.tags || []),
        seminar.category,
        'семинар', 'DigiBridge Academy', 'дигитална грамотност', 'Pensa Club', 'безплатен семинар', 'обучение за пенсионери'
    ].filter(Boolean).map(escapeHtml).join(', ');

    // Schema.org Event
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "EducationEvent",
        "name": seminar.title,
        "description": cleanDescription,
        "url": `https://pensa.club/academy/seminars/${seminar.slug}`,
        "image": imageUrl,
        "organizer": {
            "@type": "Organization",
            "name": "DigiBridge Academy",
            "url": "https://pensa.club/academy",
            "sameAs": ["https://www.facebook.com/profile.php?id=61578204366479"]
        },
        "isAccessibleForFree": true,
        "inLanguage": ["bg", "de", "en"],
        "eventAttendanceMode": seminar.isOnline
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": seminar.status === 'cancelled'
            ? "https://schema.org/EventCancelled"
            : "https://schema.org/EventScheduled"
    };

    if (seminar.scheduledDate) {
        structuredData.startDate = seminar.scheduledDate;
    }
    if (seminar.scheduledEndDate) {
        structuredData.endDate = seminar.scheduledEndDate;
    } else if (seminar.scheduledDate && seminar.durationMinutes) {
        const end = new Date(new Date(seminar.scheduledDate).getTime() + seminar.durationMinutes * 60 * 1000);
        structuredData.endDate = end.toISOString();
    }

    if (seminar.isOnline && seminar.meetingLink) {
        structuredData.location = {
            "@type": "VirtualLocation",
            "url": seminar.meetingLink
        };
    } else if (!seminar.isOnline && seminar.location) {
        structuredData.location = {
            "@type": "Place",
            "name": seminar.location,
            "address": seminar.address || seminar.location
        };
    }

    if (seminar.facilitator?.name) {
        structuredData.performer = {
            "@type": "Person",
            "name": seminar.facilitator.name
        };
    }

    if (seminar.maxParticipants) {
        structuredData.maximumAttendeeCapacity = seminar.maxParticipants;
    }

    structuredData.offers = {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BGN",
        "availability": "https://schema.org/InStock"
    };

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
  <meta name="author" content="${facilitatorName}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="event" />
  <meta property="og:url" content="https://pensa.club/academy/seminars/${seminar.slug}" />
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
  <meta property="article:author" content="${facilitatorName}" />
  <meta property="article:section" content="${category}" />
  ${seminar.publishedAt ? `<meta property="article:published_time" content="${seminar.publishedAt}" />` : ''}
  ${seminar.updatedAt ? `<meta property="article:modified_time" content="${seminar.updatedAt}" />` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} | DigiBridge Academy" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:image:alt" content="${title}" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://pensa.club/academy/seminars/${seminar.slug}" />
  ${generateHreflangTags(`/academy/seminars/${seminar.slug}`)}

  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(structuredData)}
  </script>

  <script>
    setTimeout(() => {
      window.location.href = '/academy/seminars/${seminar.slug}';
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
    <p class="status">Зареждане на семинара...</p>
  </div>
</body>
</html>`;
}

module.exports = { generateSeminarsListMetaHTML, generateSeminarDetailMetaHTML };
