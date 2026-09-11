const Banner = require("../models/banner.model");

exports.getBannerStats = async (req, res) => {
  try {
    const [totalBanners, activeBanners] = await Promise.all([
      Banner.countDocuments(),
      Banner.countDocuments({ isActive: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBanners,
        activeBanners
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPublicBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      targetUrl,
      position,
      isActive,
      startDate,
      endDate
    } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and imageUrl are required"
      });
    }

    const banner = await Banner.create({
      title,
      description: description || "",
      imageUrl,
      targetUrl: targetUrl || "",
      position: position || "Header",
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || null,
      endDate: endDate || null,
      createdBy: req.admin?._id || null
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
