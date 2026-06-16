const ProfileView = require(
  "../models/profileView.model"
);

exports.addProfileView =
  async (req, res) => {
    try {
      const viewerId = req.user._id;
      const { viewedUserId } = req.body;

      if (
        viewerId.toString() ===
        viewedUserId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot view own profile"
        });
      }

      const existing =
        await ProfileView.findOne({
          viewerId,
          viewedUserId
        });

      if (existing) {
        existing.viewCount += 1;
        existing.lastViewedAt =
          new Date();

        await existing.save();

        return res.json({
          success: true,
          message:
            "View updated"
        });
      }

      await ProfileView.create({
        viewerId,
        viewedUserId
      });

      res.json({
        success: true,
        message:
          "Profile viewed"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };






  exports.getViewedMe =
  async (req, res) => {
    try {
      const views =
        await ProfileView.find({
          viewedUserId:
            req.user._id
        })
          .populate(
            "viewerId",
            "-password"
          )
          .sort({
            lastViewedAt: -1
          });

      res.json({
        success: true,
        count: views.length,
        data: views
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };



  exports.getIViewed =
  async (req, res) => {
    try {
      const views =
        await ProfileView.find({
          viewerId: req.user._id
        })
          .populate(
            "viewedUserId",
            "-password"
          )
          .sort({
            lastViewedAt: -1
          });

      res.json({
        success: true,
        count: views.length,
        data: views
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };


  exports.getRecentViewedMe =
  async (req, res) => {
    try {
      const fifteenDaysAgo =
        new Date();

      fifteenDaysAgo.setDate(
        fifteenDaysAgo.getDate() - 15
      );

      const views =
        await ProfileView.find({
          viewedUserId:
            req.user._id,
          lastViewedAt: {
            $gte:
              fifteenDaysAgo
          }
        })
          .populate(
            "viewerId",
            "-password"
          )
          .sort({
            lastViewedAt: -1
          });

      res.json({
        success: true,
        count: views.length,
        data: views
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };