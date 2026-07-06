const {
  initializeApp,
  cert,
  getApps
} = require("firebase-admin/app");

const admin = require("firebase-admin");

const serviceAccount = require(
  "../we2meet-3c7d1-firebase-adminsdk-fbsvc-3432fa6b2e.json"
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });

  console.log("Firebase Initialized Successfully");
}

module.exports = admin;