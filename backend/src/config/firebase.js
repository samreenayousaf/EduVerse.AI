<<<<<<< HEAD
const admin = require('firebase-admin');
const path  = require('path');
require('dotenv').config();

const initFirebase = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  // Load service account key file
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!keyPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH not set in .env');
  }

  let serviceAccount;
  try {
    serviceAccount = require(path.resolve(keyPath));
  } catch (e) {
    throw new Error(
      `Cannot find serviceAccountKey.json at: ${path.resolve(keyPath)}\n` +
      'Make sure you placed the file in the backend/ folder.'
    );
  }

  admin.initializeApp({
    credential:    admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log(`✅ Firebase Admin connected → project: ${serviceAccount.project_id}`);
  return admin.apps[0];
};

initFirebase();

const db      = admin.firestore();
const auth    = admin.auth();
const storage = admin.storage();

db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db, auth, storage };
=======
import { initializeApp }  from 'firebase/app';
import { getFirestore }   from 'firebase/firestore';
import { getAuth }        from 'firebase/auth';
import { getStorage }     from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app        = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
>>>>>>> 30c4da64c42faa392b769f2f7be775f12ccc86f4
