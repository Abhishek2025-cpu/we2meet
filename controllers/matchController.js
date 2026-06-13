const User = require("../models/User");

const calculateAge = (dob) => {
    return Math.floor(
        (Date.now() - new Date(dob).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    );
};

const passesHardFilters = (user, candidate) => {
    const prefs = user.partnerPreferences || {};

    const age = calculateAge(candidate.dateOfBirth);

    // Age Filter
    if (
        prefs.ageRange?.min &&
        age < prefs.ageRange.min
    ) {
        return false;
    }

    if (
        prefs.ageRange?.max &&
        age > prefs.ageRange.max
    ) {
        return false;
    }

    // Religion Filter
    if (
        prefs.religions?.length &&
        !prefs.religions.includes(candidate.religion)
    ) {
        return false;
    }

    // Mother Tongue Filter
    if (
        prefs.motherTongues?.length &&
        !prefs.motherTongues.includes(candidate.motherTongue)
    ) {
        return false;
    }

    return true;
};

const calculateCompatibility = (user, candidate) => {
    let score = 0;

    const breakdown = {
        religion: 0,
        motherTongue: 0,
        education: 0,
        location: 0,
        lifestyle: 0,
        family: 0,
        interests: 0
    };

    // Religion (15)
    if (user.religion === candidate.religion) {
        breakdown.religion = 15;
    }

    // Mother Tongue (10)
    if (
        user.motherTongue === candidate.motherTongue
    ) {
        breakdown.motherTongue = 10;
    }

    // Education (15)
    if (
        user.education?.highestQualification ===
        candidate.education?.highestQualification
    ) {
        breakdown.education = 15;
    }

    // Location (10)
    if (
        user.location?.state ===
        candidate.location?.state
    ) {
        breakdown.location = 10;
    }

    // Lifestyle (20)
    if (
        user.lifestyle?.smoking ===
        candidate.lifestyle?.smoking
    ) {
        breakdown.lifestyle += 10;
    }

    if (
        user.lifestyle?.drinking ===
        candidate.lifestyle?.drinking
    ) {
        breakdown.lifestyle += 10;
    }

    // Family Values (10)
    if (
        user.familyDetails?.familyValues ===
        candidate.familyDetails?.familyValues
    ) {
        breakdown.family = 10;
    }

    // Interests (20)
    const commonInterests =
        user.lifestyle?.interests?.filter((interest) =>
            candidate.lifestyle?.interests?.includes(
                interest
            )
        ) || [];

    breakdown.interests = Math.min(
        commonInterests.length * 4,
        20
    );

    score = Object.values(breakdown).reduce(
        (total, value) => total + value,
        0
    );

    return {
        score,
        breakdown
    };
};

const getMatches = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const candidates = await User.find({
            _id: { $ne: userId },
            gender:
                user.gender === "Male"
                    ? "Female"
                    : "Male"
        });

        const matches = [];

        for (const candidate of candidates) {
            if (!passesHardFilters(user, candidate))
                continue;

            const { score, breakdown } =
                calculateCompatibility(
                    user,
                    candidate
                );

            matches.push({
                userId: candidate._id,
                legalName: candidate.legalName,
                age: calculateAge(
                    candidate.dateOfBirth
                ),
                city: candidate.location?.city,
                state: candidate.location?.state,
                profession:
                    candidate.career?.profession,
                primaryPhoto:
                    candidate.photos?.primaryPhoto,
                compatibilityScore: score,
                breakdown
            });
        }

        matches.sort(
            (a, b) =>
                b.compatibilityScore -
                a.compatibilityScore
        );

        const topMatches = matches.slice(0, 100);

        return res.status(200).json({
            success: true,
            totalMatches: topMatches.length,
            matches: topMatches
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getMatches
};