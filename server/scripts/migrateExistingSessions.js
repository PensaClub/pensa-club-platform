// server/scripts/migrateExistingSessions.js

// ✅ ЗАРЕДИ .env ПЪРВО!
require('dotenv').config();

const { migrateAllMentorsSessions } = require('../src/services/sessionSyncService');
const { initializeFirebaseAdmin } = require('../src/firebase/firebaseAdmin');

(async () => {
  try {
    
    initializeFirebaseAdmin();
    
    const result = await migrateAllMentorsSessions();
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED!', error);
    process.exit(1);
  }
})();