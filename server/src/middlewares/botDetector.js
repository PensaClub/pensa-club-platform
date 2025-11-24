const { article, mainImage, project, initiative, Club, mentor } = require('../sequelize/models');
const generateArticleMetaHTML = require('../utils/metaGenerator');
const generateProjectMetaHTML = require('../utils/projectMetaGenerator');
const generateInitiativeMetaHTML = require('../utils/initiativeMetaGenerator');
const generateClubMetaHTML = require('../utils/clubMetaGenerator');
const generateAcademyMetaHTML = require('../utils/academyMetaGenerator');
const generateMentorMetaHTML = require('../utils/mentorMetaGenerator');

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
        const { bot_log } = require('../sequelize/models');
        
        const logData = {
            bot: botName,
            contentType: contentType, // 'article', 'project', 'initiative', 'club', 'page', 'mentor'
            userAgent: userAgent,
            ip: ip,
            timestamp: new Date()
        };

        // Добавяме специфичните полета според типа
        if (contentType === 'article') {
            logData.articleId = contentId;
            logData.articleSlug = contentSlug;
        } else if (contentType === 'project') {
            logData.projectId = contentId;
            logData.projectSlug = contentSlug;
        } else if (contentType === 'initiative') {
            logData.initiativeId = contentId;
            logData.initiativeSlug = contentSlug;
        } else if (contentType === 'club') {
            logData.clubId = contentId;
            logData.clubSlug = contentSlug;
        } else if (contentType === 'page') {
            logData.pageSlug = contentSlug;
        } else if (contentType === 'mentor') {
            logData.mentorId = contentId;
        }

        await bot_log.create(logData);
        console.log(`✅ Bot log saved: ${botName} → ${contentType}/${contentSlug || contentId}`);
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

    // URL Pattern Matching
    const articleMatch = req.path.match(/^\/articles\/([a-zA-Z0-9-]+)$/);
    const projectMatch = req.path.match(/^\/projects\/([a-zA-Z0-9-]+)$/);
    const initiativeMatch = req.path.match(/^\/initiatives\/([a-zA-Z0-9-]+)$/);
    const clubMatch = req.path.match(/^\/clubs\/([a-zA-Z0-9-]+)$/);
    const academyMatch = req.path.match(/^\/academy$/);
    const mentorMatch = req.path.match(/^\/academy\/mentors\/(\d+)$/);
    
    try {
        // ==================== ARTICLE ====================
        if (articleMatch) {
            const slug = articleMatch[1];
            
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
                return next();
            }
            
            await logBotRequest(
                botName,
                'article',
                foundArticle.id,
                foundArticle.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );
            
            const html = generateArticleMetaHTML(foundArticle);
            return res.send(html);
        }
        
        // ==================== PROJECT ====================
        if (projectMatch) {
            const slug = projectMatch[1];
            
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
                return next();
            }
            
            await logBotRequest(
                botName,
                'project',
                foundProject.id,
                foundProject.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );
            
            const html = generateProjectMetaHTML(foundProject);
            return res.send(html);
        }
        
        // ==================== INITIATIVE ====================
        if (initiativeMatch) {
            const slug = initiativeMatch[1];
            
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
                return next();
            }
            
            await logBotRequest(
                botName,
                'initiative',
                foundInitiative.id,
                foundInitiative.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );
            
            const html = generateInitiativeMetaHTML(foundInitiative);
            return res.send(html);
        }
        
        // ==================== CLUB ====================
        if (clubMatch) {
            const slug = clubMatch[1];
            
            const foundClub = await Club.findOne({
                where: { slug },
                attributes: [
                    'id', 'name', 'slug', 'shortDescription', 'fullDescription',
                    'category', 'location', 'contacts', 'mainImage', 'logo',
                    'foundedYear', 'metadata', 'createdAt', 'updatedAt'
                ]
            });
            
            if (!foundClub) {
                return next();
            }
            
            await logBotRequest(
                botName,
                'club',
                foundClub.id,
                foundClub.slug,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );
            
            const html = generateClubMetaHTML(foundClub);
            return res.send(html);
        }
        
        // ==================== ACADEMY (СТАТИЧНА СТРАНИЦА) ====================
        if (academyMatch) {
            await logBotRequest(
                botName,
                'page',
                null,
                'academy',
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );
            
            const html = generateAcademyMetaHTML();
            return res.send(html);
        }
        
        // ==================== MENTOR ====================
        if (mentorMatch) {
            const mentorId = parseInt(mentorMatch[1], 10);
            
            const foundMentor = await mentor.findOne({
                where: { id: mentorId, status: 'active' },
                attributes: [
                    'id', 'name', 'email', 'photoUrl', 'specialization',
                    'experience', 'education', 'motivation', 'languages',
                    'rating', 'reviewsCount', 'studentsCount', 'isOnline'
                ]
            });
            
            if (!foundMentor) {
                return next();
            }
            
            await logBotRequest(
                botName,
                'mentor',
                foundMentor.id,
                null,
                userAgent,
                req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
            );
            
            const html = generateMentorMetaHTML(foundMentor);
            return res.send(html);
        }
        
        // Ако не е нито един от горните типове
        return next();
        
    } catch (error) {
        console.error('Error in botDetector middleware:', error);
        return next(); 
    }
}

module.exports = botDetector;