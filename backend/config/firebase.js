const admin = require('firebase-admin');
const { initializeApp } = require('../util/firesequelize');
const serviceAccount = require('./firebase-adminsdk.json');

let firebaseApp;

const initializeFirebase = () => {
  try {
    if (firebaseApp) {
      return firebaseApp;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    initializeApp(admin);

    console.log('Firebase Admin SDK initialized successfully');
    console.log('Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    throw error;
  }
};

// Get Firestore instance
const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.firestore();
};

// Get Storage instance
const getStorage = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.storage();
};

module.exports = {
  admin,
  initializeFirebase,
  getFirestore,
  getStorage,
  db: getFirestore
};
