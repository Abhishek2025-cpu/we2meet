const express = require("express");
const router = express.Router();

const {
  getPublicBanners,
  getBannerByIdAdmin
} = require("../controllers/banner.controller");

router.get("/", getPublicBanners);
router.get("/all", getPublicBanners);
router.get("/:id", getBannerByIdAdmin);

module.exports = router;
