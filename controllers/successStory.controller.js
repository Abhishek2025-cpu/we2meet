const SuccessStory = require("../models/successStory.model");
const cloudinary = require("../config/cloudinary");

exports.createSuccessStory = async (req, res) => {
  try {
    const { userId, story } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    const successStory = await SuccessStory.create({
      userId,
      story,
      image: req.file.path // Cloudinary URL
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

    if (req.body.story) {
      story.story = req.body.story;
    }

    if (req.file) {

      // Delete old Cloudinary image (optional)
      if (story.image) {
        try {

          const publicId = story.image
            .split("/")
            .slice(-2)
            .join("/")
            .replace(/\.[^/.]+$/, "");

          await cloudinary.uploader.destroy(publicId);

        } catch (err) {
          console.log("Old image delete failed:", err.message);
        }
      }

      story.image = req.file.path; // New Cloudinary URL
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