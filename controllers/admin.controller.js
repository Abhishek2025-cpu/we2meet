const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const User = require("../models/user.model");


const generateAdminToken = require(
  "../utils/adminToken"
);

exports.getAllPlanClicks = async (req, res) => {
  try {
    const data = await PlanInterest.find()
      .populate(
        "userId",
        "legalName phone email primaryProfilePhoto" // Added profile photo here
      )
      .populate(
        "planId",
        "planName price"
      )
      .sort({ createdAt: -1 });

    // Filter out records where the user was deleted (userId is null)
    const validData = data.filter(item => item.userId !== null);

    res.json({
      success: true,
      count: validData.length,
      data: validData
    });
  } catch (error) {
    console.error("PLAN CLICK ERROR =>", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.createAdmin = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    const exists =
      await Admin.findOne({
        email
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Admin already exists"
      });
    }

    const admin =
      await Admin.create({
        name,
        email,
        password,
        role
      });

    res.status(201).json({
      success: true,
      message:
        "Admin created successfully",
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.adminLogin = async (
  req,
  res
) => {
  try {
    const {
      email,
      password
    } = req.body;

    const admin =
      await Admin.findOne({
        email
      });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials"
      });
    }

    if (
      password !== admin.password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials"
      });
    }

    const token =
      generateAdminToken(
        admin._id
      );

    res.json({
      success: true,
      token,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.updateAdmin = async (
  req,
  res
) => {
  try {
    const admin =
      await Admin.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    res.json({
      success: true,
      message:
        "Admin updated successfully",
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAdmin = async (
  req,
  res
) => {
  try {
    await Admin.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message:
        "Admin deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllUsersAdmin =
  async (req, res) => {
    try {
      const users =
        await User.find().select(
          "-password"
        );

      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };


  exports.getUserByIdAdmin =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        ).select("-password");

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };


  exports.deleteUserAdmin =
  async (req, res) => {
    try {
      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "User deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };


  exports.getAllAdmins = async (
  req,
  res
) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const PlanInterest = require(
  "../models/planInterest.model"
);
