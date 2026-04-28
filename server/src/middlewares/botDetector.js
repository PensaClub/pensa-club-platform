// server/src/middleware/botDetector.js

const { article, mainImage, project, initiative, Club, mentor, image, publication, story, course, lecture, fact_check_module, seminar } = require('../sequelize/models');
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
const {
    generateInitiativesListMetaHTML,
    generateProjectsListMetaHTML,
    generatePublicationsListMetaHTML,
    generateStoriesListMetaHTML,
    generateClubsListMetaHTML,
} = require('../utils/listMetaGenerators');
const { generateFactCheckListMetaHTML, generateFactCheckDetailMetaHTML } = require('../utils/factCheckMetaGenerator');
const { generateReactionLandingMetaHTML, generateReactionBookMetaHTML } = require('../utils/reactionMetaGenerator');
const { generateForumCommunityMetaHTML } = require('../utils/forumMetaGenerator');
const { generateSeminarsListMetaHTML, generateSeminarDetailMetaHTML } = require('../utils/seminarsMetaGenerator');
const generateHomeMetaHTML = require('../utils/homeMetaGenerator');
const generateAboutMetaHTML = require('../utils/aboutMetaGenerator');
const generateContactMetaHTML = require('../utils/contactMetaGenerator');
const generatePrivacyPolicyMetaHTML = require('../utils/privacyPolicyMetaGenerator');
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

    // Phase 2: detect language prefix (/en/, /de/) and strip it before pattern
    // matching so a single set of regexes covers all 3 language URL variants.
    // /en/articles/xyz → detectedLang='en', normalizedPath='/articles/xyz'.
    let detectedLang = 'bg';
    let normalizedPath = req.path;
    const langPrefixMatch = normalizedPath.match(/^\/(en|de)(\/.*|$)/);
    if (langPrefixMatch) {
        detectedLang = langPrefixMatch[1];
        normalizedPath = langPrefixMatch[2] || '/';
    }

    console.log('🤖 Bot detected:', {
        bot: botName,
        url: req.path,
        normalizedPath,
        lang: detectedLang,
        timestamp: new Date().toISOString(),
        ip: clientIP
    });

    // URL Pattern Matching (against language-stripped path)
    const articlesListMatch = normalizedPath.match(/^\/articles$/);
    const articleMatch = normalizedPath.match(/^\/articles\/([a-zA-Z0-9-]+)$/) || normalizedPath.match(/^\/articles\/single\/(\d+)$/);
    const initiativesListMatch = normalizedPath.match(/^\/initiatives$/);
    const initiativeMatch = normalizedPath.match(/^\/initiatives\/([a-zA-Z0-9-]+)$/);
    const projectsListMatch = normalizedPath.match(/^\/projects$/);
    const projectMatch = normalizedPath.match(/^\/projects\/([a-zA-Z0-9-]+)$/);
    const clubsListMatch = normalizedPath.match(/^\/clubs$/);
    const clubMatch = normalizedPath.match(/^\/clubs\/([a-zA-Z0-9-]+)$/);
    const academyMatch = normalizedPath.match(/^\/academy$/);
    const mentorMatch = normalizedPath.match(/^\/academy\/mentors\/(\d+)$/);
    const gamesMatch = normalizedPath.match(/^\/games$/);
    const usefulLinksMatch = normalizedPath.match(/^\/useful-links$/);
    const publicationsListMatch = normalizedPath.match(/^\/publications$/);
    const publicationMatch = normalizedPath.match(/^\/publications\/([a-zA-Z0-9-]+)$/);
    const storiesListMatch = normalizedPath.match(/^\/stories$/);
    const storyMatch = normalizedPath.match(/^\/stories\/([a-zA-Z0-9-]+)$/);
    const coursesListMatch = normalizedPath.match(/^\/academy\/courses$/);
    const courseMatch = normalizedPath.match(/^\/academy\/courses\/([a-zA-Z0-9-]+)$/);
    const lecturesListMatch = normalizedPath.match(/^\/academy\/lectures$/);
    const lectureMatch = normalizedPath.match(/^\/academy\/lectures\/([a-zA-Z0-9-]+)$/);
    const seminarsListMatch = normalizedPath.match(/^\/academy\/seminars$/);
    const seminarDetailMatch = normalizedPath.match(/^\/academy\/seminars\/([a-zA-Z0-9-]+)$/);
    const telkMatch = normalizedPath.match(/^\/telk-rkme-rzi$/);
    const factCheckListMatch = normalizedPath.match(/^\/fact-check$/);
    const factCheckDetailMatch = normalizedPath.match(/^\/fact-check\/([a-zA-Z0-9-]+)$/);
    const reactionLandingMatch = normalizedPath.match(/^\/reaction$/);
    const reactionBookMatch = normalizedPath.match(/^\/reaction\/book$/);
    const forumCommunityMatch = normalizedPath.match(/^\/academy\/community$/);
    const homeMatch = normalizedPath.match(/^\/$/);
    const aboutMatch = normalizedPath.match(/^\/about$/);
    const contactMatch = normalizedPath.match(/^\/contact$/);
    const privacyPolicyMatch = normalizedPath.match(/^\/privacy-policy$/);

    try {
        // ==================== HOME (СТАТИЧНА СТРАНИЦА) ====================
        if (homeMatch) {
            console.log('🏠 Processing HOME page');
            await logBotRequest(botName, 'page', null, `home-${detectedLang}`, userAgent, clientIP);
            const html = generateHomeMetaHTML(detectedLang);
            console.log('📤 Sending home HTML to bot');
            return res.send(html);
        }

        // ==================== ABOUT (СТАТИЧНА СТРАНИЦА) ====================
        if (aboutMatch) {
            console.log('ℹ️ Processing ABOUT page');
            await logBotRequest(botName, 'page', null, `about-${detectedLang}`, userAgent, clientIP);
            const html = generateAboutMetaHTML(detectedLang);
            console.log('📤 Sending about HTML to bot');
            return res.send(html);
        }

        // ==================== CONTACT (СТАТИЧНА СТРАНИЦА) ====================
        if (contactMatch) {
            console.log('📮 Processing CONTACT page');
            await logBotRequest(botName, 'page', null, `contact-${detectedLang}`, userAgent, clientIP);
            const html = generateContactMetaHTML(detectedLang);
            console.log('📤 Sending contact HTML to bot');
            return res.send(html);
        }

        // ==================== PRIVACY POLICY (СТАТИЧНА СТРАНИЦА) ====================
        if (privacyPolicyMatch) {
            console.log('🔒 Processing PRIVACY POLICY page');
            await logBotRequest(botName, 'page', null, `privacy-policy-${detectedLang}`, userAgent, clientIP);
            const html = generatePrivacyPolicyMetaHTML(detectedLang);
            console.log('📤 Sending privacy-policy HTML to bot');
            return res.send(html);
        }

        // ==================== ARTICLES LIST ====================
        if (articlesListMatch) {
            console.log('📋 Processing ARTICLES LIST page');
            await logBotRequest(botName, 'page', null, 'articles-list', userAgent, clientIP);
            const html = generateArticlesListMetaHTML();
            console.log('📤 Sending articles list HTML to bot');
            return res.send(html);
        }

        // ==================== INITIATIVES LIST ====================
        if (initiativesListMatch) {
            console.log('📋 Processing INITIATIVES LIST page');
            await logBotRequest(botName, 'page', null, 'initiatives-list', userAgent, clientIP);
            const html = generateInitiativesListMetaHTML();
            console.log('📤 Sending initiatives list HTML to bot');
            return res.send(html);
        }

        // ==================== PROJECTS LIST ====================
        if (projectsListMatch) {
            console.log('📋 Processing PROJECTS LIST page');
            await logBotRequest(botName, 'page', null, 'projects-list', userAgent, clientIP);
            const html = generateProjectsListMetaHTML();
            console.log('📤 Sending projects list HTML to bot');
            return res.send(html);
        }

        // ==================== PUBLICATIONS LIST ====================
        if (publicationsListMatch) {
            console.log('📋 Processing PUBLICATIONS LIST page');
            await logBotRequest(botName, 'page', null, 'publications-list', userAgent, clientIP);
            const html = generatePublicationsListMetaHTML();
            console.log('📤 Sending publications list HTML to bot');
            return res.send(html);
        }

        // ==================== STORIES LIST ====================
        if (storiesListMatch) {
            console.log('📋 Processing STORIES LIST page');
            await logBotRequest(botName, 'page', null, 'stories-list', userAgent, clientIP);
            const html = generateStoriesListMetaHTML();
            console.log('📤 Sending stories list HTML to bot');
            return res.send(html);
        }

        // ==================== CLUBS LIST ====================
        if (clubsListMatch) {
            console.log('📋 Processing CLUBS LIST page');
            await logBotRequest(botName, 'page', null, 'clubs-list', userAgent, clientIP);
            const html = generateClubsListMetaHTML();
            console.log('📤 Sending clubs list HTML to bot');
            return res.send(html);
        }

        // ==================== ARTICLE ====================
        if (articleMatch) {
            const slugOrId = articleMatch[1];
            console.log('📄 Processing ARTICLE:', slugOrId);

            const isNumericId = /^\d+$/.test(slugOrId);
            const foundArticle = await article.findOne({
                where: isNumericId ? { id: parseInt(slugOrId) } : { slug: slugOrId },
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

        // ==================== REACTION LANDING (СТАТИЧНА СТРАНИЦА) ====================
        if (reactionLandingMatch) {
            console.log('🎯 Processing REACTION LANDING page');

            await logBotRequest(botName, 'page', null, 'reaction', userAgent, clientIP);

            const html = generateReactionLandingMetaHTML();
            console.log('📤 Sending reaction landing HTML to bot');
            return res.send(html);
        }

        // ==================== REACTION BOOK (СТАТИЧНА СТРАНИЦА) ====================
        if (reactionBookMatch) {
            console.log('📋 Processing REACTION BOOK page');

            await logBotRequest(botName, 'page', null, 'reaction-book', userAgent, clientIP);

            const html = generateReactionBookMetaHTML();
            console.log('📤 Sending reaction book HTML to bot');
            return res.send(html);
        }

        // ==================== FORUM COMMUNITY (СТАТИЧНА СТРАНИЦА) ====================
        if (forumCommunityMatch) {
            console.log('💬 Processing FORUM COMMUNITY page');

            await logBotRequest(botName, 'page', null, 'forum-community', userAgent, clientIP);

            const html = generateForumCommunityMetaHTML();
            console.log('📤 Sending forum community HTML to bot');
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

        // ==================== SEMINARS LIST (СТАТИЧНА) ====================
        if (seminarsListMatch) {
            console.log('🎓 Processing SEMINARS LIST page');

            await logBotRequest(botName, 'page', null, 'academy-seminars', userAgent, clientIP);

            const html = generateSeminarsListMetaHTML();
            console.log('📤 Sending seminars list HTML to bot');
            return res.send(html);
        }

        // ==================== SEMINAR DETAIL ====================
        if (seminarDetailMatch) {
            const slug = seminarDetailMatch[1];
            console.log('🎓 Processing SEMINAR:', slug);

            const foundSeminar = await seminar.findOne({
                where: { slug, isPublished: true },
                include: [
                    {
                        model: mentor,
                        as: 'facilitator',
                        attributes: ['id', 'name', 'photoUrl', 'specialization']
                    }
                ],
                attributes: [
                    'id', 'title', 'slug', 'shortDescription', 'description',
                    'category', 'tags', 'thumbnailUrl', 'seminarType',
                    'isOnline', 'location', 'address', 'meetingLink',
                    'scheduledDate', 'scheduledEndDate', 'durationMinutes',
                    'maxParticipants', 'registeredCount', 'status',
                    'publishedAt', 'createdAt', 'updatedAt'
                ]
            });

            if (!foundSeminar) {
                console.log('❌ Seminar not found:', slug);
                return next();
            }

            console.log('✅ Seminar found:', foundSeminar.title);

            await logBotRequest(botName, 'page', foundSeminar.id, foundSeminar.slug, userAgent, clientIP);

            const html = generateSeminarDetailMetaHTML(foundSeminar);
            console.log('📤 Sending seminar HTML to bot');
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