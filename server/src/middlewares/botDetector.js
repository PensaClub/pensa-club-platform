const { article, mainImage, project, initiative, Club, mentor } = require('../sequelize/models');
const generateArticleMetaHTML = require('../utils/metaGenerator');
const generateProjectMetaHTML = require('../utils/projectMetaGenerator');
const generateInitiativeMetaHTML = require('../utils/initiativeMetaGenerator');
const generateClubMetaHTML = require('../utils/clubMetaGenerator');
const generateAcademyMetaHTML = require('../utils/academyMetaGenerator');
const generateMentorMetaHTML = require('../utils/mentorMetaGenerator');
const geoip = require('geoip-lite');

/**
 * Проверява дали User-Agent е от социална мрежа bot
 */
function isBot(userAgent) {
    if (!userAgent) return false;

    const botPatterns = [
        'facebookexternalhit',
        'Facebot',
        'Twitterbot',
        'LinkedInBot',
        'Slackbot',
        'WhatsApp',
        'TelegramBot',
        'googlebot',
        'bingbot',
        'yandex',
        'baiduspider'
    ];

    return botPatterns.some(pattern =>
        userAgent.toLowerCase().includes(pattern.toLowerCase())
    );
}

/**
 * Определя името на бота от User-Agent
 */
function getBotName(userAgent) {
    const ua = userAgent.toLowerCase();
    if (ua.includes('facebookexternalhit') || ua.includes('facebot')) return 'Facebook';
    if (ua.includes('twitterbot')) return 'Twitter';
    if (ua.includes('linkedinbot')) return 'LinkedIn';
    if (ua.includes('whatsapp')) return 'WhatsApp';
    if (ua.includes('slackbot')) return 'Slack';
    if (ua.includes('telegrambot')) return 'Telegram';
    if (ua.includes('googlebot')) return 'Google';
    if (ua.includes('bingbot')) return 'Bing';
    if (ua.includes('yandex')) return 'Yandex';
    if (ua.includes('baiduspider')) return 'Baidu';
    return 'Unknown Bot';
}

/**
 * Записва bot request в базата данни
 */
async function logBotRequest(botName, contentType, contentId, contentSlug, userAgent, ip) {
    try {
        // 🌍 GeoIP Lookup
        const geo = geoip.lookup(ip);
        
        // Debug log
        console.log(`🔍 IP: ${ip}, Geo:`, geo ? `${geo.country} (${geo.city || 'N/A'})` : 'NULL');
        
        const country = geo ? geo.country : null;
        const city = geo ? geo.city : null;
        const region = geo ? geo.region : null;

        const logData = {
            bot: botName,
            contentType: contentType,
            userAgent: userAgent,
            ip: ip,
            country: country,    // ✅ ISO код (BG, US, DE) или NULL
            city: city,          // ✅ Град или NULL
            region: region,      // ✅ Регион или NULL
            timestamp: new Date()
        };

        // Добави contentId полетата само ако не са null
        if (contentType === 'article' && contentId) logData.articleId = contentId;
        if (contentType === 'article' && contentSlug) logData.articleSlug = contentSlug;
        
        if (contentType === 'project' && contentId) logData.projectId = contentId;
        if (contentType === 'project' && contentSlug) logData.projectSlug = contentSlug;
        
        if (contentType === 'initiative' && contentId) logData.initiativeId = contentId;
        if (contentType === 'initiative' && contentSlug) logData.initiativeSlug = contentSlug;
        
        if (contentType === 'club' && contentId) logData.clubId = contentId;
        if (contentType === 'club' && contentSlug) logData.clubSlug = contentSlug;
        
        if (contentType === 'mentor' && contentId) logData.mentorId = contentId;
        if (contentType === 'mentor' && contentSlug) logData.mentorSlug = contentSlug;
        
        if (contentType === 'page' && contentSlug) logData.pageSlug = contentSlug;

        await bot_log.create(logData);
        
        const geoInfo = country ? `${country} (${city || 'Unknown'})` : 'Unknown Location';
        console.log(`✅ Bot log saved: ${botName} → ${contentType}/${contentSlug || contentId} | ${geoInfo}`);
    } catch (error) {
        console.error('❌ Error saving bot log:', error);
    }
}

