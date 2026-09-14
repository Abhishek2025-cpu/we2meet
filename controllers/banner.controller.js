const Banner = require("../models/banner.model");
const cloudinary = require("../config/cloudinary");

// Helper to extract public ID from Cloudinary URL
const extractCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  try {
    const parts = imageUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex !== -1) {
      let relevantParts = parts.slice(uploadIndex + 1);
      // Strip Cloudinary version tag (e.g., v1712345678)
      if (relevantParts[0] && /^v\d+$/.test(relevantParts[0])) {
        relevantParts = relevantParts.slice(1);
      }
      const publicIdWithExt = relevantParts.join("/");
      return publicIdWithExt.replace(/\.[^/.]+$/, "");
    }
    return null;
  } catch (err) {
    return null;
  }
};

// Safe date parsing to prevent CastError
const parseSafeDate = (dateVal) => {
  if (
    !dateVal ||
    dateVal === "null" ||
    dateVal === "undefined" ||
    dateVal === ""
  ) {
    return null;
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

// Normalize position enum values (case-insensitive)
const normalizePosition = (pos) => {
  if (!pos || typeof pos !== "string") return "Header";
  const map = {
    header: "Header",
    home: "Home",
    sidebar: "Sidebar",
    footer: "Footer"
  };
  const key = pos.trim().toLowerCase();
  return map[key] || "Header";
};

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
    console.error("GET BANNER STATS ERROR =>", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllBannersAdmin = async (req, res) => {
  try {
    const { position, isActive, search } = req.query;
    const filter = {};

    if (position) {
      filter.position = normalizePosition(position);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true || isActive === "1";
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const banners = await Banner.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error("GET ALL BANNERS ADMIN ERROR =>", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBannerByIdAdmin = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error("GET BANNER BY ID ERROR =>", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPublicBanners = async (req, res) => {
  try {
    const now = new Date();
    const { position } = req.query;

    const filter = {
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
    };

    if (position) {
      filter.position = normalizePosition(position);
    }

    const banners = await Banner.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error("GET PUBLIC BANNERS ERROR =>", error);
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
      targetUrl,
      position,
      isActive,
      startDate,
      endDate
    } = req.body || {};

    // Image URL can come from Cloudinary multer file or direct URL in body
    const imageUrl = req.file ? req.file.path : req.body?.imageUrl;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required"
      });
    }

    const parsedIsActive =
      isActive !== undefined
        ? isActive === true || isActive === "true" || isActive === "1"
        : true;

    const parsedStartDate = parseSafeDate(startDate);
    const parsedEndDate = parseSafeDate(endDate);
    const parsedPosition = normalizePosition(position);

    const banner = await Banner.create({
      title: title.trim(),
      description: description || "",
      imageUrl,
      targetUrl: targetUrl || "",
      position: parsedPosition,
      isActive: parsedIsActive,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      createdBy: req.admin?._id || null
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner
    });
  } catch (error) {
    console.error("CREATE BANNER ERROR =>", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    const {
      title,
      description,
      targetUrl,
      position,
      isActive,
      startDate,
      endDate
    } = req.body || {};

    // If new image file is uploaded via multer
    if (req.file) {
      // Delete previous image from Cloudinary if it existed
      if (banner.imageUrl) {
        const publicId = extractCloudinaryPublicId(banner.imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (destroyErr) {
            console.error(
              "Failed to delete previous Cloudinary banner image:",
              destroyErr.message
            );
          }
        }
      }
      banner.imageUrl = req.file.path;
    } else if (req.body.imageUrl) {
      banner.imageUrl = req.body.imageUrl;
    }

    if (title !== undefined && title.trim()) banner.title = title.trim();
    if (description !== undefined) banner.description = description;
    if (targetUrl !== undefined) banner.targetUrl = targetUrl;
    if (position !== undefined) banner.position = normalizePosition(position);

    if (isActive !== undefined) {
      banner.isActive =
        isActive === true || isActive === "true" || isActive === "1";
    }

    if (startDate !== undefined) {
      banner.startDate = parseSafeDate(startDate);
    }

    if (endDate !== undefined) {
      banner.endDate = parseSafeDate(endDate);
    }

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner
    });
  } catch (error) {
    console.error("UPDATE BANNER ERROR =>", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    // Delete image from Cloudinary
    if (banner.imageUrl) {
      const publicId = extractCloudinaryPublicId(banner.imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (destroyErr) {
          console.error(
            "Failed to delete banner image from Cloudinary:",
            destroyErr.message
          );
        }
      }
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully"
    });
  } catch (error) {
    console.error("DELETE BANNER ERROR =>", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
