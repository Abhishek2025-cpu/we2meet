const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const calculateProfileCompletion = require("../utils/profileCompletion");
const calculateMatchPercentage = require("../utils/matchPercentage");

const { generateToken } = require("../utils/jwt");
const {
  sendNotification
} = require(
  "../services/notification.service"
)

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

  const primaryProfilePhoto =
  req.files?.primaryProfilePhoto?.[0]
    ?.path || null;

const profilePhotos =
  req.files?.profilePhoto?.map(
    file => file.path
  ) || [];

const kundaliPhotos =
  req.files?.kundaliPhoto?.map(
    file =>
      `${process.env.BASE_URL}/uploads/kundali/${file.filename}`
  ) || [];

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
    kundaliPhotos
  },
  primaryProfilePhoto,
  profilePhotos,

  freeUsedCount: 0,
  maxFreeLimit: 5
});

    user.profileCompletionPercentage =
      calculateProfileCompletion(user);

    await user.save();
await sendNotification({
  userId: user._id,
  tokens:
    user.fcmTokens || [],
  title:
    "Welcome to We2Meet",
  message:
    "Your profile has been created successfully.",
  type: "welcome",
  data: {
    userId:
      user._id.toString()
  }
});
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

exports.getRecentJoins = async (req, res) => {
  try {
    const fifteenDaysAgo = new Date();

    fifteenDaysAgo.setDate(
      fifteenDaysAgo.getDate() - 15
    );

    const users = await User.find({
      createdAt: {
        $gte: fifteenDaysAgo
      }
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

    const token = generateToken(user._id);

    const userObj = user.toObject();

    delete userObj.password;

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        ...userObj,
        profileCompletionPercentage:
          calculateProfileCompletion(user)
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
    console.log("DB Name:", mongoose.connection.name);
console.log("DB Host:", mongoose.connection.host);
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
  req.files?.primaryProfilePhoto?.[0]
) {
 user.primaryProfilePhoto =
req.files.primaryProfilePhoto[0].path;
}

   if (req.files?.profilePhoto?.length) {
const newPhotos =
req.files.profilePhoto.map(
(file) => file.path
);

  user.profilePhotos = [
    ...(user.profilePhotos || []),
    ...newPhotos
  ];
}

  if (req.files?.kundaliPhoto?.length) {
  if (!user.kundaliDetails) {
    user.kundaliDetails = {};
  }

  const newKundaliPhotos =
req.files.kundaliPhoto.map(
(file) => file.path
);

  user.kundaliDetails.kundaliPhotos = [
    ...(user.kundaliDetails.kundaliPhotos || []),
    ...newKundaliPhotos
  ];
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



exports.getAllUsers = async (
req,
res
) => {
try {
const currentUser =
await User.findById(
req.user._id
);

```
const users =
  await User.find({
    _id: {
      $ne: req.user._id
    }
  }).select("-password");

const data = users.map(
  (user) => ({
    ...user.toObject(),
    matchPercentage:
      calculateMatchPercentage(
        currentUser,
        user
      )
  })
);

return res.json({
  success: true,
  data
});
```

} catch (error) {
return res.status(500).json({
success: false,
message: error.message
});
}
};

exports.getUserById = async (
req,
res
) => {
try {
const currentUser =
await User.findById(
req.user._id
);

```
const user =
  await User.findById(
    req.params.id
  ).select("-password");

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found"
  });
}

const userObj =
  user.toObject();

userObj.matchPercentage =
  calculateMatchPercentage(
    currentUser,
    user
  );

return res.json({
  success: true,
  data: userObj
});
```

} catch (error) {
return res.status(500).json({
success: false,
message: error.message
});
}
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