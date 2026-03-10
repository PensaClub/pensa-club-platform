// server/src/middleware/botDetector.js

const { article, mainImage, project, initiative, Club, mentor, image, publication, story, course, lecture, fact_check_module } = require('../sequelize/models');
const generateArticleMetaHTML = require('../utils/metaGenerator');
const generateProjectMetaHTML = require('../utils/projectMetaGenerator');
const generateInitiativeMetaHTML = require('../utils/initiativeMetaGenerator');
const generateClubMetaHTML = require('../utils/clubMetaGenerator');
const generateAcademyMetaHTML = require('../utils/academyMetaGenerator');
const generateMentorMetaHTML = require('../utils/mentorMetaGenerator');
const generateGamesMetaHTML = require('../utils/gamesMetaGenerator');
const generatePublicationMetaHTML = require('../utils/publicationMetaGenerator');
const generateStoryMetaHTML = require('../utils/storyMetaGenerator');
const { generateCourseMetaHTML, generateCoursesListMetaHTML } = require('../utils/courseMetaGenerator');
const { generateLectureMetaHTML, generateLecturesListMetaHTML } = require('../utils/lectureMetaGenerator');
const generateUsefulLinksMetaHTML = require('../utils/usefulLinksMetaGenerator');
const generateTelkMetaHTML = require('../utils/telkMetaGenerator');
const generateArticlesListMetaHTML = require('../utils/articlesListMetaGenerator');
const { generateFactCheckListMetaHTML, generateFactCheckDetailMetaHTML } = require('../utils/factCheckMetaGenerator');
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
 * Извлича IP адреса от request
 */
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    return req.headers['x-real-ip'] || 
           req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           null;
}

/**
 * Записва bot request в базата данни
 */
async function logBotRequest(botName, contentType, contentId, contentSlug, userAgent, ip) {
    try {
        const { bot_log } = require('../sequelize/models');

        let country = null;
        let city = null;
        let region = null;

        if (ip) {
            const cleanIP = ip.replace(/^::ffff:/, '');
            const geo = geoip.lookup(cleanIP);
            
            if (geo) {
                country = geo.country || null;
                city = geo.city || null;
                region = geo.region || null;
                console.log(`🌍 GeoIP: ${cleanIP} → ${country}, ${city}, ${region}`);
            } else {
                console.log(`🌍 GeoIP: No data for ${cleanIP}`);
            }
        }

        const logData = {
            bot: botName,
            contentType: contentType,
            userAgent: userAgent,
            ip: ip,
            country: country,   
            city: city,         
            region: region,     
            timestamp: new Date()
        };

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
        } else if (contentType === 'publication') {
            logData.publicationId = contentId;
            logData.publicationSlug = contentSlug;
        } else if (contentType === 'story') {
            logData.storyId = contentId;
            logData.storySlug = contentSlug;
        }

        await bot_log.create(logData);
        console.log(`✅ Bot log saved: ${botName} → ${contentType}/${contentSlug || contentId} [${country || 'Unknown'}]`);
    } catch (error) {
        console.error('❌ Error saving bot log:', error);
    }
}

/**
 * Middleware за детекция на bots и генериране на meta tags
 */
