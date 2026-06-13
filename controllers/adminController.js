const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Register API
exports.registerAdmin = async (req, res) => {
    try {
        const { legalName, email, mobile, password, gender } = req.body;

        // Basic validation
        if (!legalName || !email || !mobile || !password || !gender) {
            return res.status(400).json({ 
                success: false, 
                message: "Required fields are missing" 
            });
        }

        // Check if admin/user already exists
        const adminExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (adminExists) {
            return res.status(400).json({ 
                success: false, 
                message: "User or Admin with this email or mobile already exists" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

      
        const newAdmin = new User({
            legalName,
            email,
            mobile,
            password: hashedPassword,
            gender,
            role: 'admin', // Force role to admin
            profileCompleted: true, // Optional: Admin profiles can be pre-marked as complete
            profileCompletionPercentage: 100
        });

        await newAdmin.save();

        // Generate Token
        const token = jwt.sign(
            { id: newAdmin._id, role: newAdmin.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

        const adminResponse = newAdmin.toObject();
        delete adminResponse.password;

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            token,
            admin: adminResponse
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin Login API
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide both email and password" 
            });
        }

        // Find user by email
        const admin = await User.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Check if the user has admin role
        if (admin.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Not authorized as admin." 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin._id, role: admin.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

        const adminResponse = admin.toObject();
        delete adminResponse.password;

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            admin: adminResponse
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};