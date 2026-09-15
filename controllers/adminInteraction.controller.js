const Favorite = require("../models/favorite.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

const USER_FIELDS =
  "legalName email phone primaryProfilePhoto isActive gender location profession profileCompletionPercentage";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getValidDate = (value, fieldName) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${fieldName} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }

  return date;
};

exports.getAdminFavorites = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const search = String(req.query.search || req.query.q || "").trim();
    const favoritedBy = req.query.userId || req.query.favoritedBy;
    const favoritedProfile = req.query.favoriteUserId || req.query.favoritedProfile;
    const startDate = getValidDate(req.query.startDate, "startDate");
    const endDate = getValidDate(req.query.endDate, "endDate");

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be after endDate"
      });
    }

    const filter = {};

    if (favoritedBy && !mongoose.isValidObjectId(favoritedBy)) {
      return res.status(400).json({ success: false, message: "userId must be a valid user ID" });
    }
    if (favoritedProfile && !mongoose.isValidObjectId(favoritedProfile)) {
      return res.status(400).json({ success: false, message: "favoriteUserId must be a valid user ID" });
    }

    // Aggregation pipelines do not cast strings to ObjectIds, unlike find().
    if (favoritedBy) filter.userId = new mongoose.Types.ObjectId(favoritedBy);
    if (favoritedProfile) {
      filter.favoriteUserId = new mongoose.Types.ObjectId(favoritedProfile);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) {
        // A date-only endDate should include all favourites created that day.
        if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.endDate)) {
          endDate.setUTCHours(23, 59, 59, 999);
        }
        filter.createdAt.$lte = endDate;
      }
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { legalName: { $regex: escapeRegex(search), $options: "i" } },
          { email: { $regex: escapeRegex(search), $options: "i" } },
          { phone: { $regex: escapeRegex(search), $options: "i" } }
        ]
      })
        .select("_id")
        .lean();

      const matchingUserIds = matchingUsers.map((user) => user._id);
      if (!matchingUserIds.length) {
        return res.status(200).json({
          success: true,
          total: 0,
          page,
          limit,
          totalPages: 1,
          count: 0,
          records: [],
          summary: {
            totalFavorites: 0,
            uniqueUsersWhoFavorited: 0,
            uniqueFavoritedProfiles: 0
          },
          analytics: { monthlyFavorites: [], mostFavoritedProfiles: [] }
        });
      }

      filter.$or = [
        { userId: { $in: matchingUserIds } },
        { favoriteUserId: { $in: matchingUserIds } }
      ];
    }

    const analyticsStart = new Date();
    analyticsStart.setUTCMonth(analyticsStart.getUTCMonth() - 11, 1);
    analyticsStart.setUTCHours(0, 0, 0, 0);

    const analyticsFilter = { ...filter };
    if (!analyticsFilter.createdAt) {
      analyticsFilter.createdAt = { $gte: analyticsStart };
    }

    const [filteredTotal, favorites, summaryRows, monthlyRows, topProfiles] = await Promise.all([
      Favorite.countDocuments(filter),
      Favorite.find(filter)
        .populate("userId", USER_FIELDS)
        .populate("favoriteUserId", USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Favorite.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalFavorites: { $sum: 1 },
            usersWhoFavorited: { $addToSet: "$userId" },
            favoritedProfiles: { $addToSet: "$favoriteUserId" }
          }
        },
        {
          $project: {
            _id: 0,
            totalFavorites: 1,
            uniqueUsersWhoFavorited: { $size: "$usersWhoFavorited" },
            uniqueFavoritedProfiles: { $size: "$favoritedProfiles" }
          }
        }
      ]),
      Favorite.aggregate([
        { $match: analyticsFilter },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Favorite.aggregate([
        { $match: filter },
        { $group: { _id: "$favoriteUserId", favoriteCount: { $sum: 1 } } },
        { $sort: { favoriteCount: -1, _id: 1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "profile"
          }
        },
        { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            favoriteUserId: "$_id",
            favoriteCount: 1,
            profile: {
              _id: "$profile._id",
              legalName: "$profile.legalName",
              email: "$profile.email",
              phone: "$profile.phone",
              primaryProfilePhoto: "$profile.primaryProfilePhoto",
              isActive: "$profile.isActive"
            }
          }
        }
      ])
    ]);

    const summary = summaryRows[0] || {
      totalFavorites: 0,
      uniqueUsersWhoFavorited: 0,
      uniqueFavoritedProfiles: 0
    };

    const monthlyCountByKey = new Map(
      monthlyRows.map((row) => [
        `${row._id.year}-${String(row._id.month).padStart(2, "0")}`,
        row.count
      ])
    );
    const monthlyFavorites = Array.from({ length: 12 }, (_, index) => {
      const month = new Date(Date.UTC(
        analyticsStart.getUTCFullYear(),
        analyticsStart.getUTCMonth() + index,
        1
      ));
      const key = `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
      return { month: key, count: monthlyCountByKey.get(key) || 0 };
    });

    return res.status(200).json({
      success: true,
      total: filteredTotal,
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit) || 1,
      count: favorites.length,
      // Explicit names make the direction of each relationship clear in an admin table.
      records: favorites.map((favorite) => ({
        ...favorite,
        favoritedBy: favorite.userId,
        favoritedProfile: favorite.favoriteUserId
      })),
      summary,
      analytics: {
        monthlyFavorites,
        mostFavoritedProfiles: topProfiles
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAdminFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findByIdAndDelete(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Favorite deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
