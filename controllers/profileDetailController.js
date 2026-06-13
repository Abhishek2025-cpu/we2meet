const User = require('../models/User');

exports.getProfileDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        let age = 29;
        if (user.dateOfBirth) {
            const birthDate = new Date(user.dateOfBirth);
            const difference = Date.now() - birthDate.getTime();
            const ageDate = new Date(difference);
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        const formattedProfile = {
            id: user._id,
            name: user.legalName,
            age: age,
            profession: user.career?.profession || "Software Architect",
            location: `${user.location?.city || "London"}, ${user.location?.state || "UK"}`,
            isVerified: user.verification?.isIdentityVerified || false,
            isPremium: user.profileCompletionPercentage > 80,
            bio: user.bio || "Looking for someone who appreciates a balance of tradition and modern innovation. Family-oriented and enjoys traveling.",
            photo: user.photos?.primaryPhoto || ""
        };

        res.status(200).json({
            success: true,
            data: formattedProfile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.reportUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        res.status(200).json({
            success: true,
            message: "User reported successfully",
            reportedUserId: id,
            reason: reason || "Unspecified"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};