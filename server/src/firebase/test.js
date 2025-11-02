// server/src/firebase/test.js

const { initializeFirebaseAdmin } = require('./firebaseAdmin');
const { getMentorFirebaseStats } = require('./firebaseChatReader');

const testFirebase = async () => {
  try {
    initializeFirebaseAdmin();
    
    // Използвай реален mentorId от твоята база (email преобразуван)
    const stats = await getMentorFirebaseStats('test_mentor_id');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testFirebase();