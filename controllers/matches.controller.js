const User = require("../models/user.model");
const calculateMatchPercentage = require("../utils/matchPercentage");

/**
 * Compute age in years from a Date object or ISO string.
 */
function getAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Build a MongoDB query object from the validated filter preferences.
 *
 * Supported filters (all optional):
 *  - ageMin / ageMax          → derived from dob
 *  - heightMin / heightMax    → user.height  (cm)
 *  - maritalStatus            → [String]
 *  - religions                → [String]
 *  - motherTongues            → [String]
 *  - castes                   → [String]
 *  - qualifications           → [String]
 *  - workingWith              → [String]
 *  - professions              → [String]
 *  - annualIncomeMin / annualIncomeMax → Number
 *  - dietaryPreference        → [String]  (matches lifeStyleDetails.dietaryPreference)
 *  - smoking                  → Boolean
 *  - drinking                 → Boolean
 *  - familyStatus             → [String]  (matches familyDetails.familyStatus)
 *  - familyType               → [String]  (matches familyDetails.familyType)
 *  - familyValues             → [String]  (matches familyDetails.familyValues)
 *  - manglik                  → Boolean   (kundaliDetails.manglik)
 *  - minMatchPercentage       → Number    (post-DB filter, applied in JS)
 *  - sortBy                   → "matchPercentage" | "newest" | "oldest"   (default: matchPercentage)
 *  - page / limit             → pagination (default: page=1, limit=20)
 */
function buildMongoFilter(currentUserId, filters) {
  const query = {
    _id: { $ne: currentUserId },
    isActive: true
  };

  // ─── Age filter (convert age range → DOB range) ───────────────────────────
  const ageMin = Number(filters.ageMin);
  const ageMax = Number(filters.ageMax);
  if (!isNaN(ageMin) || !isNaN(ageMax)) {
    const now = new Date();
    query.dob = {};
    if (!isNaN(ageMin)) {
      // ageMin → dobMax (older DOBs = younger minimum age)
      const dobMax = new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate());
      query.dob.$lte = dobMax;
    }
    if (!isNaN(ageMax)) {
      // ageMax → dobMin (the earliest DOB accepted)
      const dobMin = new Date(now.getFullYear() - ageMax - 1, now.getMonth(), now.getDate());
      query.dob.$gte = dobMin;
    }
  }

  // ─── Height filter ────────────────────────────────────────────────────────
  const heightMin = Number(filters.heightMin);
  const heightMax = Number(filters.heightMax);
  if (!isNaN(heightMin) || !isNaN(heightMax)) {
    query.height = {};
    if (!isNaN(heightMin)) query.height.$gte = heightMin;
    if (!isNaN(heightMax)) query.height.$lte = heightMax;
  }

  // ─── Array / enum filters ─────────────────────────────────────────────────
  const addArrayFilter = (field, value) => {
    if (Array.isArray(value) && value.length > 0) {
      query[field] = { $in: value };
    }
  };

  addArrayFilter("maritalStatus", filters.maritalStatus);
  addArrayFilter("religion", filters.religions);
  addArrayFilter("motherTongue", filters.motherTongues);
  addArrayFilter("caste", filters.castes);
  addArrayFilter("qualification", filters.qualifications);
  addArrayFilter("workingWith", filters.workingWith);
  addArrayFilter("profession", filters.professions);

  // ─── Annual Income ────────────────────────────────────────────────────────
  const incomeMin = Number(filters.annualIncomeMin);
  const incomeMax = Number(filters.annualIncomeMax);
  if (!isNaN(incomeMin) || !isNaN(incomeMax)) {
    query.annualIncome = {};
    if (!isNaN(incomeMin)) query.annualIncome.$gte = incomeMin;
    if (!isNaN(incomeMax)) query.annualIncome.$lte = incomeMax;
  }

  // ─── Lifestyle filters ────────────────────────────────────────────────────
  if (Array.isArray(filters.dietaryPreference) && filters.dietaryPreference.length > 0) {
    query["lifeStyleDetails.dietaryPreference"] = { $in: filters.dietaryPreference };
  }

  if (filters.smoking !== undefined && filters.smoking !== null) {
    query["lifeStyleDetails.smoking"] = Boolean(filters.smoking);
  }

  if (filters.drinking !== undefined && filters.drinking !== null) {
    query["lifeStyleDetails.drinking"] = Boolean(filters.drinking);
  }

  // ─── Family filters ───────────────────────────────────────────────────────
  if (Array.isArray(filters.familyStatus) && filters.familyStatus.length > 0) {
    query["familyDetails.familyStatus"] = { $in: filters.familyStatus };
  }

  if (Array.isArray(filters.familyType) && filters.familyType.length > 0) {
    query["familyDetails.familyType"] = { $in: filters.familyType };
  }

  if (Array.isArray(filters.familyValues) && filters.familyValues.length > 0) {
    query["familyDetails.familyValues"] = { $in: filters.familyValues };
  }

  // ─── Kundali / Manglik ────────────────────────────────────────────────────
  if (filters.manglik !== undefined && filters.manglik !== null) {
    query["kundaliDetails.manglik"] = Boolean(filters.manglik);
  }

  // ─── Gender: show opposite or specified gender ────────────────────────────
  if (filters.gender) {
    query.gender = filters.gender;
  }

  return query;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/matches
