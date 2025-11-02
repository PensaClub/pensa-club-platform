// server/src/firebase/firebaseAdmin.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;
let firebaseDb = null;

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebaseAdmin = () => {
  if (firebaseApp) {
    return { app: firebaseApp, db: firebaseDb };
  }

  try {
    // Development: Use service account JSON file
    if (process.env.NODE_ENV !== 'production') {
      const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
      
      // ✅ ПРОВЕРИ ДАЛИ ФАЙЛЪТ СЪЩЕСТВУВА
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
      }

      const serviceAccount = require(serviceAccountPath);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://pensaclub-909e0-default-rtdb.europe-west1.firebasedatabase.app'
      });

    } 
    // Production: Use environment variables
    else {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });

    }

    firebaseDb = admin.database();
    return { app: firebaseApp, db: firebaseDb };

  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
};

/**
 * Get Firebase Database instance
 */
const getFirebaseDb = () => {
  if (!firebaseDb) {
    const { db } = initializeFirebaseAdmin();
    return db;
  }
  return firebaseDb;
};

/**
 * Get Firebase Admin App instance
 */
const getFirebaseApp = () => {
  if (!firebaseApp) {
    const { app } = initializeFirebaseAdmin();
    return app;
  }
  return firebaseApp;
};

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseDb,
  getFirebaseApp,
  admin
};