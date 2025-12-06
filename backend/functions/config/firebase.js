const admin = require("firebase-admin");
const { initializeApp } = require("../util/firesequelize");

let firebaseApp;

const isFirebaseProd =
  process.env.FUNCTIONS_EMULATOR !== "true" &&
  process.env.K_SERVICE;

const initializeFirebase = () => {
  try {
    if (firebaseApp) return firebaseApp;

    if (isFirebaseProd) {
      firebaseApp = admin.initializeApp();
      console.log("✅ Firebase initialized in PRODUCTION mode");
    } else {
      const serviceAccount = require("./firebase-adminsdk.json");

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.DATABASE_URL,
        storageBucket: process.env.STORAGE_BUCKET,
      });

      console.log("✅ Firebase initialized in DEVELOPMENT mode");
      console.log("Storage Bucket:", process.env.STORAGE_BUCKET);
    }

    initializeApp(admin);
    return firebaseApp;
  } catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
    throw error;
  }
};

// ✅ Firestore
const getFirestore = () => {
  if (!firebaseApp) initializeFirebase();
  return admin.firestore();
};

// ✅ Storage
const getStorage = () => {
  if (!firebaseApp) initializeFirebase();
  return admin.storage();
};

module.exports = {
  admin,
  initializeFirebase,
  getFirestore,
  getStorage,
  db: getFirestore,
};
