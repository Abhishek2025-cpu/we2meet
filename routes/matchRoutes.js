const express = require("express");
const router = express.Router();

const {
    getMatches
} = require("../controllers/matchController");

router.get("/:userId", getMatches);

module.exports = router;