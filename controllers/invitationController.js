const Invitation = require('../models/Invitation');
const User = require('../models/User');

exports.sendInvite = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({
                success: false,
                message: "You cannot send an interest request to yourself"
            });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Recipient user not found"
            });
        }

        const senderGender = req.user.gender;
        const receiverGender = receiver.gender;

        const isAllowedGenderCombination = 
            (senderGender === 'Male' && receiverGender === 'Female') || 
            (senderGender === 'Female' && receiverGender === 'Male');

        if (!isAllowedGenderCombination) {
            return res.status(400).json({
                success: false,
                message: "Interests can only be sent between male and female users"
            });
        }

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sentTodayCount = await Invitation.countDocuments({
            sender: senderId,
            createdAt: { $gte: oneDayAgo }
        });

        if (sentTodayCount >= 50) {
            return res.status(429).json({
                success: false,
                message: "Daily invitation limit of 50 requests reached"
            });
        }

        const existingInvitation = await Invitation.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: "An active invitation or connection already exists between these profiles"
            });
        }

        const newInvitation = new Invitation({
            sender: senderId,
            receiver: receiverId
        });

        await newInvitation.save();

        res.status(201).json({
            success: true,
            message: "Interest request sent successfully",
            data: newInvitation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.acceptInvite = async (req, res) => {
    try {
        const receiverId = req.user._id;
        const { invitationId } = req.params;

        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invitation request not found"
            });
        }

        if (invitation.receiver.toString() !== receiverId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this invitation"
            });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This invitation has already been ${invitation.status}`
            });
        }

        invitation.status = 'accepted';
        await invitation.save();

        res.status(200).json({
            success: true,
            message: "Invitation accepted successfully",
            data: invitation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.rejectInvite = async (req, res) => {
    try {
        const receiverId = req.user._id;
        const { invitationId } = req.params;

        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invitation request not found"
            });
        }

        if (invitation.receiver.toString() !== receiverId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reject this invitation"
            });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This invitation has already been ${invitation.status}`
            });
        }

        invitation.status = 'rejected';
        await invitation.save();

        res.status(200).json({
            success: true,
            message: "Invitation rejected successfully",
            data: invitation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPendingReceivedInvites = async (req, res) => {
    try {
        const receiverId = req.user._id;
        const invitations = await Invitation.find({
            receiver: receiverId,
            status: 'pending'
        }).populate('sender');

        res.status(200).json({
            success: true,
            data: invitations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAcceptedReceivedInvites = async (req, res) => {
    try {
        const receiverId = req.user._id;
        const invitations = await Invitation.find({
            receiver: receiverId,
            status: 'accepted'
        }).populate('sender');

        res.status(200).json({
            success: true,
            data: invitations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};