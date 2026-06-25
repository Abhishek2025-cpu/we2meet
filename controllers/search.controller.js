const User =
  require("../models/user.model");

const RecentSearch =
  require(
    "../models/recentSearch.model"
  );

exports.searchUsers =
  async (req, res) => {
    try {
      const {
        keyword
      } = req.query;

      const users =
        await User.find({
          _id: {
            $ne:
              req.user._id
          },

          $or: [
            {
              legalName: {
                $regex:
                  keyword,
                $options:
                  "i"
              }
            },
            {
              city: {
                $regex:
                  keyword,
                $options:
                  "i"
              }
            },
            {
              religion: {
                $regex:
                  keyword,
                $options:
                  "i"
              }
            }
          ]
        }).select(
          "-password"
        );

      res.json({
        success: true,
        count:
          users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.saveRecentSearch =
  async (req, res) => {
    try {
      const {
        searchedUserId
      } = req.body;

      await RecentSearch.findOneAndDelete(
        {
          userId:
            req.user._id,
          searchedUserId
        }
      );

      await RecentSearch.create({
        userId:
          req.user._id,
        searchedUserId
      });

      res.json({
        success: true,
        message:
          "Search saved"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.getRecentSearches =
  async (req, res) => {
    try {
      const data =
        await RecentSearch.find(
          {
            userId:
              req.user._id
          }
        )
          .populate(
            "searchedUserId",
            "legalName age primaryProfilePhoto city religion"
          )
          .sort({
            createdAt:
              -1
          })
          .limit(20);

      res.json({
        success: true,
        count:
          data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.clearRecentSearches =
  async (req, res) => {
    try {
      await RecentSearch.deleteMany(
        {
          userId:
            req.user._id
        }
      );

      res.json({
        success: true,
        message:
          "Recent searches cleared"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.deleteRecentSearch =
  async (req, res) => {
    try {
      await RecentSearch.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Search removed"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };