const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const calculateCompletion = (user) => {
    let fields = [
        user.legalName,
        user.email,
        user.mobile,
        user.gender,
        user.dateOfBirth,
        user.religion,
        user.caste,
        user.motherTongue,
        user.location?.city,
        user.location?.state,
        user.education?.highestQualification,
        user.education?.college,
        user.career?.workingWith,
        user.career?.profession,
        user.career?.companyName,
        user.career?.annualIncome,
        user.familyDetails?.familyStatus,
        user.familyDetails?.familyType,
        user.familyDetails?.familyValues,
        user.familyDetails?.fatherOccupation,
        user.familyDetails?.motherOccupation,
        user.familyDetails?.aboutFamily,
        user.partnerPreferences?.ageRange?.min,
        user.partnerPreferences?.ageRange?.max,
        user.partnerPreferences?.heightRange?.min,
        user.partnerPreferences?.heightRange?.max,
        user.lifestyle?.dietaryPreference,
        user.lifestyle?.smoking,
        user.lifestyle?.drinking,
        user.photos?.primaryPhoto,
        user.bio,
        user.majorLifeGoal,
        user.horoscope?.placeOfBirth,
        user.horoscope?.timeOfBirth,
        user.horoscope?.gothra,
        user.horoscope?.manglikStatus
    ];

    let filledFields = fields.filter(field => field !== undefined && field !== null && field !== '').length;

    if (user.partnerPreferences?.maritalStatus?.length > 0) filledFields++;
    if (user.partnerPreferences?.religions?.length > 0) filledFields++;
    if (user.partnerPreferences?.motherTongues?.length > 0) filledFields++;
    if (user.lifestyle?.interests?.length > 0) filledFields++;
    if (user.valuesAndAspirations?.length > 0) filledFields++;
    if (user.photos?.gallery?.length > 0) filledFields++;

    const totalFields = fields.length + 6;
    return Math.round((filledFields / totalFields) * 100);
};

const safeJsonParse = (data) => {
    if (!data) return undefined;
    try {
        return JSON.parse(data);
    } catch (e) {
        return undefined;
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { legalName, email, mobile, password } = req.body;

        if (!legalName || !email || !mobile || !password) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User with this email or mobile already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            legalName,
            email,
            mobile,
            password: hashedPassword,
            profileCompleted: false,
            profileCompletionPercentage: 0
        });

        newUser.profileCompletionPercentage = calculateCompletion(newUser);
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const {
            profileCreatedFor, gender, dateOfBirth, religion, caste, motherTongue,
            city, state, highestQualification, college, workingWith, profession,
            companyName, annualIncome, familyStatus, familyType, familyValues,
            fatherOccupation, motherOccupation, aboutFamily, ageMin, ageMax,
            heightMin, heightMax, maritalStatus, prefReligions, prefMotherTongues,
            diet, smoking, drinking, interests, bio, valuesAndAspirations,
            majorLifeGoal, placeOfBirth, timeOfBirth, gothra, manglikStatus
        } = req.body;

        const baseUrl = process.env.BASE_URL || "https://api2.we2-meet.com";

        if (profileCreatedFor) user.profileCreatedFor = profileCreatedFor;
        if (gender) user.gender = gender;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (religion) user.religion = religion;
        if (caste) user.caste = caste;
        if (motherTongue) user.motherTongue = motherTongue;
        if (bio) user.bio = bio;
        if (majorLifeGoal) user.majorLifeGoal = majorLifeGoal;

        if (city || state) {
            user.location = {
                city: city || user.location?.city,
                state: state || user.location?.state
            };
        }

        if (highestQualification || college) {
            user.education = {
                highestQualification: highestQualification || user.education?.highestQualification,
                college: college || user.education?.college
            };
        }

        if (workingWith || profession || companyName || annualIncome) {
            user.career = {
                workingWith: workingWith || user.career?.workingWith,
                profession: profession || user.career?.profession,
                companyName: companyName || user.career?.companyName,
                annualIncome: annualIncome || user.career?.annualIncome
            };
        }

        if (familyStatus || familyType || familyValues || fatherOccupation || motherOccupation || aboutFamily) {
            user.familyDetails = {
                familyStatus: familyStatus || user.familyDetails?.familyStatus,
                familyType: familyType || user.familyDetails?.familyType,
                familyValues: familyValues || user.familyDetails?.familyValues,
                fatherOccupation: fatherOccupation || user.familyDetails?.fatherOccupation,
                motherOccupation: motherOccupation || user.familyDetails?.motherOccupation,
                aboutFamily: aboutFamily || user.familyDetails?.aboutFamily
            };
        }

        if (ageMin || ageMax || heightMin || heightMax || maritalStatus || prefReligions || prefMotherTongues) {
            user.partnerPreferences = {
                ageRange: {
                    min: ageMin ? Number(ageMin) : (user.partnerPreferences?.ageRange?.min || 21),
                    max: ageMax ? Number(ageMax) : (user.partnerPreferences?.ageRange?.max || 35)
                },
                heightRange: {
                    min: heightMin || user.partnerPreferences?.heightRange?.min,
                    max: heightMax || user.partnerPreferences?.heightRange?.max
                },
                maritalStatus: maritalStatus ? safeJsonParse(maritalStatus) : (user.partnerPreferences?.maritalStatus || []),
                religions: prefReligions ? safeJsonParse(prefReligions) : (user.partnerPreferences?.religions || []),
                motherTongues: prefMotherTongues ? safeJsonParse(prefMotherTongues) : (user.partnerPreferences?.motherTongues || [])
            };
        }

        if (diet || smoking || drinking || interests) {
            user.lifestyle = {
                dietaryPreference: diet || user.lifestyle?.dietaryPreference,
                smoking: smoking || user.lifestyle?.smoking,
                drinking: drinking || user.lifestyle?.drinking,
                interests: interests ? safeJsonParse(interests) : (user.lifestyle?.interests || [])
            };
        }

        if (valuesAndAspirations) {
            user.valuesAndAspirations = safeJsonParse(valuesAndAspirations);
        }

        if (placeOfBirth || timeOfBirth || gothra || manglikStatus) {
            user.horoscope = {
                placeOfBirth: placeOfBirth || user.horoscope?.placeOfBirth,
                timeOfBirth: timeOfBirth || user.horoscope?.timeOfBirth,
                gothra: gothra || user.horoscope?.gothra,
                manglikStatus: manglikStatus || user.horoscope?.manglikStatus
            };
        }

        if (req.files) {
            if (req.files.primaryPhoto) {
                user.photos.primaryPhoto = `${baseUrl}/uploads/${req.files.primaryPhoto[0].filename}`;
            }
            if (req.files.gallery) {
                const newGalleryPaths = req.files.gallery.map(file => `${baseUrl}/uploads/${file.filename}`);
                user.photos.gallery = [...(user.photos?.gallery || []), ...newGalleryPaths];
            }
        }

        const percentage = calculateCompletion(user);
        user.profileCompletionPercentage = percentage;
        user.profileCompleted = percentage === 100;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
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
};

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