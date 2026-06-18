const Interest = require(
  "../models/interest.model"
);

const Favorite = require(
  "../models/favorite.model"
);

const ProfileLike = require(
  "../models/profileLike.model"
);

const Report = require(
  "../models/report.model"
);

const Notification = require(
  "../models/notification.model"
);



exports.sendInterest = async (
  req,
  res
) => {
  try {
    const exists =
      await Interest.findOne({
        senderId: req.user._id,
        receiverId:
          req.body.receiverId
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Interest already sent"
      });
    }

    const interest =
      await Interest.create({
        senderId: req.user._id,
        receiverId:
          req.body.receiverId
      });

    await Notification.create({
      userId: req.body.receiverId,
      title: "New Interest",
      message:
        "Someone sent you an interest",
      type: "interest"
    });

    res.json({
      success: true,
      message:
        "Interest sent successfully",
      data: interest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.acceptInterest =
  async (req, res) => {
    try {
      const interest =
        await Interest.findById(
          req.params.id
        );

      interest.status =
        "Accepted";

      await interest.save();

      await Notification.create({
        userId:
          interest.senderId,
        title:
          "Interest Accepted",
        message:
          "Your interest was accepted",
        type: "interest"
      });

      res.json({
        success: true,
        message:
          "Interest accepted"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };


  exports.rejectInterest =
  async (req, res) => {
    try {
      const interest =
        await Interest.findById(
          req.params.id
        );

      interest.status =
        "Rejected";

      await interest.save();

      await Notification.create({
        userId:
          interest.senderId,
        title:
          "Interest Rejected",
        message:
          "Your interest was rejected",
        type: "interest"
      });

      res.json({
        success: true,
        message:
          "Interest rejected"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };


  exports.addFavorite = async (
  req,
  res
) => {
  try {
    const favorite =
      await Favorite.create({
        userId: req.user._id,
        favoriteUserId:
          req.body.userId
      });

    await Notification.create({
      userId: req.body.userId,
      title:
        "Added To Favorites",
      message:
        "Someone added your profile to favorites",
      type: "favorite"
    });

    res.json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.likeProfile = async (
  req,
  res
) => {
  try {
    const like =
      await ProfileLike.create({
        userId: req.user._id,
        likedUserId:
          req.body.userId
      });

    await Notification.create({
      userId: req.body.userId,
      title: "Profile Liked",
      message:
        "Someone liked your profile",
      type: "like"
    });

    res.json({
      success: true,
      data: like
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.reportProfile =
  async (req, res) => {
    try {
      const report =
        await Report.create({
          reportedBy:
            req.user._id,
          reportedUser:
            req.body.userId,
          reason:
            req.body.reason,
          description:
            req.body.description
        });

      res.json({
        success: true,
        message:
          "Report submitted",
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.getSentInterests = async (
  req,
  res
) => {
  try {
    const interests =
      await Interest.find({
        senderId: req.user._id
      })
        .populate(
          "receiverId",
          "legalName email phone primaryProfilePhoto"
        )
        .sort({
          createdAt: -1
        });

    res.json({
      success: true,
      count: interests.length,
      data: interests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getReceivedInterests =
  async (req, res) => {
    try {
      const interests =
        await Interest.find({
          receiverId:
            req.user._id
        })
          .populate(
            "senderId",
            "legalName email phone primaryProfilePhoto"
          )
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        count:
          interests.length,
        data: interests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

  exports.getFavorites =
  async (req, res) => {
    try {
      const favorites =
        await Favorite.find({
          userId:
            req.user._id
        })
          .populate(
            "favoriteUserId",
            "legalName email phone primaryProfilePhoto"
          )
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        count:
          favorites.length,
        data: favorites
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };


  exports.getLikes = async (
  req,
  res
) => {
  try {
    const likes =
      await ProfileLike.find({
        userId: req.user._id
      })
        .populate(
          "likedUserId",
          "legalName email phone primaryProfilePhoto"
        )
        .sort({
          createdAt: -1
        });

    res.json({
      success: true,
      count: likes.length,
      data: likes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getReports = async (
  req,
  res
) => {
  try {
    const reports =
      await Report.find()
        .populate(
          "reportedBy",
          "legalName email phone"
        )
        .populate(
          "reportedUser",
          "legalName email phone"
        )
        .sort({
          createdAt: -1
        });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.removeFavorite =
  async (req, res) => {
    try {
      const favorite =
        await Favorite.findOneAndDelete(
          {
            _id:
              req.params.id,
            userId:
              req.user._id
          }
        );

      if (!favorite) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Favorite not found"
          });
      }

      res.json({
        success: true,
        message:
          "Favorite removed successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

  exports.removeLike = async (
  req,
  res
) => {
  try {
    const like =
      await ProfileLike.findOneAndDelete(
        {
          _id:
            req.params.id,
          userId:
            req.user._id
        }
      );

    if (!like) {
      return res.status(404).json({
        success: false,
        message:
          "Like not found"
      });
    }

    res.json({
      success: true,
      message:
        "Like removed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};