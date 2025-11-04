// server/src/cron/mentorActivityCron.js

const cron = require('node-cron');
const { createDailySnapshots } = require('../services/mentorActivitySnapshotService');

/**
 * Cron job за създаване на daily snapshots
 * Изпълнява се всяка нощ в 00:05 (5 минути след полунощ)
 */
const startMentorActivityCron = () => {
  // Cron pattern: "минута час ден месец ден-от-седмицата"
  // "5 0 * * *" = 00:05 всеки ден
  
  cron.schedule('5 0 * * *', async () => {
    console.log('🕐 Running daily mentor activity snapshot...');
    
    try {
      const result = await createDailySnapshots();
    } catch (error) {
      console.error('❌ Snapshot failed:', error);
    }
  }, {
    timezone: "Europe/Sofia" 
  });
  
  console.log('✅ Mentor activity cron job started (runs daily at 00:05 Sofia time)');
};

module.exports = { startMentorActivityCron };