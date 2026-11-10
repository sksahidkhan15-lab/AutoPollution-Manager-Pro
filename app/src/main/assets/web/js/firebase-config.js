/**
 * AutoPollution Manager Pro - Official Firebase Web SDK Configuration
 * Compatible with GitHub Pages and Firebase Hosting.
 * Fill in your Firebase project web configuration from the Firebase Console.
 */

const firebaseConfig = {
  apiKey: "AIzaSy_YOUR_FIREBASE_WEB_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase if valid SDK is present and not dummy placeholder
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();

    // Enable offline persistence for Cloud Firestore
    firebaseDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('[Firebase] Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('[Firebase] Current browser does not support offline persistence.');
      }
    });

    console.log('[Firebase] Connected to Cloud Firestore & Firebase Authentication.');
  }
} catch (e) {
  console.log('[Firebase] Running in offline-first mode with IndexedDB/LocalStorage fallback.');
}

window.firebaseApp = firebaseApp;
window.firebaseAuth = firebaseAuth;
window.firebaseDb = firebaseDb;
