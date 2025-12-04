const { initializeFirebase, getFirestore } = require('./firebase');

const connectDB = async () => {
  try {
    // Initialize Firebase
    initializeFirebase();
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Test Firestore connection with a health check
    await db.collection('_health_check').doc('test').set({
      timestamp: new Date().toISOString(),
      status: 'connected'
    });
    
    console.log('✅ Firebase Firestore Connected Successfully');
    return db;
  } catch (error) {
    console.error(`❌ Firebase Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
