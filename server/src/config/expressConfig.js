const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const { port, frontend_server } = require('./envConfig');

const testDatabaseConnection = require('../sequelize/testDatabaseConnection');
const scheduleArticleCleanup = require('../cron/articleCleanup');
const { startMentorActivityCron } = require('../cron/mentorActivityCron');
const { startVisitReminderCron } = require('../cron/visitReminderCron');
const { startSeminarReminderCron } = require('../cron/seminarReminderCron');
const { startForumDigestCron } = require('../cron/forumDigestCron');
const { startStorageSyncCron } = require('../cron/storageSyncCron');
const scheduleAuditLogCleanup = require('../cron/auditLogCleanup');
const { startWeeklyDigestCron } = require('../cron/weeklyDigestCron');
const { startScheduledNewsletterCron } = require('../cron/scheduledNewsletterCron');
const { startEventBatchCron } = require('../cron/eventBatchCron');
const { startMonthlyReportCron } = require('../cron/monthlyReportCron');
const { startCrawlerScheduler } = require('../cron/crawlerScheduler');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const dataTrimmer = require('../middlewares/dataTrimmer');
const { ipBlocker } = require('../middlewares/ipBlocker');
const { ipLogger } = require('../middlewares/ipLogger');

const corsOptions = {
    origin: ['https://pensa.club', 'https://www.pensa.club', 'http://localhost:3000'],
    //   origin: function (origin, cb) {
    //     frontend_server === origin ? cb(null, true) : cb(new Error("Not allowed!"));
    //   },
    methods: 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

module.exports = function expressConfig(app) {
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(dataTrimmer);
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(ipBlocker);
    app.use(ipLogger);

    // Create HTTP server and attach Socket.IO
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: corsOptions,
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Make io accessible from controllers via req.app.get('io')
    app.set('io', io);

    // Socket.IO handlers
    require('../sockets/socketHandler')(io);

    server.listen(port, async () => {
        await testDatabaseConnection();
        console.log(`Server is listening on port: ${port} (with Socket.IO)`);
        // Preload the email template into in-memory cache so the first
        // outbound email already has the admin overrides applied.
        try {
            const { loadTemplate } = require('../utils/emailTemplateCache');
            await loadTemplate();
        } catch (e) {
            console.error('[boot] emailTemplate preload failed:', e?.message);
        }
        scheduleArticleCleanup();
        startMentorActivityCron();
        startVisitReminderCron();
        startSeminarReminderCron();
        startForumDigestCron();
        startStorageSyncCron();
        scheduleAuditLogCleanup();
        await startWeeklyDigestCron();
        await startScheduledNewsletterCron();
        await startEventBatchCron();
        await startMonthlyReportCron();
        await startCrawlerScheduler();
    });
};