async function botDetector(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';

    if (!isBot(userAgent)) {
        return next();
    }

    const botName = getBotName(userAgent);
    const clientIP = getClientIP(req); 

    console.log('🤖 Bot detected:', {
        bot: botName,
        url: req.path,
        timestamp: new Date().toISOString(),
        ip: clientIP
    });

    // URL Pattern Matching
    const articlesListMatch = req.path.match(/^\/articles$/);
    const articleMatch = req.path.match(/^\/articles\/([a-zA-Z0-9-]+)$/);
    const projectMatch = req.path.match(/^\/projects\/([a-zA-Z0-9-]+)$/);
    const initiativeMatch = req.path.match(/^\/initiatives\/([a-zA-Z0-9-]+)$/);
    const clubMatch = req.path.match(/^\/clubs\/([a-zA-Z0-9-]+)$/);
    const academyMatch = req.path.match(/^\/academy$/);
    const mentorMatch = req.path.match(/^\/academy\/mentors\/(\d+)$/);
    const gamesMatch = req.path.match(/^\/games$/);
    const usefulLinksMatch = req.path.match(/^\/useful-links$/);
    const publicationMatch = req.path.match(/^\/publications\/([a-zA-Z0-9-]+)$/);
    const storyMatch = req.path.match(/^\/stories\/([a-zA-Z0-9-]+)$/);
    const coursesListMatch = req.path.match(/^\/academy\/courses$/);
    const courseMatch = req.path.match(/^\/academy\/courses\/([a-zA-Z0-9-]+)$/);
    const lecturesListMatch = req.path.match(/^\/academy\/lectures$/);
    const lectureMatch = req.path.match(/^\/academy\/lectures\/([a-zA-Z0-9-]+)$/);
    const telkMatch = req.path.match(/^\/telk-rkme-rzi$/);
    const factCheckListMatch = req.path.match(/^\/fact-check$/);
    const factCheckDetailMatch = req.path.match(/^\/fact-check\/([a-zA-Z0-9-]+)$/);

    try {
        // ==================== ARTICLES LIST ====================
        if (articlesListMatch) {
            console.log('📋 Processing ARTICLES LIST page');
            await logBotRequest(botName, 'page', null, 'articles-list', userAgent, clientIP);
            const html = generateArticlesListMetaHTML();
            console.log('📤 Sending articles list HTML to bot');
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

            await logBotRequest(botName, 'article', foundArticle.id, foundArticle.slug, userAgent, clientIP);

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
                        model: image,
                        as: 'mainImage',
                        attributes: ['id', 'type', 'src', 'alt'],
                    }
                ],
                attributes: [
                    'id', 'title', 'slug', 'shortDescription', 'fullDescription',
                    'category', 'tags', 'status', 'timeline', 'budget',
                    'location', 'createdAt', 'updatedAt'
                ]
            });

            if (!foundProject) {
                console.log('❌ Project not found:', slug);
                return next();
            }

            console.log('✅ Project found:', foundProject.title);

            await logBotRequest(botName, 'project', foundProject.id, foundProject.slug, userAgent, clientIP);

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

            await logBotRequest(botName, 'initiative', foundInitiative.id, foundInitiative.slug, userAgent, clientIP);

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

            await logBotRequest(botName, 'club', foundClub.id, foundClub.slug, userAgent, clientIP);

            const html = generateClubMetaHTML(foundClub);
            console.log('📤 Sending club HTML to bot');
            return res.send(html);
        }

        // ==================== PUBLICATION ====================
if (publicationMatch) {
    const slug = publicationMatch[1];
    console.log('📚 Processing PUBLICATION:', slug);

    const foundPublication = await publication.findOne({
        where: { slug, isDraft: false },
        attributes: [
            'id', 'title', 'slug', 'shortDescription',
            'category', 'tags', 'author',
            'publishedAt', 'createdAt', 'updatedAt'
        ],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
            }
        ]
    });

    if (!foundPublication) {
        console.log('❌ Publication not found:', slug);
        return next();
    }

    console.log('✅ Publication found:', foundPublication.title);

    await logBotRequest(botName, 'publication', foundPublication.id, foundPublication.slug, userAgent, clientIP);

    const html = generatePublicationMetaHTML(foundPublication);
    console.log('📤 Sending publication HTML to bot');
    return res.send(html);
}

        // ==================== STORY ====================
