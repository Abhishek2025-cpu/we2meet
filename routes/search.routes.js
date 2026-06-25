const express =
  require("express");

const router =
  express.Router();

const protect =
  require(
    "../middleware/auth.middleware"
  );

const {
  searchUsers,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  deleteRecentSearch
} = require(
  "../controllers/search.controller"
);

router.get(
  "/users",
  protect,
  searchUsers
);

router.post(
  "/recent",
  protect,
  saveRecentSearch
);

router.get(
  "/recent",
  protect,
  getRecentSearches
);

router.delete(
  "/recent/clear",
  protect,
  clearRecentSearches
);

router.delete(
  "/recent/:id",
  protect,
  deleteRecentSearch
);

module.exports = router;