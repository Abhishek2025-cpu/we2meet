const admin = require("firebase-admin");

const Notification = require(
  "../models/notification.model"
);

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

    if (tokens.length > 0) {
      await admin
        .messaging()
        .sendEachForMulticast({
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
        });
    }
  } catch (error) {
    console.log(
      "Notification Error:",
      error.message
    );
  }
};

module.exports = {
  sendNotification
};