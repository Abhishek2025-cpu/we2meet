const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const calculateProfileCompletion = require("../utils/profileCompletion");

const { generateToken } = require("../utils/jwt");

exports.createUser = async (req, res) => {
  try {
    console.log("BODY =>", req.body);
    console.log("FILES =>", req.files);
   

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

      familyDetails,
      partnerPreference,
      lifeStyleDetails,
      myStory,
      kundaliDetails,
      profiles
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

    const hashPassword = await bcrypt.hash(
      password,
      10
    );

  let profilePhoto = null;
let kundaliPhoto = null;

if (req.files?.profilePhoto?.[0]) {
  profilePhoto =
    `${process.env.BASE_URL}/uploads/profile/${req.files.profilePhoto[0].filename}`;
}

if (req.files?.kundaliPhoto?.[0]) {
  kundaliPhoto =
    `${process.env.BASE_URL}/uploads/profile/${req.files.kundaliPhoto[0].filename}`;
}

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

      profiles: profiles
        ? JSON.parse(profiles)
        : [],

      familyDetails: familyDetails
        ? JSON.parse(familyDetails)
        : {},

      partnerPreference: partnerPreference
        ? JSON.parse(partnerPreference)
        : {},

      lifeStyleDetails: lifeStyleDetails
        ? JSON.parse(lifeStyleDetails)
        : {},

      myStory: myStory
        ? JSON.parse(myStory)
        : {},

      kundaliDetails: {
        ...(kundaliDetails
          ? JSON.parse(kundaliDetails)
          : {}),
        kundaliPhoto
      },

      profilePhoto,

      freeUsedCount: 0,
      maxFreeLimit: 5
    });

    user.profileCompletionPercentage =
      calculateProfileCompletion(user);

    await user.save();

    const token = generateToken(user._id);

    const userObj = user.toObject();

    delete userObj.password;

    return res.status(201).json({
      success: true,
      message:
        "Profile created successfully",
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



exports.login = async (req, res) => {
  try {
    const { identifier, password } =
      req.body;

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

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    user.profileCompletionPercentage =
      calculateProfileCompletion(user);

    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: user
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
    const user = await User.findById(
      req.params.id
    );

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
      profiles
    } = req.body;

    Object.keys(req.body).forEach((key) => {
      if (
        ![
          "familyDetails",
          "partnerPreference",
          "lifeStyleDetails",
          "myStory",
          "kundaliDetails",
          "profiles"
        ].includes(key)
      ) {
        user[key] = req.body[key];
      }
    });

    if (profiles) {
      user.profiles =
        JSON.parse(profiles);
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

    if (
      req.files?.profilePhoto?.[0]
    ) {
      user.profilePhoto =
        `${process.env.BASE_URL}/uploads/profile/${req.files.profilePhoto[0].filename}`;
    }

    if (
      req.files?.kundaliPhoto?.[0]
    ) {
      if (!user.kundaliDetails) {
        user.kundaliDetails = {};
      }

      user.kundaliDetails.kundaliPhoto =
        `${process.env.BASE_URL}/uploads/kundali/${req.files.kundaliPhoto[0].filename}`;
    }

    user.profileCompletionPercentage =
      calculateProfileCompletion(user);

    await user.save();

    const userObj = user.toObject();

    delete userObj.password;

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
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
  const users = await User.find().select(
    "-password"
  );

  res.json({
    success: true,
    data: users
  });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(
    req.params.id
  ).select("-password");

  res.json({
    success: true,
    data: user
  });
};

exports.incrementFreeCount = async (
  req,
  res
) => {
  const user = await User.findById(
    req.params.id
  );

  if (
    user.freeUsedCount <
    user.maxFreeLimit
  ) {
    user.freeUsedCount += 1;
    await user.save();
  }

  res.json({
    success: true,
    freeUsedCount: user.freeUsedCount,
    remaining:
      user.maxFreeLimit -
      user.freeUsedCount
  });
};