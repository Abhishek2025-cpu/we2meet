const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "No token provided, authorization denied"
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with this token"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Token is not valid or expired"
        });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Access denied. Admin authorization required"
        });
    }
};

authMiddleware.adminMiddleware = adminMiddleware;

module.exports = authMiddleware;