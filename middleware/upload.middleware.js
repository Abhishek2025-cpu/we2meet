const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/profile");
  },

  filename(req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1000000) +
        path.extname(file.originalname)
    );
  }
});

module.exports = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
   const allowed = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "application/pdf"
];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only jpg, jpeg, png and webp files allowed"
        )
      );
    }
  }
});