const express = require("express");
const router = express.Router();

const {
  getPublicBanners
} = require("../controllers/banner.controller");

router.get("/all", getPublicBanners);

module.exports = router;
