const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const {
            mobile, email, password, profileCreatedFor, legalName, gender, dateOfBirth, religion,
            caste, motherTongue, city, state, highestQualification, college,
            workingWith, profession, companyName, annualIncome, familyStatus,
            familyType, familyValues, fatherOccupation, motherOccupation, aboutFamily,
            ageMin, ageMax, heightMin, heightMax, maritalStatus, prefReligions,
            prefMotherTongues, diet, smoking, drinking, interests, bio,
            valuesAndAspirations, majorLifeGoal, placeOfBirth, timeOfBirth,
            gothra, manglikStatus
        } = req.body;

        const baseUrl = process.env.BASE_URL || "https://api2.we2-meet.com";

        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User with this email or mobile already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let primaryPhotoPath = "";
        let galleryPaths = [];

        if (req.files) {
            if (req.files.primaryPhoto) {
                primaryPhotoPath = `${baseUrl}/uploads/${req.files.primaryPhoto[0].filename}`;
            }
            if (req.files.gallery) {
                galleryPaths = req.files.gallery.map(file => `${baseUrl}/uploads/${file.filename}`);
            }
        }

        const newUser = new User({
            mobile,
            email,
            password: hashedPassword,
            profileCreatedFor,
            legalName,
            gender,
            dateOfBirth,
            religion,
            caste,
            motherTongue,
            location: { city, state },
            education: { highestQualification, college },
            career: { workingWith, profession, companyName, annualIncome },
            familyDetails: {
                familyStatus,
                familyType,
                familyValues,
                fatherOccupation,
                motherOccupation,
                aboutFamily
            },
            partnerPreferences: {
                ageRange: { min: ageMin ? Number(ageMin) : 21, max: ageMax ? Number(ageMax) : 35 },
                heightRange: { min: heightMin, max: heightMax },
                maritalStatus: maritalStatus ? JSON.parse(maritalStatus) : [],
                religions: prefReligions ? JSON.parse(prefReligions) : [],
                motherTongues: prefMotherTongues ? JSON.parse(prefMotherTongues) : []
            },
            lifestyle: {
                dietaryPreference: diet,
                smoking,
                drinking,
                interests: interests ? JSON.parse(interests) : []
            },
            photos: {
                primaryPhoto: primaryPhotoPath,
                gallery: galleryPaths
            },
            bio,
            valuesAndAspirations: valuesAndAspirations ? JSON.parse(valuesAndAspirations) : [],
            majorLifeGoal,
            horoscope: {
                placeOfBirth,
                timeOfBirth,
                gothra,
                manglikStatus
            },
            profileCompleted: true,
            profileCompletionPercentage: 100
        });

        await newUser.save();
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userResponse 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid User ID or Server Error" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide both email and password" });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};