/**
 * Middleware за детекция на bots и генериране на meta tags
 */
async function botDetector(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';

    // Проверка дали е bot
    if (!isBot(userAgent)) {
        return next();
    }

    const botName = getBotName(userAgent);

    console.log('🤖 Bot detected:', {
        bot: botName,
        url: req.path,
        timestamp: new Date().toISOString(),
        ip: req.ip
    });

    // URL Pattern Matching
    const homeMatch = req.path === '/';
    const articleMatch = req.path.match(/^\/articles\/([a-zA-Z0-9-]+)$/);
    const projectMatch = req.path.match(/^\/projects\/([a-zA-Z0-9-]+)$/);
    const initiativeMatch = req.path.match(/^\/initiatives\/([a-zA-Z0-9-]+)$/);
    const clubMatch = req.path.match(/^\/clubs\/([a-zA-Z0-9-]+)$/);
    const academyMatch = req.path.match(/^\/academy$/);
    const mentorMatch = req.path.match(/^\/academy\/mentors\/(\d+)$/);

    try {
        // ==================== HOME PAGE ====================
        if (homeMatch) {
            console.log('🏠 Processing HOME page');

            await logBotRequest(
                botName,
                'page',
                null,
                'home',
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );

            const html = `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pensa Club - Платформа за Активен Живот 60+</title>
    <meta name="description" content="Pensa Club е платформа за активен живот, която свързва хора над 60 години с възможности за образование, социални контакти и активен живот." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://pensa.club/" />
    <meta property="og:title" content="Pensa Club - Платформа за Активен Живот 60+" />
    <meta property="og:description" content="Свържете се с общност от активни хора 60+. Открийте клубове, събития, обучения и още." />
    <meta property="og:image" content="https://pensa.club/images/homePage/logo-2.png" />
    <meta property="og:site_name" content="Pensa Club" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Pensa Club - Платформа за Активен Живот 60+" />
    <meta name="twitter:description" content="Свържете се с общност от активни хора 60+. Открийте клубове, събития, обучения и още." />
    <meta name="twitter:image" content="https://pensa.club/images/homePage/logo-2.png" />
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Pensa Club",
        "url": "https://pensa.club",
        "description": "Платформа за активен живот 60+",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://pensa.club/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
    </script>
    <script>setTimeout(function(){window.location.href = "/";}, 100);</script>
</head>
<body>
    <h1>Pensa Club - Платформа за Активен Живот 60+</h1>
    <p>Зареждане...</p>
</body>
</html>`;
            
            console.log('📤 Sending home HTML to bot');
            return res.send(html);
        }

        // ==================== ARTICLE ====================
        if (articleMatch) {
            const slug = articleMatch[1];
            console.log('📄 Processing ARTICLE:', slug);

            const foundArticle = await article.findOne({
                where: { slug },
                include: [
                    {
                        model: mainImage,
                        as: 'mainImage',
                        attributes: ['id', 'type', 'sources', 'alt'],
                    }
                ],
                attributes: ['id', 'title', 'slug', 'summary', 'author', 'publishDate', 'updatedAt', 'tags']
            });

            if (!foundArticle) {
                console.log('❌ Article not found:', slug);
                return next();
            }

            console.log('✅ Article found:', foundArticle.title);

            await logBotRequest(
                botName,
                'article',
                foundArticle.id,
                foundArticle.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );

            const html = generateArticleMetaHTML(foundArticle);
            console.log('📤 Sending article HTML to bot');
            return res.send(html);
        }

        // ==================== PROJECT ====================
        if (projectMatch) {
            const slug = projectMatch[1];
            console.log('📁 Processing PROJECT:', slug);

            const foundProject = await project.findOne({
                where: { slug },
                include: [
                    {
                        model: mainImage,
                        as: 'mainImage',
                        attributes: ['id', 'type', 'src', 'alt'],
                    }
                ],
                attributes: [
                    'id', 'title', 'slug', 'shortDescription', 'fullDescription',
                    'category', 'tags', 'status', 'timeline', 'budget',
                    'contact', 'location', 'createdAt', 'updatedAt'
                ]
            });

            if (!foundProject) {
                console.log('❌ Project not found:', slug);
                return next();
            }

            console.log('✅ Project found:', foundProject.title);

            await logBotRequest(
                botName,
                'project',
                foundProject.id,
                foundProject.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );

            const html = generateProjectMetaHTML(foundProject);
            console.log('📤 Sending project HTML to bot');
            return res.send(html);
        }

        // ==================== INITIATIVE ====================
        if (initiativeMatch) {
            const slug = initiativeMatch[1];
            console.log('🎯 Processing INITIATIVE:', slug);

            const foundInitiative = await initiative.findOne({
                where: { slug },
                include: [
                    {
                        model: mainImage,
                        as: 'mainImage',
                        attributes: ['id', 'type', 'src', 'alt'],
                    }
                ],
                attributes: [
                    'id', 'title', 'slug', 'shortDescription', 'detailedDescription',
                    'category', 'tags', 'status', 'startDate', 'endDate',
                    'location', 'expectedBudget', 'currency', 'organization',
                    'responsible', 'createdAt', 'updatedAt'
                ]
            });

            if (!foundInitiative) {
                console.log('❌ Initiative not found:', slug);
                return next();
            }

            console.log('✅ Initiative found:', foundInitiative.title);

            await logBotRequest(
                botName,
                'initiative',
                foundInitiative.id,
                foundInitiative.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );

            const html = generateInitiativeMetaHTML(foundInitiative);
            console.log('📤 Sending initiative HTML to bot');
            return res.send(html);
        }

        // ==================== CLUB ====================
        if (clubMatch) {
            const slug = clubMatch[1];
            console.log('🏛️ Processing CLUB:', slug);

            const foundClub = await Club.findOne({
                where: { slug },
                attributes: [
                    'id', 'name', 'slug', 'shortDescription',
                    'category', 'logo', 'mainImage',
                    'foundedYear', 'createdAt', 'updatedAt'
                ]
            });

            if (!foundClub) {
                console.log('❌ Club not found:', slug);
                return next();
            }

            console.log('✅ Club found:', foundClub.name);

            await logBotRequest(
                botName,
                'club',
                foundClub.id,
                foundClub.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );

            const html = generateClubMetaHTML(foundClub);
            console.log('📤 Sending club HTML to bot');
            return res.send(html);
        }

        // ==================== ACADEMY (СТАТИЧНА СТРАНИЦА) ====================
        if (academyMatch) {
            console.log('🎓 Processing ACADEMY page');

            await logBotRequest(
                botName,
                'page',
                null,
                'academy',
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );

            const html = generateAcademyMetaHTML();
            console.log('📤 Sending academy HTML to bot');
            return res.send(html);
        }

        // ==================== MENTOR ====================
        if (mentorMatch) {
            const mentorId = parseInt(mentorMatch[1], 10);
            console.log('👨‍🏫 Processing MENTOR:', mentorId);

            const foundMentor = await mentor.findOne({
                where: { id: mentorId, status: 'active' },
                attributes: [
                    'id', 'name', 'email', 'photoUrl', 'specialization',
                    'experience', 'education', 'motivation', 'languages',
                    'rating', 'reviewsCount', 'studentsCount', 'isOnline'
                ]
            });

            if (!foundMentor) {
                console.log('❌ Mentor not found:', mentorId);
                return next();
            }

            console.log('✅ Mentor found:', foundMentor.name);

            await logBotRequest(
                botName,
                'mentor',
                foundMentor.id,
                null,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );

            const html = generateMentorMetaHTML(foundMentor);
            console.log('📤 Sending mentor HTML to bot');
            return res.send(html);
        }

        // Ако не е нито един от горните типове
        console.log('⚠️ No pattern matched for bot request:', req.path);
        return next();

    } catch (error) {
        console.error('💥 Error in botDetector middleware:', error);
        return next();
    }
}

module.exports = botDetector;