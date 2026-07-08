const calculateProfileCompletion = (user) => {
  let filled = 0;
  let total = 0;

  const check = (condition, weight = 1) => {
    total += weight;
    if (condition) filled += weight;
  };

  // ── Basic Info (weight: 1 each = 9 points) ────────────────────────────────
  check(!!user.createdFor);
  check(!!(user.fullName || user.legalName));
  check(!!user.email);
  check(!!user.phone);
  check(!!user.gender);
  check(!!user.dob);
  check(!!user.religion);
  check(!!user.motherTongue);
  check(!!user.maritalStatus);

  // ── Location & Identity (weight: 1 each) ──────────────────────────────────
  check(!!user.location);
  check(!!user.country);
  check(!!user.height);

  // ── Education & Career (weight: 1 each) ───────────────────────────────────
  check(!!(user.highestQualification || user.qualification));
  check(!!user.college);
  check(!!user.workingWith);
  check(!!user.profession);
  check(!!user.annualIncome);

  // ── Profile Photo (weight: 2) ──────────────────────────────────────────────
  check(!!(user.primaryProfilePhoto || (user.profilePhotos && user.profilePhotos.length > 0)), 2);

  // ── Family Details (weight: 1 each) ───────────────────────────────────────
  // Support both new flat fields and old nested familyDetails
  check(!!(user.familyType || user.familyDetails?.familyType));
  check(!!(user.familyValues || user.familyDetails?.familyValues));
  check(!!(user.fatherOccupation || user.familyDetails?.parentDetails?.fatherOccupation));
  check(!!(user.motherOccupation || user.familyDetails?.parentDetails?.motherOccupation));
  check(!!(user.aboutFamily || user.familyDetails?.aboutFamily));
  check(!!(user.familyStatus || user.familyDetails?.familyStatus));

  // ── About Me / Life Goals (weight: 1 each) ────────────────────────────────
  // Support both new flat fields and old nested myStory
  check(!!(user.aboutMe || user.myStory?.aboutMe));
  check(!!(user.lifeGoals || user.myStory?.lifeGoal));
  check(!!(user.hobbies?.length || user.lifeStyleDetails?.interestAndHobbies?.length));
  check(!!(user.values?.length || user.myStory?.values?.length));

  // ── Lifestyle (weight: 1 each) ────────────────────────────────────────────
  // Support both new flat lifestyle and old lifeStyleDetails
  check(!!(user.lifestyle?.diet || user.lifeStyleDetails?.dietaryPreference?.length));
  check(user.lifestyle?.smoking !== undefined && user.lifestyle?.smoking !== '' || user.lifeStyleDetails?.smoking !== undefined);
  check(user.lifestyle?.drinking !== undefined && user.lifestyle?.drinking !== '' || user.lifeStyleDetails?.drinking !== undefined);

  // ── Horoscope / Kundali (weight: 1 each) ─────────────────────────────────
  // Support both new flat horoscope and old kundaliDetails
  check(!!(user.horoscope?.gotra || user.kundaliDetails?.gotra));
  check(!!(user.horoscope?.manglik !== undefined && user.horoscope?.manglik !== '' || user.kundaliDetails?.manglik !== undefined));
  check(!!(user.horoscope?.cityOfBirth || user.kundaliDetails?.pob));
  check(!!(user.horoscope?.timeOfBirth));

  // ── Partner Preferences (weight: 2) ──────────────────────────────────────
  check(!!(user.partnerPreference?.ageRange?.min && user.partnerPreference?.ageRange?.max), 2);
  check(!!(user.partnerPreference?.maritalStatus?.length || user.partnerPreference?.religions?.length), 2);

  return Math.min(Math.round((filled / total) * 100), 100);
};

module.exports = calculateProfileCompletion;