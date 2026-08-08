const { getMessaging } = require("firebase-admin/messaging");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const sendNotification = async ({
  userId,
  tokens = [],
  title,
  message,
  type = "general",
  data = {}
}) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      data
    });

    if (tokens.length === 0) {

      return;
    }

    const payload = {
      tokens,
      notification: {
        title,
        body: message
      },
      data: Object.keys(data).reduce(
        (acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        },
        {}
      )
    };

    console.log(`Sending payload via FCM...`);
    const response = await getMessaging().sendEachForMulticast(payload);

    console.log(`FCM Multicast Response:`);
    console.log(`  Success Count: ${response.successCount}`);
    console.log(`  Failure Count: ${response.failureCount}`);

    if (response.failureCount > 0) {
      const tokensToRemove = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.log(`  ❌ Failed Token [Index: ${idx}] error code: ${resp.error.code}, message: ${resp.error.message}`);

          const error = resp.error;
          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            tokensToRemove.push(tokens[idx]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pull: { fcmTokens: { $in: tokensToRemove } }
        });
        console.log(`  🧹 Pruned ${tokensToRemove.length} inactive FCM token(s) for user ${userId}`);
      }
    } else {
      console.log(`  ✅ All push notifications sent successfully!`);
    }

    console.log(`--- [sendNotification End] ---\n`);
  } catch (error) {
    console.log(
      "❌ Notification Try-Catch Error:",
      error.stack || error.message
    );
    console.log(`--- [sendNotification End] ---\n`);
  }
};

module.exports = {
  sendNotification
};