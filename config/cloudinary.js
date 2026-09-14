const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "gcdxpmdv",
  api_key: process.env.CLOUDINARY_API_KEY || "693849475358432",
  api_secret: process.env.CLOUDINARY_API_SECRET || "ZgJVjkr0wrzvSVu4O9sTzGxDjVM"
});

module.exports = cloudinary;