const SuccessStory = require("../models/SuccessStory");



exports.createStory = async (req, res) => {
    try {
        const { title, story } = req.body;

        if (!title || !story) {
            return res.status(400).json({
                success: false,
                message: "Title and story are required",
            });
        }

        const existingStory = await SuccessStory.findOne({
            userId: req.user.id,
        });

        if (existingStory) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted a success story",
            });
        }

        const images =
            req.files?.map((file) => `${process.env.BASE_URL}/uploads/${file.filename}`) || [];

        const successStory = await SuccessStory.create({
            userId: req.user.id,
            title,
            story,
            images,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Success story submitted successfully",
            data: successStory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getAllStories = async (req, res) => {
    try {
        const stories = await SuccessStory.find({
            status: "approved",
        })
            .populate(
                "userId",
                "legalName photos.primaryPhoto location.city location.state"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



exports.getMyStories = async (req, res) => {
    try {
        const stories = await SuccessStory.find({
            userId: req.user.id,
        })
            .populate(
                "userId",
                "legalName photos.primaryPhoto location.city location.state"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};





exports.updateStory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, story } = req.body;

        const successStory = await SuccessStory.findOne({
            _id: id,
            userId: req.user.id,
        });

        if (!successStory) {
            return res.status(404).json({
                success: false,
                message: "Story not found",
            });
        }

        let isUpdated = false;

        if (title) {
            successStory.title = title;
            isUpdated = true;
        }

        if (story) {
            successStory.story = story;
            isUpdated = true;
        }

        if (req.files?.length) {
            successStory.images = req.files.map(
                (file) => file.path || file.location
            );
            isUpdated = true;
        }

        if (isUpdated) {
            successStory.status = "pending";
        }

        await successStory.save();

        return res.status(200).json({
            success: true,
            message: "Story updated successfully",
            data: successStory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};





exports.deleteStory = async (req, res) => {
    try {
        const { id } = req.params;

        const story = await SuccessStory.findOne({
            _id: id,
            userId: req.user.id,
        });

        if (!story) {
            return res.status(404).json({
                success: false,
                message: "Story not found",
            });
        }

        await story.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Story deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};