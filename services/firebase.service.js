const admin = require("firebase-admin");

const serviceAccount = require(
  "../we2meet-3c7d1-firebase-adminsdk-fbsvc-3432fa6b2e.json"
);

admin.initializeApp({
  credential:
    admin.credential.cert(
      serviceAccount
    )
});

module.exports = admin;