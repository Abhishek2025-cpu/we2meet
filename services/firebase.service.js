const {
  initializeApp,
  cert,
  getApps
} = require("firebase-admin/app");

const admin = require("firebase-admin");

if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined
  };

  initializeApp({
    credential: cert(serviceAccount)
  });

  console.log("Firebase Initialized Successfully");
}

module.exports = admin;