// Returns paginated list of matches with optional preference filters.
// Requires: Bearer token (protected route)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found"
      });
    }

    // ── Parse query / body filters (support both GET query params & POST body)
    const rawFilters = {
      ...req.query,
      ...(req.body || {})
    };

    // ── Pagination ────────────────────────────────────────────────────────────
    const page = Math.max(1, parseInt(rawFilters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(rawFilters.limit) || 20));
    const skip = (page - 1) * limit;

    // ── Sort mode ─────────────────────────────────────────────────────────────
    const sortBy = rawFilters.sortBy || "matchPercentage";

    // ── Parse array filters from query string (comma-separated or JSON arrays)
    const parseArrayParam = (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val.filter(Boolean);
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (_) {
        // comma-separated string
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [val];
    };

    const parseBoolParam = (val) => {
      if (val === undefined || val === null || val === "") return undefined;
      if (typeof val === "boolean") return val;
      return val === "true" || val === "1";
    };

    const filters = {
      ageMin: rawFilters.ageMin,
      ageMax: rawFilters.ageMax,
      heightMin: rawFilters.heightMin,
      heightMax: rawFilters.heightMax,
      maritalStatus: parseArrayParam(rawFilters.maritalStatus),
      religions: parseArrayParam(rawFilters.religions),
      motherTongues: parseArrayParam(rawFilters.motherTongues),
      castes: parseArrayParam(rawFilters.castes),
      qualifications: parseArrayParam(rawFilters.qualifications),
      workingWith: parseArrayParam(rawFilters.workingWith),
      professions: parseArrayParam(rawFilters.professions),
      annualIncomeMin: rawFilters.annualIncomeMin,
      annualIncomeMax: rawFilters.annualIncomeMax,
      dietaryPreference: parseArrayParam(rawFilters.dietaryPreference),
      smoking: parseBoolParam(rawFilters.smoking),
      drinking: parseBoolParam(rawFilters.drinking),
      familyStatus: parseArrayParam(rawFilters.familyStatus),
      familyType: parseArrayParam(rawFilters.familyType),
      familyValues: parseArrayParam(rawFilters.familyValues),
      manglik: parseBoolParam(rawFilters.manglik),
      gender: rawFilters.gender || undefined,
      minMatchPercentage: rawFilters.minMatchPercentage
        ? Number(rawFilters.minMatchPercentage)
        : 0
    };

    // ── Build DB query ─────────────────────────────────────────────────────────
    const mongoQuery = buildMongoFilter(currentUser._id, filters);

    // ── Fetch from DB ──────────────────────────────────────────────────────────
    let mongoSort = {};
    if (sortBy === "newest") mongoSort = { createdAt: -1 };
    else if (sortBy === "oldest") mongoSort = { createdAt: 1 };
    // For matchPercentage we sort in JS after calculating

    const usersQuery = User.find(mongoQuery)
      .select("-password -fcmTokens")
      .lean();

    if (sortBy !== "matchPercentage") {
      usersQuery.sort(mongoSort);
    }

    const allMatchedUsers = await usersQuery;

    // ── Calculate match percentage for each user ───────────────────────────────
    let usersWithScore = allMatchedUsers.map((user) => ({
      ...user,
      age: getAge(user.dob),
      matchPercentage: calculateMatchPercentage(currentUser, user)
    }));

    // ── Post-DB filter: minimum match percentage ───────────────────────────────
    if (filters.minMatchPercentage > 0) {
      usersWithScore = usersWithScore.filter(
        (u) => u.matchPercentage >= filters.minMatchPercentage
      );
    }

    // ── Sort by matchPercentage if requested ───────────────────────────────────
    if (sortBy === "matchPercentage") {
      usersWithScore.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    // ── Paginate ───────────────────────────────────────────────────────────────
    const total = usersWithScore.length;
    const paginatedUsers = usersWithScore.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      message: "Matches fetched successfully",
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      },
      data: paginatedUsers
    });
  } catch (error) {
    console.error("getMatches error:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/matches/preferences
// Returns the current user's saved partner preferences.
// ─────────────────────────────────────────────────────────────────────────────
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("partnerPreference");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Partner preferences fetched successfully",
      data: user.partnerPreference || {}
    });
  } catch (error) {
    console.error("getPreferences error:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/matches/preferences
// Saves / updates the current user's partner preferences.
//
// Body (all optional, merges with existing):
// {
//   ageRange:       { min: Number, max: Number },
//   heightRange:    { min: Number, max: Number },
//   maritalStatus:  [String],
//   religions:      [String],
//   motherTongues:  [String],
//   castes:         [String],
//   annualIncomeMin: Number,
//   annualIncomeMax: Number,
//   dietaryPreference: [String],
//   smoking:        Boolean,
//   drinking:       Boolean,
//   familyStatus:   [String],
//   familyType:     [String],
//   familyValues:   [String],
//   manglik:        Boolean
// }
// ─────────────────────────────────────────────────────────────────────────────
exports.updatePreferences = async (req, res) => {
  try {
    const allowedFields = [
      "ageRange",
      "heightRange",
      "maritalStatus",
      "religions",
      "motherTongues",
      "castes",
      "annualIncomeMin",
      "annualIncomeMax",
      "dietaryPreference",
      "smoking",
      "drinking",
      "familyStatus",
      "familyType",
      "familyValues",
      "manglik"
    ];

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Deep merge: keep existing fields, overwrite only what was sent
    const incoming = req.body;
    const existing = user.partnerPreference || {};
    const updated = { ...existing };

    allowedFields.forEach((field) => {
      if (incoming[field] !== undefined) {
        // For objects like ageRange / heightRange, merge nested keys
        if (
          incoming[field] !== null &&
          typeof incoming[field] === "object" &&
          !Array.isArray(incoming[field])
        ) {
          updated[field] = {
            ...(existing[field] || {}),
            ...incoming[field]
          };
        } else {
          updated[field] = incoming[field];
        }
      }
    });

    user.partnerPreference = updated;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Partner preferences updated successfully",
      data: user.partnerPreference
    });
  } catch (error) {
    console.error("updatePreferences error:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/matches/preferences
// Resets / clears all saved partner preferences.
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPreferences = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { partnerPreference: "" }
    });

    return res.status(200).json({
      success: true,
      message: "Partner preferences reset successfully",
      data: {}
    });
  } catch (error) {
    console.error("resetPreferences error:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/matches/filter-options
// Returns all distinct values available in the DB for each filterable field
// so the Flutter app can populate its filter dropdowns dynamically.
// ─────────────────────────────────────────────────────────────────────────────
exports.getFilterOptions = async (req, res) => {
  try {
    const [
      religions,
      motherTongues,
      castes,
      qualifications,
      workingWithList,
      professions,
      dietaryPreferences,
      familyStatuses,
      familyTypes,
      familyValuesOptions,
      maritalStatuses
    ] = await Promise.all([
      User.distinct("religion"),
      User.distinct("motherTongue"),
      User.distinct("caste"),
      User.distinct("qualification"),
      User.distinct("workingWith"),
      User.distinct("profession"),
      User.distinct("lifeStyleDetails.dietaryPreference"),
      User.distinct("familyDetails.familyStatus"),
      User.distinct("familyDetails.familyType"),
      User.distinct("familyDetails.familyValues"),
      User.distinct("maritalStatus")
    ]);

    const clean = (arr) => arr.filter(Boolean).sort();

    return res.status(200).json({
      success: true,
      message: "Filter options fetched successfully",
      data: {
        religions: clean(religions),
        motherTongues: clean(motherTongues),
        castes: clean(castes),
        qualifications: clean(qualifications),
        workingWith: clean(workingWithList),
        professions: clean(professions),
        dietaryPreference: clean(dietaryPreferences),
        familyStatus: clean(familyStatuses),
        familyType: clean(familyTypes),
        familyValues: clean(familyValuesOptions),
        maritalStatus: clean(maritalStatuses)
      }
    });
  } catch (error) {
    console.error("getFilterOptions error:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
