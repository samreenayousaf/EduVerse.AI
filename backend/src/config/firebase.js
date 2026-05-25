const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const initFirebase = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!keyPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH not set in .env');
  }

  let serviceAccount;
  try {
    serviceAccount = require(path.resolve(keyPath));
  } catch (e) {
    throw new Error(
      `Cannot find serviceAccountKey.json at: ${path.resolve(keyPath)}`
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log(`Firebase Admin connected → ${serviceAccount.project_id}`);
  return admin.app();
};

initFirebase();

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db, auth, storage };