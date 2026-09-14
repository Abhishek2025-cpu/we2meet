const multer = require("multer");
const {
  CloudinaryStorage
} = require("multer-storage-cloudinary");

const cloudinary = require(
  "../config/cloudinary"
);

const storage =
  new CloudinaryStorage({
    cloudinary,
    params: async (
      req,
      file
    ) => {
      let folder = "we2meet/profile";

      if (file.fieldname === "kundaliPhoto") {
        folder = "we2meet/kundali";
      } else if (
        req.baseUrl?.includes("banner") ||
        req.originalUrl?.includes("banner") ||
        file.fieldname === "banner" ||
        file.fieldname === "bannerImage"
      ) {
        folder = "we2meet/banners";
      } else if (
        req.baseUrl?.includes("success-stories") ||
        req.originalUrl?.includes("success-stories")
      ) {
        folder = "we2meet/success-stories";
      } else if (
        req.baseUrl?.includes("admin-notifications") ||
        req.originalUrl?.includes("admin-notifications")
      ) {
        folder = "we2meet/notifications";
      }

      return {
        folder,
        resource_type: "auto"
      };
    }
  });

module.exports = multer({
  storage,
  limits: {
    fileSize:
      5 * 1024 * 1024
  }
});