if (storyMatch) {
    const slug = storyMatch[1];
    console.log('📖 Processing STORY:', slug);

    const foundStory = await story.findOne({
        where: { slug, isDraft: false },
        attributes: [
            'id', 'title', 'slug', 'shortDescription',
            'category', 'tags', 'author',
            'publishedAt', 'createdAt', 'updatedAt'
        ],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
            }
        ]
    });

    if (!foundStory) {
        console.log('❌ Story not found:', slug);
        return next();
    }

    console.log('✅ Story found:', foundStory.title);

    await logBotRequest(botName, 'story', foundStory.id, foundStory.slug, userAgent, clientIP);

    const html = generateStoryMetaHTML(foundStory);
    console.log('📤 Sending story HTML to bot');
    return res.send(html);
}

        // ==================== ACADEMY (СТАТИЧНА СТРАНИЦА) ====================
        if (academyMatch) {
            console.log('🎓 Processing ACADEMY page');

            await logBotRequest(botName, 'page', null, 'academy', userAgent, clientIP);

            const html = generateAcademyMetaHTML();
            console.log('📤 Sending academy HTML to bot');
            return res.send(html);
        }

        // ==================== GAMES (СТАТИЧНА СТРАНИЦА) ====================
        if (gamesMatch) {
            console.log('🎮 Processing GAMES page');

            await logBotRequest(botName, 'page', null, 'games', userAgent, clientIP);

            const html = generateGamesMetaHTML();
            console.log('📤 Sending games HTML to bot');
            return res.send(html);
        }

        // ==================== USEFUL LINKS (СТАТИЧНА СТРАНИЦА) ====================
        if (usefulLinksMatch) {
            console.log('🔗 Processing USEFUL LINKS page');

            await logBotRequest(botName, 'page', null, 'useful-links', userAgent, clientIP);

            const html = generateUsefulLinksMetaHTML();
            console.log('📤 Sending useful links HTML to bot');
            return res.send(html);
        }

        // ==================== TELK/RKME/RZI (СТАТИЧНА СТРАНИЦА) ====================
        if (telkMatch) {
            console.log('🏥 Processing TELK/RKME/RZI page');

            await logBotRequest(botName, 'page', null, 'telk-rkme-rzi', userAgent, clientIP);

            const html = generateTelkMetaHTML();
            console.log('📤 Sending TELK HTML to bot');
            return res.send(html);
        }

        // ==================== FACT CHECK LIST (СТАТИЧНА СТРАНИЦА) ====================
        if (factCheckListMatch) {
            console.log('🔍 Processing FACT CHECK LIST page');

            await logBotRequest(botName, 'page', null, 'fact-check', userAgent, clientIP);

            const html = generateFactCheckListMetaHTML();
            console.log('📤 Sending fact-check list HTML to bot');
            return res.send(html);
        }

        // ==================== FACT CHECK DETAIL (ДИНАМИЧНА СТРАНИЦА) ====================
        if (factCheckDetailMatch) {
            const slug = factCheckDetailMatch[1];
            console.log('🔍 Processing FACT CHECK DETAIL:', slug);

            const foundModule = await fact_check_module.findOne({
                where: { slug, status: 'published' },
                raw: true,
            });

            if (foundModule) {
                await logBotRequest(botName, 'fact-check', foundModule.id, slug, userAgent, clientIP);
                const html = generateFactCheckDetailMetaHTML(foundModule);
                console.log('📤 Sending fact-check detail HTML to bot');
                return res.send(html);
            }

            console.log('⚠️ Fact-check module not found:', slug);
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

            await logBotRequest(botName, 'mentor', foundMentor.id, null, userAgent, clientIP);

            const html = generateMentorMetaHTML(foundMentor);
            console.log('📤 Sending mentor HTML to bot');
            return res.send(html);
        }

        // ==================== COURSES LIST (СТАТИЧНА) ====================
        if (coursesListMatch) {
            console.log('📚 Processing COURSES LIST page');

            await logBotRequest(botName, 'page', null, 'academy-courses', userAgent, clientIP);

            const html = generateCoursesListMetaHTML();
            console.log('📤 Sending courses list HTML to bot');
            return res.send(html);
        }

        // ==================== COURSE DETAIL ====================
        if (courseMatch) {
            const slug = courseMatch[1];
            console.log('📚 Processing COURSE:', slug);

            const foundCourse = await course.findOne({
                where: { slug },
                attributes: [
                    'id', 'name', 'slug', 'shortDescription', 'description',
                    'category', 'tags', 'difficultyLevel', 'estimatedHours',
                    'thumbnailUrl', 'enrolledCount', 'rating', 'maxCredits',
                    'publishedAt', 'createdAt', 'updatedAt'
                ]
            });

            if (!foundCourse) {
                console.log('❌ Course not found:', slug);
                return next();
            }

            console.log('✅ Course found:', foundCourse.name);

            await logBotRequest(botName, 'course', foundCourse.id, foundCourse.slug, userAgent, clientIP);

            const html = generateCourseMetaHTML(foundCourse);
            console.log('📤 Sending course HTML to bot');
            return res.send(html);
        }

        // ==================== LECTURES LIST (СТАТИЧНА) ====================
        if (lecturesListMatch) {
            console.log('🎤 Processing LECTURES LIST page');

            await logBotRequest(botName, 'page', null, 'academy-lectures', userAgent, clientIP);

            const html = generateLecturesListMetaHTML();
            console.log('📤 Sending lectures list HTML to bot');
            return res.send(html);
        }

        // ==================== LECTURE DETAIL ====================
        if (lectureMatch) {
            const slug = lectureMatch[1];
            console.log('🎤 Processing LECTURE:', slug);

            const foundLecture = await lecture.findOne({
                where: { slug },
                include: [
                    {
                        model: mentor,
                        as: 'lecturer',
                        attributes: ['id', 'name', 'photoUrl', 'specialization']
                    }
                ],
                attributes: [
                    'id', 'title', 'slug', 'shortDescription', 'description',
                    'category', 'tags', 'thumbnailUrl', 'durationMinutes',
                    'scheduledDate', 'isFree', 'rating', 'registeredCount',
                    'publishedAt', 'createdAt', 'updatedAt'
                ]
            });

            if (!foundLecture) {
                console.log('❌ Lecture not found:', slug);
                return next();
            }

            console.log('✅ Lecture found:', foundLecture.title);

            await logBotRequest(botName, 'lecture', foundLecture.id, foundLecture.slug, userAgent, clientIP);

            const html = generateLectureMetaHTML(foundLecture);
            console.log('📤 Sending lecture HTML to bot');
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