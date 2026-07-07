const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  getMatches,
  getPreferences,
  updatePreferences,
  resetPreferences,
  getFilterOptions
} = require("../controllers/matches.controller");

// ─────────────────────────────────────────────────────────────────────────────
// All routes require authentication
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/matches
 * @desc    Get paginated list of matches with optional preference-based filters.
 *
 * Query params (all optional):
 *   ageMin, ageMax               – age range (years)
 *   heightMin, heightMax         – height range (cm)
 *   maritalStatus                – comma-separated or JSON array
 *   religions                    – comma-separated or JSON array
 *   motherTongues                – comma-separated or JSON array
 *   castes                       – comma-separated or JSON array
 *   qualifications               – comma-separated or JSON array
 *   workingWith                  – comma-separated or JSON array
 *   professions                  – comma-separated or JSON array
 *   annualIncomeMin              – number
 *   annualIncomeMax              – number
 *   dietaryPreference            – comma-separated or JSON array
 *   smoking                      – true | false
 *   drinking                     – true | false
 *   familyStatus                 – comma-separated or JSON array
 *   familyType                   – comma-separated or JSON array
 *   familyValues                 – comma-separated or JSON array
 *   manglik                      – true | false
 *   gender                       – string
 *   minMatchPercentage           – number (0-100)
 *   sortBy                       – "matchPercentage" | "newest" | "oldest"
 *   page                         – page number (default: 1)
 *   limit                        – results per page (default: 20, max: 100)
 *
 * @access  Private
 */
router.get("/", protect, getMatches);

/**
 * @route   POST /api/matches/filter
 * @desc    Same as GET /api/matches but accepts filters in the request body
 *          (useful for complex filter objects with arrays).
 * @access  Private
 */
router.post("/filter", protect, getMatches);

// ─────────────────────────────────────────────────────────────────────────────
// Preferences sub-resource
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/matches/preferences
 * @desc    Get the current user's saved partner preferences.
 * @access  Private
 */
router.get("/preferences", protect, getPreferences);

/**
 * @route   PATCH /api/matches/preferences
 * @desc    Save / update partner preferences (deep-merged).
 *
 * Body (all optional):
 *   ageRange:          { min, max }
 *   heightRange:       { min, max }
 *   maritalStatus:     [String]
 *   religions:         [String]
 *   motherTongues:     [String]
 *   castes:            [String]
 *   annualIncomeMin:   Number
 *   annualIncomeMax:   Number
 *   dietaryPreference: [String]
 *   smoking:           Boolean
 *   drinking:          Boolean
 *   familyStatus:      [String]
 *   familyType:        [String]
 *   familyValues:      [String]
 *   manglik:           Boolean
 *
 * @access  Private
 */
router.patch("/preferences", protect, updatePreferences);

/**
 * @route   DELETE /api/matches/preferences
 * @desc    Reset / clear all saved partner preferences.
 * @access  Private
 */
router.delete("/preferences", protect, resetPreferences);

// ─────────────────────────────────────────────────────────────────────────────
// Filter options (for populating Flutter filter dropdowns)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/matches/filter-options
 * @desc    Returns all distinct values for each filterable field so the
 *          app can populate dropdowns dynamically from real DB data.
 * @access  Private
 */
router.get("/filter-options", protect, getFilterOptions);

module.exports = router;
