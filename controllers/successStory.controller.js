const SuccessStory = require("../models/successStory.model");
const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");
exports.createSuccessStory = async (req, res) => {
  try {

    const {
      partnerName,
      meetingDate,
      story
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    const user = await User.findById(req.user._id)
      .select("legalName");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const successStory = await SuccessStory.create({

      userId: req.user._id,

      partnerName,

      coupleName: `${user.legalName} & ${partnerName}`,

      meetingDate,

      story,

      image: req.file.path

    });

    return res.status(201).json({

      success: true,
      message: "Success story created successfully",
      data: successStory

    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getAllSuccessStories = async (req, res) => {
  try {

    const stories = await SuccessStory.find()
      .populate(
        "userId",
        "legalName profilePhotos primaryProfilePhoto"
      )
      .sort({
        createdAt: -1
      });

    return res.json({
      success: true,
      count: stories.length,
      data: stories
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getSuccessStoryById = async (req, res) => {
  try {

    const story = await SuccessStory.findById(req.params.id)
      .populate(
        "userId",
        "legalName profilePhotos primaryProfilePhoto"
      );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    return res.json({
      success: true,
      data: story
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.updateSuccessStory = async (req, res) => {
  try {

    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    if (!story.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const user = await User.findById(req.user._id)
      .select("legalName");

    if (req.body.partnerName) {
      story.partnerName = req.body.partnerName;
    }

    if (req.body.meetingDate) {
      story.meetingDate = req.body.meetingDate;
    }

    if (req.body.story) {
      story.story = req.body.story;
    }

    story.coupleName =
      `${user.legalName} & ${story.partnerName}`;

    if (req.file) {

      if (story.image) {
        try {

          const publicId = story.image
            .split("/")
            .slice(-2)
            .join("/")
            .replace(/\.[^/.]+$/, "");

          await cloudinary.uploader.destroy(publicId);

        } catch (err) {
          console.log(err.message);
        }
      }

      story.image = req.file.path;
    }

    await story.save();

    return res.json({
      success: true,
      message: "Success story updated successfully",
      data: story
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.deleteSuccessStory = async (req, res) => {
  try {

    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    if (story.image) {
      try {

        const publicId = story.image
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.[^/.]+$/, "");

        await cloudinary.uploader.destroy(publicId);

      } catch (err) {
        console.log("Cloudinary delete failed:", err.message);
      }
    }

    await SuccessStory.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Success story deleted successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};




  exports.deleteSuccessStory =
  async (req, res) => {
    try {
      const story =
        await SuccessStory.findById(
          req.params.id
        );

      if (!story) {
        return res.status(404).json({
          success: false,
          message:
            "Story not found"
        });
      }

      await story.deleteOne();

      res.json({
        success: true,
        message:
          "Success story deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };