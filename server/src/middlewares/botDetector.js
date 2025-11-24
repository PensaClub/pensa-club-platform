const { article, mainImage, bot_log } = require('../sequelize/models');
const generateArticleMetaHTML = require('../utils/metaGenerator');

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
async function logBotRequest(botName, articleId, articleSlug, userAgent, ip) {
    try {
        await bot_log.create({
            bot: botName,
            articleId: articleId,
            articleSlug: articleSlug,
            userAgent: userAgent,
            ip: ip,
            timestamp: new Date()
        });
        console.log(`✅ Bot log saved: ${botName} → ${articleSlug}`);
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
        return next(); // Не е bot, продължи нормално
    }
    
    const botName = getBotName(userAgent);
    
    console.log('🤖 Bot detected:', {
        bot: botName,
        url: req.path,
        timestamp: new Date().toISOString(),
        ip: req.ip
    });

    // Проверка дали е article URL
    const articleUrlPattern = /^\/articles\/([a-zA-Z0-9-]+)$/;
    const match = req.path.match(articleUrlPattern);
    
    if (!match) {
        return next(); // Не е article URL, продължи нормално
    }
    
    const slug = match[1];
    
    try {
        // Извличане на статията от DB
        const foundArticle = await article.findOne({
            where: { slug },
            include: [
                {
                    model: mainImage,
                    as: 'mainImage',
                    attributes: ['id', 'type', 'sources', 'alt'],
                }
            ],
            attributes: ['id', 'title', 'slug', 'summary', 'author', 'publishDate', 'tags']
        });
        
        if (!foundArticle) {
            return next(); // Статията не съществува, продължи нормално
        }
        
        // ✅ ЗАПИСВА В БАЗАТА
        await logBotRequest(
            botName,
            foundArticle.id,
            foundArticle.slug,
            userAgent,
            req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        );
        
        // Генериране на HTML с meta tags
        const html = generateArticleMetaHTML(foundArticle);
        
        // Изпрати HTML към bot-а
        return res.send(html);
        
    } catch (error) {
        console.error('Error in botDetector middleware:', error);
        return next(); // При грешка, продължи нормално
    }
}

module.exports = botDetector;