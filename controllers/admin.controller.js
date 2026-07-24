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
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false
      },
      {
        new: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      message: "User suspended successfully",
      data: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: true
      },
      {
        new: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      message: "User activated successfully",
      data: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchAndFilterUsers = async (req, res) => {
  try {
    const {
      search,
      gender,
      city,
      state,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    // Search
    if (search) {
      filter.$or = [
        {
          legalName: {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          email: {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          phone: {
            $regex: search.trim(),
            $options: "i"
          }
        }
      ];
    }

    // Gender (Case Insensitive)
    if (gender) {
      filter.gender = {
        $regex: `^${gender.trim()}$`,
        $options: "i"
      };
    }

    // City
    if (city) {
      filter.city = {
        $regex: city.trim(),
        $options: "i"
      };
    }

    // State
    if (state) {
      filter.state = {
        $regex: state.trim(),
        $options: "i"
      };
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: users.length,
      data: users
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const BlockUser = require("../models/blockUser.model");

exports.getAllBlockedUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = ""
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        {
          "blockedBy.legalName": {
            $regex: search,
            $options: "i"
          }
        },
        {
          "blockedUser.legalName": {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    const blocks = await BlockUser.find()
      .populate(
        "blockedBy",
        "legalName phone email gender primaryProfilePhoto"
      )
      .populate(
        "blockedUser",
        "legalName phone email gender primaryProfilePhoto isActive"
      )
      .sort({ createdAt: -1 });

    let data = blocks;

    if (search) {
      data = blocks.filter((item) => {
        const blocker =
          item.blockedBy?.legalName?.toLowerCase() || "";

        const blocked =
          item.blockedUser?.legalName?.toLowerCase() || "";

        return (
          blocker.includes(search.toLowerCase()) ||
          blocked.includes(search.toLowerCase())
        );
      });
    }

    const total = data.length;

    const paginated = data.slice(
      (page - 1) * limit,
      page * limit
    );

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      count: paginated.length,
      data: paginated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.getAllReportedUsers = async (req,res)=>{
try{

const {
page=1,
limit=10,
search=""
}=req.query;

const reports=await ReportUser.find()
.populate("reportedBy","legalName phone email")
.populate("reportedUser","legalName phone email primaryProfilePhoto isActive")
.sort({createdAt:-1});

let data=reports;

if(search){

const s=search.toLowerCase();

data=data.filter(item=>
item.reportedUser?.legalName?.toLowerCase().includes(s) ||
item.reportedUser?.phone?.includes(search) ||
item.reportedUser?.email?.toLowerCase().includes(s)
);

}

const total=data.length;

const result=data.slice(
(page-1)*limit,
page*limit
);

return res.json({
success:true,
total,
page:Number(page),
totalPages:Math.ceil(total/limit),
count:result.length,
data:result
});

}catch(error){
return res.status(500).json({
success:false,
message:error.message
});
}
};


exports.getReportedUserDetails=async(req,res)=>{

try{

const reports=await ReportUser.find({
reportedUser:req.params.userId
})
.populate("reportedBy","legalName phone email")
.sort({createdAt:-1});

return res.json({
success:true,
reportCount:reports.length,
data:reports
});

}catch(error){

return res.status(500).json({
success:false,
message:error.message
});

}

};

exports.getUserBlockedList=async(req,res)=>{

try{

const data=await BlockUser.find({
blockedBy:req.params.userId
})
.populate(
"blockedUser",
"legalName phone email primaryProfilePhoto"
)
.sort({createdAt:-1});

return res.json({
success:true,
count:data.length,
data
});

}catch(error){

return res.status(500).json({
success:false,
message:error.message
});

}

};


exports.removeBlockedUser=async(req,res)=>{

try{

const block=await BlockUser.findByIdAndDelete(
req.params.blockId
);

if(!block){

return res.status(404).json({
success:false,
message:"Block not found"
});

}

return res.json({
success:true,
message:"Block removed successfully"
});

}catch(error){

return res.status(500).json({
success:false,
message:error.message
});

}

};

exports.getModerationDashboard=async(req,res)=>{

try{

const today=new Date();

today.setHours(0,0,0,0);

const [
totalUsers,
activeUsers,
inactiveUsers,
blockedRelations,
reportedProfiles,
todayBlocks,
todayReports,
autoSuspendedUsers
]=await Promise.all([

User.countDocuments(),

User.countDocuments({
isActive:true
}),

User.countDocuments({
isActive:false
}),

BlockUser.countDocuments(),

ReportUser.countDocuments(),

BlockUser.countDocuments({
createdAt:{$gte:today}
}),

ReportUser.countDocuments({
createdAt:{$gte:today}
}),

User.countDocuments({
isActive:false,
reportCount:{
$gte:100
}
})

]);

return res.json({

success:true,

data:{

totalUsers,
activeUsers,
inactiveUsers,
blockedRelations,
reportedProfiles,
todayBlocks,
todayReports,
autoSuspendedUsers

}

});

}catch(error){

return res.status(500).json({

success:false,
message:error.message

});

}

};