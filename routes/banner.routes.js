const express = require("express");
const router = express.Router();

const {
  getPublicBanners
} = require("../controllers/banner.controller");

router.get("/", getPublicBanners);
router.get("/all", getPublicBanners);

module.exports = router;
