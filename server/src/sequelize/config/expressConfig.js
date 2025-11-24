const express = require('express');
const { port, frontend_server } = require('./envConfig');
const testDatabaseConnection = require('../sequelize/testDatabaseConnection');
const scheduleArticleCleanup = require('../cron/articleCleanup');
const { startMentorActivityCron } = require('../cron/mentorActivityCron');
const { scheduleBotLogCleanup } = require('../cron/botLogCleanup'); 
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dataTrimmer = require('../middlewares/dataTrimmer');
const botDetector = require('../middlewares/botDetector');

const corsOptions = {
    origin: frontend_server,
    methods: 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

module.exports = function expressConfig(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(dataTrimmer);
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(botDetector);
    
    app.listen(port, async () => {
        await testDatabaseConnection();
        console.log(`Server is listening on port: ${port}`);
        scheduleArticleCleanup();
        startMentorActivityCron();
        scheduleBotLogCleanup(); 
    });
};