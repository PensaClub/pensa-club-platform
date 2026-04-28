const { generateHreflangTags } = require('./hreflangHelper');

/**
 * Generates the SSR meta HTML returned to bots when they request the home
 * page. The content mirrors client/index.html so social previews and search
 * engine snippets stay in sync with the React SPA.
 */
function generateHomeMetaHTML() {
    const title = 'Pensa Club - Платформа за пенсионери в дигиталния свят | DigiBridge Academy';
    const ogTitle = 'Pensa Club - Общност за пенсионери в дигиталния свят';
    const description = 'Pensa Club е дигитална платформа за активни пенсионери в България. Общност, статии, карта на 150+ клуба в 40+ града, ментори и вградената DigiBridge Academy — безплатни курсове за дигитална грамотност 60+.';
    const ogDescription = 'Pensa Club обединява пенсионерска общност, статии, карта на 150+ клуба в цяла България и ментори. Вградената DigiBridge Academy предлага безплатни онлайн курсове за дигитална грамотност, интернет сигурност и електронни услуги.';
    const twitterDescription = 'Платформа за активни пенсионери — общност, 150+ клуба, ментори и DigiBridge Academy с безплатни курсове за дигитална грамотност 60+.';
    const keywords = 'Pensa Club, пенсионери, пенсионерски клубове, пенса, клуб на пенсионера, DigiBridge Academy, безплатни курсове за възрастни, ментори, дигитална грамотност за пенсионери, дигитална сигурност, ментори за пенсионери, PensaMap, карта на пенсионерски клубове, онлайн обучение 60+, интернет безопасност за възрастни, електронна комуникация, избягване интернет измами, активен живот в третата възраст, технологии за възрастни, обществена интеграция, доброволчество, общност 60+, дигитално образование, медийна грамотност, курсове за пенсионери, онлайн помощ, чат за възрастни, игри за пенсионери, форум, статии за здраве, проекти за възрастни, обяви за дарения, туризъм 60+, услуги за пенсионери';
    const imageUrl = 'https://pensa.club/images/home/hero-img.jpg';
    const url = 'https://pensa.club/';

    return `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Basic Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Pensa Foundation">
    <meta name="publisher" content="Pensa Foundation">
    <meta http-equiv="content-language" content="bg">
    <meta name="language" content="Bulgarian">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <meta name="revisit-after" content="3 days">
    <meta name="geo.region" content="BG">
    <meta name="geo.placename" content="България">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Pensa Club - Платформа за дигитално образование на пенсионери">
    <meta property="og:site_name" content="Pensa Club">
    <meta property="og:locale" content="bg_BG">
    <meta property="og:locale:alternate" content="de_DE">
    <meta property="og:locale:alternate" content="en_US">

    <!-- Facebook -->
    <meta property="fb:pages" content="61578204366479">
    <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61578204366479">
    <meta property="og:see_also" content="https://www.facebook.com/profile.php?id=61578204366479">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="Pensa Club - Платформа за пенсионери в дигиталния свят">
    <meta name="twitter:description" content="${twitterDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="Pensa Club платформа">

    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    ${generateHreflangTags('/')}

    <!-- Structured Data - Organization -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Pensa Club",
        "alternateName": "Pensa Foundation",
        "url": "${url}",
        "logo": "https://pensa.club/logo.png",
        "description": "Pensa Club е дигитална платформа за активни пенсионери в България — общност, статии, ментори, карта на клубове и вградена образователна академия DigiBridge.",
        "foundingDate": "2023",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BG",
            "addressLocality": "България"
        },
        "sameAs": [
            "https://www.facebook.com/profile.php?id=61578204366479"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "availableLanguage": ["Bulgarian", "German", "English"]
        }
    }
    </script>

    <!-- Structured Data - WebSite -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Pensa Club",
        "url": "${url}",
        "description": "Pensa Club — платформа за пенсионери с общност, карта на 150+ клуба, ментори и DigiBridge Academy за безплатно дигитално обучение 60+.",
        "inLanguage": ["bg", "de", "en"],
        "publisher": {
            "@type": "Organization",
            "name": "Pensa Foundation",
            "sameAs": "https://www.facebook.com/profile.php?id=61578204366479"
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://pensa.club/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
    </script>

    <!-- Structured Data - EducationalOrganization -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "DigiBridge Academy",
        "url": "https://pensa.club/academy",
        "description": "DigiBridge Academy е вградената образователна секция на Pensa Club — безплатни онлайн курсове за дигитална грамотност, интернет сигурност и електронни услуги за възрастни хора, финансирани от EU Civic Innovation Fund.",
        "parentOrganization": {
            "@type": "Organization",
            "name": "Pensa Club"
        },
        "areaServed": ["BG", "DE"],
        "audience": {
            "@type": "PeopleAudience",
            "suggestedMinAge": 60
        },
        "educationalCredentialAwarded": "Сертификат за дигитална грамотност",
        "courseMode": "online",
        "financialAid": "Безплатни курсове финансирани от EU Civic Innovation Fund"
    }
    </script>

    <!-- Structured Data - Community -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CommunityHealth",
        "name": "Pensa Club Community",
        "description": "Растяща общност от активни членове в над 150 пенсионерски клуба в над 40 града на България",
        "url": "https://pensa.club/clubs",
        "memberOf": {
            "@type": "Organization",
            "name": "Pensa Club"
        },
        "location": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "BG"
            }
        }
    }
    </script>

    <!-- Structured Data - Course (DigiBridge Academy) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Дигитална грамотност за възрастни",
        "description": "Безплатен курс за основи на дигиталната грамотност, интернет сигурност, избягване на онлайн измами и електронно плащане",
        "provider": {
            "@type": "Organization",
            "name": "DigiBridge Academy",
            "url": "https://pensa.club/academy"
        },
        "url": "https://pensa.club/academy",
        "inLanguage": ["bg", "de", "en"],
        "courseMode": "online",
        "isAccessibleForFree": true,
        "educationalLevel": "Beginner",
        "audience": {
            "@type": "EducationalAudience",
            "audienceType": "Възрастни хора 60+",
            "educationalRole": "learner"
        },
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "instructor": {
                "@type": "Person",
                "name": "Доброволни ментори"
            }
        }
    }
    </script>

    <!-- Structured Data - ItemList (Main Pages) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Статии",
                "url": "https://pensa.club/articles",
                "description": "Полезни статии за здраве, култура и активен живот"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Проекти",
                "url": "https://pensa.club/projects",
                "description": "Иновативни проекти за дигитална грамотност"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "DigiBridge Academy",
                "url": "https://pensa.club/academy",
                "description": "Безплатни курсове за дигитална грамотност"
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": "Клубове",
                "url": "https://pensa.club/clubs",
                "description": "Национална карта на пенсионерски клубове в България"
            }
        ]
    }
    </script>

    <!-- Redirect to React App -->
    <meta http-equiv="refresh" content="0; url=${url}">
    <script>window.location.href = "${url}";</script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <p>Ако не бъдете пренасочени автоматично, <a href="${url}">кликнете тук</a>.</p>
</body>
</html>
    `.trim();
}

module.exports = generateHomeMetaHTML;
