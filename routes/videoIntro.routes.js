const express =
require("express");

const router =
express.Router();

const protect =
require(
"../middleware/auth.middleware"
);

const upload =
require(
"../middleware/videoUpload.middleware"
);

const {
uploadVideoIntro,
getMyVideoIntro,
getVideoByUserId,
deleteVideoIntro
} = require(
"../controllers/videoIntro.controller"
);

router.post(
"/upload",
protect,
upload.single("video"),
uploadVideoIntro
);

router.get(
"/my-video",
protect,
getMyVideoIntro
);

router.get(
"/user/:userId",
protect,
getVideoByUserId
);

router.delete(
"/delete",
protect,
deleteVideoIntro
);

module.exports = router;
