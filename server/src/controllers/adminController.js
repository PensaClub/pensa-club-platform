const adminController = require('express').Router();
const { user_account, user_ads, article, project, initiative, Club, bot_log } = require('../sequelize/models/index');

const { Op } = require('sequelize');
const sequelize = require('../sequelize/models').sequelize;
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const eventEmitter = require('../utils/eventEmitter');

adminController.post('/change-role', isAuth, rbac.checkPermission('account', 'update'), async (req, res, next) => {
    const { email, role, roleChangeComment } = req.body;
    const allowedRoles = ['admin', 'moderator', 'user', 'guest', 'limited'];
    try {
        if (!allowedRoles.includes(role)) return res.status(400).json({ message: 'Invalid role.' });
        if (email === process.env.ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot change role of the admin account.' });

        if (roleChangeComment) {
            if (roleChangeComment.length > 1000) return res.status(400).json({ message: 'Maximum comment length limit of 1000 characters is reached.' });
        }

        const emailExists = await user_account.findOne({ where: { email } });

        if (!emailExists) return res.status(404).json({ message: 'User not found.' });

        await user_account.update({ role, roleChangeComment }, { where: { email } });

        res.status(200).json({ message: 'Role changed successfully.' });
    } catch (err) {
        next(err);
    }
});

adminController.delete('/delete-account/:userEmail', isAuth, rbac.checkPermission('account', 'delete'), async (req, res, next) => {
    try {
        const { userEmail } = req.params;

        const user = await user_account.findOne({ where: { email: userEmail } });

        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (user.email === process.env.ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot delete that admin account.' });

        await user_account.destroy({ where: { email: userEmail } });

        res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

adminController.patch('/delete-comment/', isAuth, rbac.checkPermission('comment', 'delete'), async (req, res, next) => {
    try {
        const { email, adId } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        if (email !== req.user.email && req.user.role !== 'admin') return res.status(403).json({ message: 'You are not authorized to delete this comment.' });

        const user = await user_account.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (adId === '') {
            user.roleChangeComment = null;
            await user.save();

            return res.status(200).json({ message: 'Comment deleted successfully.' });
        }

        await user_ads.update({ adminComment: null }, { where: { adId } });

        eventEmitter.emit('userCacheUpdate', { type: 'ads', data: { adminComment: null }, adId, userId: user.id });

        res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (err) {
        next(err);
    }
});
// ========================================
// BOT LOGS - Статистика и управление
// ========================================

/**
 * GET /admin/bot-stats
 * Статистика за bot requests
 * Query params: days (default: 7)
 */
adminController.get('/bot-stats', isAuth, rbac.checkPermission('admin', 'read'), async (req, res, next) => {
    try {
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Брой заявки по bot
        const botCounts = await bot_log.findAll({
            attributes: [
                'bot',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                timestamp: { [Op.gte]: startDate }
            },
            group: ['bot'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            raw: true
        });

        // Топ споделяни статии
        const topArticles = await bot_log.findAll({
            attributes: [
                'articleSlug',
                [sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'shares']
            ],
            where: {
                timestamp: { [Op.gte]: startDate }
            },
            include: [
                {
                    model: article,
                    as: 'article',
                    attributes: ['id', 'title', 'slug']
                }
            ],
            group: ['articleSlug', 'article.id', 'article.title', 'article.slug'],
            order: [[sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'DESC']],
            limit: 10
        });

        // Обща статистика
        const totalRequests = await bot_log.count({
            where: {
                timestamp: { [Op.gte]: startDate }
            }
        });

        // Статистика по дни (за графика)
        const dailyStats = await bot_log.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                timestamp: { [Op.gte]: startDate }
            },
            group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
            order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'ASC']],
            raw: true
        });

        res.json({
            period: `${days} days`,
            totalRequests,
            botCounts,
            topArticles,
            dailyStats
        });
    } catch (error) {
        console.error('Error fetching bot stats:', error);
        next(error);
    }
});

/**
 * GET /admin/bot-logs
 * Последни bot requests
 * Query params: limit, offset, bot, articleSlug
 */
adminController.get('/bot-logs', isAuth, rbac.checkPermission('admin', 'read'), async (req, res, next) => {
    try {
        const { limit = 50, offset = 0, bot, articleSlug } = req.query;

        const where = {};
        if (bot) where.bot = bot;
        if (articleSlug) where.articleSlug = articleSlug;

        const logs = await bot_log.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['timestamp', 'DESC']],
            include: [
                {
                    model: article,
                    as: 'article',
                    attributes: ['id', 'title', 'slug']
                }
            ]
        });

        const total = await bot_log.count({ where });

        res.json({
            logs,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < total
            }
        });
    } catch (error) {
        console.error('Error fetching bot logs:', error);
        next(error);
    }
});

