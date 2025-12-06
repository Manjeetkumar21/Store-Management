const { initializeFirebase, getFirestore } = require('./firebase');

const connectDB = async () => {
  try {
    // Initialize Firebase
    initializeFirebase();
    
    // Get Firestore instance
    const db = getFirestore();
    
    console.log('✅ Firebase Firestore Connected Successfully');
    return db;
  } catch (error) {
    console.error(`❌ Firebase Connection Error: ${error.message}`);
    throw error; // Let Firebase Functions handle the error
  }
};

module.exports = connectDB;
