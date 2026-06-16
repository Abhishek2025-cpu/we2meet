const SuccessStory = require(
  "../models/successStory.model"
);

exports.createSuccessStory =
  async (req, res) => {
    try {
      const { userId, story } =
        req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Image is required"
        });
      }

      const image =
        `${process.env.BASE_URL}/uploads/profile/${req.file.filename}`;

      const successStory =
        await SuccessStory.create({
          userId,
          story,
          image
        });

      res.status(201).json({
        success: true,
        message:
          "Success story created successfully",
        data: successStory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.getAllSuccessStories =
  async (req, res) => {
    try {
      const stories =
        await SuccessStory.find()
          .populate(
            "userId",
            "legalName profilePhotos"
          )
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        count: stories.length,
        data: stories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.getSuccessStoryById =
  async (req, res) => {
    try {
      const story =
        await SuccessStory.findById(
          req.params.id
        ).populate(
          "userId",
          "legalName profilePhotos"
        );

      if (!story) {
        return res.status(404).json({
          success: false,
          message:
            "Story not found"
        });
      }

      res.json({
        success: true,
        data: story
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.updateSuccessStory =
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

      if (req.body.story) {
        story.story =
          req.body.story;
      }

      if (req.file) {
        story.image =
          `${process.env.BASE_URL}/uploads/profile/${req.file.filename}`;
      }

      await story.save();

      res.json({
        success: true,
        message:
          "Success story updated",
        data: story
      });
    } catch (error) {
      res.status(500).json({
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