/**
 * GET /admin/bot-logs/:articleSlug
 * Bot logs за конкретна статия
 */
adminController.get('/bot-logs/:articleSlug', isAuth, rbac.checkPermission('admin', 'read'), async (req, res, next) => {
    try {
        const { articleSlug } = req.params;
        const { limit = 50 } = req.query;

        const logs = await bot_log.findAll({
            where: { articleSlug },
            limit: parseInt(limit),
            order: [['timestamp', 'DESC']],
            include: [
                {
                    model: article,
                    as: 'article',
                    attributes: ['id', 'title', 'slug']
                }
            ]
        });

        const stats = await bot_log.findAll({
            attributes: [
                'bot',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { articleSlug },
            group: ['bot'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            raw: true
        });

        res.json({
            articleSlug,
            totalShares: logs.length,
            stats,
            logs
        });
    } catch (error) {
        console.error('Error fetching article bot logs:', error);
        next(error);
    }
});

/**
 * DELETE /admin/bot-logs/cleanup
 * Ръчно изчистване на стари логове
 * Body: { days: 30 }
 */
adminController.delete('/bot-logs/cleanup', isAuth, rbac.checkPermission('admin', 'delete'), async (req, res, next) => {
    try {
        const { days = 30 } = req.body;

        const { cleanupOldBotLogs } = require('../cron/botLogCleanup');
        const deletedCount = await cleanupOldBotLogs(parseInt(days));

        res.json({
            message: `Deleted ${deletedCount} bot logs older than ${days} days`,
            deletedCount,
            days: parseInt(days)
        });
    } catch (error) {
        console.error('Error cleaning up bot logs:', error);
        next(error);
    }
});

/**
 * GET /admin/bot-summary
 * Кратка обобщена статистика (за dashboard)
 */
/**
 * GET /admin/bot-summary
 * Кратка обобщена статистика (за dashboard)
 */
adminController.get('/bot-summary', isAuth, rbac.checkPermission('admin', 'read'), async (req, res, next) => {
    try {
        // ==================== TIME RANGES ====================
        const last24h = new Date();
        last24h.setHours(last24h.getHours() - 24);

        const last7d = new Date();
        last7d.setDate(last7d.getDate() - 7);

        const last30d = new Date();
        last30d.setDate(last30d.getDate() - 30);

        // ==================== BASIC COUNTS ====================
        const [
            last24hCount,
            last7dCount,
            last30dCount,
            totalCount
        ] = await Promise.all([
            bot_log.count({ where: { timestamp: { [Op.gte]: last24h } } }),
            bot_log.count({ where: { timestamp: { [Op.gte]: last7d } } }),
            bot_log.count({ where: { timestamp: { [Op.gte]: last30d } } }),
            bot_log.count()
        ]);

        // ==================== TOP BOT ====================
        const topBot = await bot_log.findAll({
            attributes: [
                'bot',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['bot'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 5,
            raw: true
        });

        // ==================== CONTENT TYPE DISTRIBUTION ====================
        const contentTypeStats = await bot_log.findAll({
            attributes: [
                'contentType',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['contentType'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            raw: true
        });

        // ==================== TOP ARTICLES (Last 7 days) ====================
        const topArticles = await bot_log.findAll({
            attributes: [
                'articleSlug',
                [sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'shares']
            ],
            where: {
                timestamp: { [Op.gte]: last7d },
                contentType: 'article',
                articleSlug: { [Op.ne]: null }
            },
            include: [
                {
                    model: article,
                    as: 'article',
                    attributes: ['id', 'title', 'slug'],
                    required: false
                }
            ],
            group: ['articleSlug', 'article.id', 'article.title', 'article.slug'],
            order: [[sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'DESC']],
            limit: 5
        });

        // ==================== TOP PROJECTS (Last 7 days) ====================
        const topProjects = await bot_log.findAll({
            attributes: [
                'projectSlug',
                [sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'shares']
            ],
            where: {
                timestamp: { [Op.gte]: last7d },
                contentType: 'project',
                projectSlug: { [Op.ne]: null }
            },
            include: [
                {
                    model: project,
                    as: 'project',
                    attributes: ['id', 'title', 'slug'],
                    required: false
                }
            ],
            group: ['projectSlug', 'project.id', 'project.title', 'project.slug'],
            order: [[sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'DESC']],
            limit: 5
        });

        // ==================== TOP INITIATIVES (Last 7 days) ====================
        const topInitiatives = await bot_log.findAll({
            attributes: [
                'initiativeSlug',
                [sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'shares']
            ],
            where: {
                timestamp: { [Op.gte]: last7d },
                contentType: 'initiative',
                initiativeSlug: { [Op.ne]: null }
            },
            include: [
                {
                    model: initiative,
                    as: 'initiative',
                    attributes: ['id', 'title', 'slug'],
                    required: false
                }
            ],
            group: ['initiativeSlug', 'initiative.id', 'initiative.title', 'initiative.slug'],
            order: [[sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'DESC']],
            limit: 5
        });

        // ==================== TOP CLUBS (Last 7 days) ====================
        const topClubs = await bot_log.findAll({
            attributes: [
                'clubSlug',
                [sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'shares']
            ],
            where: {
                timestamp: { [Op.gte]: last7d },
                contentType: 'club',
                clubSlug: { [Op.ne]: null }
            },
            include: [
                {
                    model: Club,
                    as: 'club',
                    attributes: ['id', 'name', 'slug'],
                    required: false
                }
            ],
            group: ['clubSlug', 'club.id', 'club.name', 'club.slug'],
            order: [[sequelize.fn('COUNT', sequelize.col('bot_log.id')), 'DESC']],
            limit: 5
        });

        // ==================== TOP PAGES (Last 7 days) ====================
        const topPages = await bot_log.findAll({
            attributes: [
                'pageSlug',
                [sequelize.fn('COUNT', sequelize.col('id')), 'shares']
            ],
            where: {
                timestamp: { [Op.gte]: last7d },
                contentType: 'page',
                pageSlug: { [Op.ne]: null }
            },
            group: ['pageSlug'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10,
            raw: true
        });

        // ==================== TOP COUNTRIES ====================
        const topCountries = await bot_log.findAll({
            attributes: [
                'country',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                country: { [Op.ne]: null }
            },
            group: ['country'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10,
            raw: true
        });

        // ==================== DAILY ACTIVITY (Last 7 days) ====================
        const dailyActivity = await bot_log.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                timestamp: { [Op.gte]: last7d }
            },
            group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
            order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'ASC']],
            raw: true
        });
        // ==================== TOP GAMES (Last 7 days) ====================
        const topGames = await bot_log.findAll({
            attributes: [
                'gameSlug',
                [sequelize.fn('COUNT', sequelize.col('id')), 'shares']
            ],
            where: {
                timestamp: { [Op.gte]: last7d },
                contentType: 'game',
                gameSlug: { [Op.ne]: null }
            },
            group: ['gameSlug'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10,
            raw: true
        });
        // ==================== RESPONSE ====================
        res.json({
            summary: {
                last24Hours: last24hCount,
                last7Days: last7dCount,
                last30Days: last30dCount,
                total: totalCount
            },
            topBots: topBot,
            contentTypeDistribution: contentTypeStats,
            topContent: {
                articles: topArticles.map(item => ({
                    slug: item.articleSlug,
                    title: item.article?.title || 'Unknown',
                    shares: parseInt(item.dataValues.shares),
                    type: 'article'
                })),
                projects: topProjects.map(item => ({
                    slug: item.projectSlug,
                    title: item.project?.title || 'Unknown',
                    shares: parseInt(item.dataValues.shares),
                    type: 'project'
                })),
                initiatives: topInitiatives.map(item => ({
                    slug: item.initiativeSlug,
                    title: item.initiative?.title || 'Unknown',
                    shares: parseInt(item.dataValues.shares),
                    type: 'initiative'
                })),
                clubs: topClubs.map(item => ({
                    slug: item.clubSlug,
                    name: item.club?.name || 'Unknown',
                    shares: parseInt(item.dataValues.shares),
                    type: 'club'
                })),
                pages: topPages.map(item => ({
                    slug: item.pageSlug,
                    shares: parseInt(item.shares),
                    type: 'page'
                })),
                games: topGames.map(item => ({
                    slug: item.gameSlug,
                    shares: parseInt(item.shares),
                    type: 'game'
                }))
            },
            geography: {
                topCountries: topCountries.map(item => ({
                    country: item.country,
                    count: parseInt(item.count)
                }))
            },
            dailyActivity: dailyActivity,
            meta: {
                generatedAt: new Date().toISOString(),
                timeRanges: {
                    last24h: last24h.toISOString(),
                    last7d: last7d.toISOString(),
                    last30d: last30d.toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Error fetching bot summary:', error);
        next(error);
    }
});
module.exports = adminController;