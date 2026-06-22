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

      if (
        file.fieldname ===
        "kundaliPhoto"
      ) {
        folder =
          "we2meet/kundali";
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