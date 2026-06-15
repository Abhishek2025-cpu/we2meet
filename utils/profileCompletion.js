const calculateProfileCompletion = (user) => {
  let total = 0;

  if (user.createdFor) total += 5;
  if (user.legalName) total += 5;
  if (user.email) total += 5;
  if (user.phone) total += 5;
  if (user.gender) total += 5;
  if (user.dob) total += 5;
  if (user.religion) total += 5;
  if (user.caste) total += 5;
  if (user.motherTongue) total += 5;
  if (user.profilePhoto) total += 5;

  if (user.familyDetails?.familyStatus) total += 10;
  if (user.partnerPreference?.ageRange?.min) total += 10;
  if (user.lifeStyleDetails?.dietaryPreference?.length) total += 10;
  if (user.myStory?.aboutMe) total += 10;
  if (user.kundaliDetails?.gotra) total += 10;

  return Math.min(total, 100);
};

module.exports = calculateProfileCompletion;