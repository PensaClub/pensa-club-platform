// server/scripts/migrateExistingSessions.js

// ✅ ЗАРЕДИ .env ПЪРВО!
require('dotenv').config();

const { migrateAllMentorsSessions } = require('../src/services/sessionSyncService');
const { initializeFirebaseAdmin } = require('../src/firebase/firebaseAdmin');

(async () => {
  try {
    console.log('🔄 Starting migration of existing sessions...');
    
    initializeFirebaseAdmin();
    
    const result = await migrateAllMentorsSessions();
    
    console.log('\n✅ MIGRATION COMPLETED!');
    console.log(`Total mentors: ${result.totalMentors}`);
    console.log(`Total sessions synced: ${result.totalSessionsSynced}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED!', error);
    process.exit(1);
  }
})();