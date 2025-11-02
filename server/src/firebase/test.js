// server/src/firebase/test.js

const { initializeFirebaseAdmin } = require('./firebaseAdmin');
const { getMentorFirebaseStats } = require('./firebaseChatReader');

const testFirebase = async () => {
  try {
    console.log('🔥 Initializing Firebase...');
    initializeFirebaseAdmin();
    
    console.log('📊 Testing mentor stats...');
    // Използвай реален mentorId от твоята база (email преобразуван)
    const stats = await getMentorFirebaseStats('test_mentor_id');
    
    console.log('✅ Stats:', stats);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testFirebase();