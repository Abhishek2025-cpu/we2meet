const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const calculateProfileCompletion = require("../utils/profileCompletion");
const calculateMatchPercentage = require("../utils/matchPercentage");
const { generateToken } = require("../utils/jwt");
const { sendNotification } = require("../services/notification.service");
const { sendOtpEmail } = require("../services/email.service");
const BlockedUser = require("../models/blockUser.model");
const PhotoAccessRequest = require("../models/photoAccessRequest.model");

exports.createUser = async (req, res) => {
  try {
 const {
createdFor,
legalName,
email,
phone,
password,

gender,
dob,

religion,
caste,
subCaste,

motherTongue,

qualification,
college,
workingWith,
profession,
annualIncome,

fullName,
height,
weight,
location,
maritalStatus,
highestQualification,
country,
citizenship,
profileFor,

zodiacSign,
rasi,
dosa,

familyDetails,
partnerPreference,
lifeStyleDetails,
myStory,
kundaliDetails,
profiles,
lifestyle,
horoscope,
fcmToken
} = req.body;

    const exists = await User.findOne({
      $or: [
        { email },
        { phone }
      ]
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const primaryProfilePhoto = req.files?.primaryProfilePhoto?.[0]?.path || null;
    const profilePhotos = req.files?.profilePhoto?.map((file) => file.path) || [];
    const kundaliPhotos = req.files?.kundaliPhoto?.map((file) => file.path) || [];

    const user = await User.create({
    createdFor,
legalName,
email,
phone,
password: hashPassword,

gender,
dob,

religion,
caste,
subCaste,

motherTongue,

qualification,
college,
workingWith,
profession,
annualIncome,

fullName,
height,
weight,
location,
maritalStatus,
highestQualification,
country,
citizenship,
profileFor,

zodiacSign,
rasi,
dosa,

      profiles: profiles ? JSON.parse(profiles) : [],
      familyDetails: familyDetails ? JSON.parse(familyDetails) : {},
      partnerPreference: partnerPreference ? JSON.parse(partnerPreference) : {},
      lifeStyleDetails: lifeStyleDetails ? JSON.parse(lifeStyleDetails) : {},
      myStory: myStory ? JSON.parse(myStory) : {},

      kundaliDetails: {
        ...(kundaliDetails ? JSON.parse(kundaliDetails) : {}),
        kundaliPhotos
      },

      lifestyle: lifestyle
        ? (typeof lifestyle === "string" ? JSON.parse(lifestyle) : lifestyle)
        : {},

      horoscope: horoscope
        ? (typeof horoscope === "string" ? JSON.parse(horoscope) : horoscope)
        : {},

      primaryProfilePhoto,
      profilePhotos,
      freeUsedCount: 0,
      maxFreeLimit: 5,
      fcmTokens: fcmToken ? [fcmToken] : []
    });

    user.profileCompletionPercentage = calculateProfileCompletion(user);
    await user.save();

    if (user.fcmTokens?.length) {
      try {
        await sendNotification({
          userId: user._id,
          tokens: user.fcmTokens,
          title: "Welcome to We2Meet",
          message: "Your profile has been created successfully.",
          type: "welcome",
          data: {
            userId: user._id.toString()
          }
        });
      } catch (err) {
        console.error("FCM Error:", err.message);
      }
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: {
        token,
        ...userObj
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRecentJoins = async (req, res) => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const users = await User.find({
      createdAt: { $gte: fifteenDaysAgo }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      message: "Recent joined users fetched successfully",
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        ...userObj,
        profileCompletionPercentage: calculateProfileCompletion(user)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const {
      familyDetails,
      partnerPreference,
      lifeStyleDetails,
      myStory,
      kundaliDetails,
      profiles,
      lifestyle,
      horoscope
    } = req.body;

    Object.keys(req.body).forEach((key) => {
      if (
        ![
          "familyDetails",
          "partnerPreference",
          "lifeStyleDetails",
          "myStory",
          "kundaliDetails",
          "profiles",
          "lifestyle",
          "horoscope"
        ].includes(key)
      ) {
        user[key] = req.body[key];
      }
    });

    if (profiles) {
      user.profiles = JSON.parse(profiles);
    }

    if (familyDetails) {
      user.familyDetails = {
        ...user.familyDetails,
        ...JSON.parse(familyDetails)
      };
    }

    if (partnerPreference) {
      user.partnerPreference = {
        ...user.partnerPreference,
        ...JSON.parse(partnerPreference)
      };
    }

    if (lifeStyleDetails) {
      user.lifeStyleDetails = {
        ...user.lifeStyleDetails,
        ...JSON.parse(lifeStyleDetails)
      };
    }

    if (myStory) {
      user.myStory = {
        ...user.myStory,
        ...JSON.parse(myStory)
      };
    }

    if (kundaliDetails) {
      user.kundaliDetails = {
        ...user.kundaliDetails,
        ...JSON.parse(kundaliDetails)
      };
    }

    if (lifestyle) {
      user.lifestyle = {
        ...user.lifestyle,
        ...(typeof lifestyle === "string" ? JSON.parse(lifestyle) : lifestyle)
      };
    }

    if (horoscope) {
      user.horoscope = {
        ...user.horoscope,
        ...(typeof horoscope === "string" ? JSON.parse(horoscope) : horoscope)
      };
    }

    if (req.files?.primaryProfilePhoto?.[0]) {
      user.primaryProfilePhoto = req.files.primaryProfilePhoto[0].path;
    }

    if (req.files?.profilePhoto?.length) {
      const newPhotos = req.files.profilePhoto.map((file) => file.path);
      user.profilePhotos = [
        ...(user.profilePhotos || []),
        ...newPhotos
      ];
    }

    if (req.files?.kundaliPhoto?.length) {
      if (!user.kundaliDetails) {
        user.kundaliDetails = {};
      }
      const newKundaliPhotos = req.files.kundaliPhoto.map((file) => file.path);
      user.kundaliDetails.kundaliPhotos = [
        ...(user.kundaliDetails.kundaliPhotos || []),
        ...newKundaliPhotos
      ];
    }

    user.profileCompletionPercentage = calculateProfileCompletion(user);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userObj
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {

    const currentUser = await User.findById(req.user._id);

    // Users blocked by me
    const blockedByMe = await BlockedUser.find({
      blockedBy: req.user._id
    }).select("blockedUser");

    // Users who blocked me
    const blockedMe = await BlockedUser.find({
      blockedUser: req.user._id
    }).select("blockedBy");

    const excludedIds = [
      req.user._id,
      ...blockedByMe.map(item => item.blockedUser),
      ...blockedMe.map(item => item.blockedBy)
    ];

    const users = await User.find({
      _id: {
        $nin: excludedIds
      },
      isActive: true
    }).select("-password");

    const data = await Promise.all(
      users.map(async (user) => {

        const userObj = user.toObject();

        userObj.matchPercentage =
          calculateMatchPercentage(
            currentUser,
            user
          );

        // ============================
        // PHOTO PRIVACY
        // ============================

        if (
          user.photoVisibility === "private"
        ) {

          const approvedRequest =
            await PhotoAccessRequest.findOne({
              requestedBy: req.user._id,
              requestedTo: user._id,
              status: "approved"
            });

          if (!approvedRequest) {
            userObj.profilePhotos = [];
            userObj.primaryProfilePhoto = null;
          }
        }

        // ============================
        // CONTACT PRIVACY
        // ============================

        if (
          user.contactVisibility === "private"
        ) {
          userObj.phone = null;
          userObj.email = null;
        }

        return userObj;

      })
    );

    return res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getUserById = async (req, res) => {
  try {

    const currentUser = await User.findById(
      req.user._id
    );

    const blocked = await BlockedUser.findOne({
      $or: [
        {
          blockedBy: req.user._id,
          blockedUser: req.params.id
        },
        {
          blockedBy: req.params.id,
          blockedUser: req.user._id
        }
      ]
    });

    if (blocked) {
      return res.status(403).json({
        success: false,
        message:
          "This profile is not available."
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      isActive: true
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userObj = user.toObject();

    userObj.matchPercentage =
      calculateMatchPercentage(
        currentUser,
        user
      );

    // ============================
    // PHOTO PRIVACY
    // ============================

    if (
      user.photoVisibility === "private" &&
      String(user._id) !== String(req.user._id)
    ) {

      const approvedRequest =
        await PhotoAccessRequest.findOne({
          requestedBy: req.user._id,
          requestedTo: user._id,
          status: "approved"
        });

      if (!approvedRequest) {
        userObj.profilePhotos = [];
        userObj.primaryProfilePhoto = null;
      }
    }

    // ============================
    // CONTACT PRIVACY
    // ============================

    if (
      user.contactVisibility === "private" &&
      String(user._id) !== String(req.user._id)
    ) {
      userObj.phone = null;
      userObj.email = null;
    }

    return res.json({
      success: true,
      data: userObj
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.incrementFreeCount = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user.freeUsedCount < user.maxFreeLimit) {
    user.freeUsedCount += 1;
    await user.save();
  }

  res.json({
    success: true,
    freeUsedCount: user.freeUsedCount,
    remaining: user.maxFreeLimit - user.freeUsedCount
  });
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password are required"
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        isActive: false
      }
    );

    res.json({
      success: true,
      message: "Account deactivated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        isActive: true
      }
    );

    res.json({
      success: true,
      message: "Account activated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.togglePhotoVisibility = async (req, res) => {
    console.log("==== PHOTO VISIBILITY API HIT ====");
  console.log(req.originalUrl);
  try {
    const { visibility } = req.body;

    if (!["public", "private"].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be public or private"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        photoVisibility: visibility
      },
      {
        new: true
      }
    ).select("photoVisibility");

    return res.status(200).json({
      success: true,
      message: `Photos are now ${visibility}.`,
      data: user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


exports.toggleContactVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;

    if (!["public", "private"].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be public or private"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        contactVisibility: visibility
      },
      {
        new: true
      }
    ).select("contactVisibility");

    return res.status(200).json({
      success: true,
      message: `Contact visibility is now ${visibility}.`,
      data: user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getContactVisibility = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .select("contactVisibility");

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required"
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email or phone number"
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (user.email) {
      try {
        await sendOtpEmail(user.email, otp);
      } catch (emailErr) {
        console.log("Email sending error:", emailErr.message);
        console.log("OTP delivery failed, test OTP code:", otp);
      }
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your registered email/phone"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: "Identifier and OTP are required"
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code"
      });
    }

    const resetToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { identifier, resetToken, newPassword } = req.body;
    if (!identifier || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please login with your new password."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};