const multer = require("multer");

const storage =
multer.memoryStorage();

module.exports = multer({
storage,
limits: {
fileSize:
50 * 1024 * 1024
},
fileFilter(
req,
file,
cb
) {
const allowed = [
"video/mp4",
"video/quicktime",
"video/x-msvideo"
];


if (
  allowed.includes(
    file.mimetype
  )
) {
  cb(null, true);
} else {
  cb(
    new Error(
      "Only video files allowed"
    )
  );
}


}
});
