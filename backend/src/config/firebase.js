const admin = require('firebase-admin');
require('dotenv').config();

const initFirebase = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  let serviceAccount;

  // Production (Render) - environment variable se
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT env variable invalid JSON hai');
    }
  }
  // Development (Local) - file se
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const path = require('path');
    try {
      serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    } catch (e) {
      throw new Error(
        `Cannot find serviceAccountKey.json at: ${path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)}`
      );
    }
  }
  else {
    throw new Error('Firebase credentials not set. FIREBASE_SERVICE_ACCOUNT ya FIREBASE_SERVICE_ACCOUNT_PATH chahiye.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log(`✅ Firebase Admin connected → ${serviceAccount.project_id}`);
  return admin.app();
};

initFirebase();

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db, auth, storage };