const SubscriptionPlan = require(
  "../models/subscriptionPlan.model"
);

const PlanInterest = require(
  "../models/planInterest.model"
);


exports.createPlan = async (
  req,
  res
) => {
  try {
    const plan =
      await SubscriptionPlan.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Plan created successfully",
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllPlans = async (
  req,
  res
) => {
  try {
    const plans =
      await SubscriptionPlan.find({
        isActive: true
      }).sort({
        price: 1
      });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminPlans = async (
  req,
  res
) => {
  try {
    const plans =
      await SubscriptionPlan.find().sort(
        {
          createdAt: -1
        }
      );

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.updatePlan = async (
  req,
  res
) => {
  try {
    const plan =
      await SubscriptionPlan.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    res.json({
      success: true,
      message:
        "Plan updated successfully",
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deletePlan = async (
  req,
  res
) => {
  try {
    await SubscriptionPlan.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message:
        "Plan deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.changePlanStatus =
  async (req, res) => {
    try {
      const plan =
        await SubscriptionPlan.findByIdAndUpdate(
          req.params.id,
          {
            isActive:
              req.body.isActive
          },
          {
            new: true
          }
        );

      res.json({
        success: true,
        message:
          "Status updated successfully",
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.clickPlan = async (
  req,
  res
) => {
  try {
    const interest =
      await PlanInterest.create({
        userId: req.user._id,
        planId: req.body.planId
      });

    res.json({
      success: true,
      message:
        "Plan click tracked",
      data: interest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllPlanClicks =
  async (req, res) => {
    try {
      const data =
        await PlanInterest.find()
          .populate(
            "userId",
            "legalName phone email"
          )
          .populate(
            "planId",
            "planName price"
          )
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.getInterestedUsersByPlan =
  async (req, res) => {
    try {
      const users =
        await PlanInterest.find({
          planId: req.params.id
        }).populate(
          "userId",
          "legalName phone email"
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

  exports.getPlanById = async (
  req,
  res
) => {
  try {
    const plan =
      await SubscriptionPlan.findById(
        req.params.id
      );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminPlanById =
  async (req, res) => {
    try {
      const plan =
        await SubscriptionPlan.findById(
          req.params.id
        );

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found"
        });
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };



  exports.getAdminPlanById = async (
  req,
  res
) => {
  try {
    const plan =
      await SubscriptionPlan.findById(
        req.params.id
      );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getUserPlanClicks =
  async (req, res) => {
    try {
      const data =
        await PlanInterest.find({
          userId: req.params.userId
        }).populate(
          "planId"
        );

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };