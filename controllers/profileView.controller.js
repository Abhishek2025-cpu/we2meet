const ProfileView = require(
  "../models/profileView.model"
);
const PhotoAccessRequest = require(
  "../models/photoAccessRequest.model"
);

const hidePrivatePhotosWithoutAccess = async (
  profile,
  currentUserId
) => {
  if (
    !profile ||
    profile.photoVisibility !== "private" ||
    String(profile._id) === String(currentUserId)
  ) {
    return profile;
  }

  const approvedRequest =
    await PhotoAccessRequest.findOne({
      requestedBy: currentUserId,
      requestedTo: profile._id,
      status: "approved"
    });

  if (!approvedRequest) {
    profile.profilePhotos = [];
    profile.primaryProfilePhoto = null;
  }

  return profile;
};

const applyPhotoPrivacyToViews = async (
  views,
  profileField,
  currentUserId
) => Promise.all(
  views.map(async (view) => {
    const viewObj = view.toObject();

    await hidePrivatePhotosWithoutAccess(
      viewObj[profileField],
      currentUserId
    );

    return viewObj;
  })
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

      const data = await applyPhotoPrivacyToViews(
        views,
        "viewerId",
        req.user._id
      );

      res.json({
        success: true,
        count: data.length,
        data
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

      const data = await applyPhotoPrivacyToViews(
        views,
        "viewedUserId",
        req.user._id
      );

      res.json({
        success: true,
        count: data.length,
        data
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

      const data = await applyPhotoPrivacyToViews(
        views,
        "viewerId",
        req.user._id
      );

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
