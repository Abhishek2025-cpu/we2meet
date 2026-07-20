function calculateMatchPercentage(
currentUser,
targetUser
) {
let score = 0;

if (
currentUser.zodiacSign &&
currentUser.zodiacSign === targetUser.zodiacSign
) {
score += 5;
}

if (
currentUser.rasi &&
currentUser.rasi === targetUser.rasi
) {
score += 5;
}

if (
currentUser.dosa &&
currentUser.dosa === targetUser.dosa
) {
score += 5;
}

if (
currentUser.weight &&
targetUser.weight
) {
const diff =
Math.abs(
Number(currentUser.weight) -
Number(targetUser.weight)
);

if (diff <= 10) {
score += 2;
}
}

if (
currentUser.religion &&
currentUser.religion ===
targetUser.religion
) {
score += 15;
}

if (
currentUser.caste &&
currentUser.caste ===
targetUser.caste
) {
score += 10;
}

if (
currentUser.motherTongue &&
currentUser.motherTongue ===
targetUser.motherTongue
) {
score += 10;
}

if (
currentUser.qualification &&
currentUser.qualification ===
targetUser.qualification
) {
score += 10;
}

if (
currentUser.profession &&
currentUser.profession ===
targetUser.profession
) {
score += 10;
}

if (
currentUser.workingWith &&
currentUser.workingWith ===
targetUser.workingWith
) {
score += 5;
}

const income1 = Number(
currentUser.annualIncome || 0
);

const income2 = Number(
targetUser.annualIncome || 0
);

const incomeDiff = Math.abs(
income1 - income2
);

if (incomeDiff <= 500000) {
score += 10;
} else if (
incomeDiff <= 1000000
) {
score += 5;
}

const life1 =
currentUser.lifeStyleDetails ||
{};

const life2 =
targetUser.lifeStyleDetails ||
{};

if (
life1.diet &&
life1.diet === life2.diet
) {
score += 5;
}

if (
life1.smoking &&
life1.smoking ===
life2.smoking
) {
score += 3;
}

if (
life1.drinking &&
life1.drinking ===
life2.drinking
) {
score += 2;
}

const pref =
currentUser.partnerPreference ||
{};

if (
pref.religion &&
pref.religion ===
targetUser.religion
) {
score += 5;
}

if (
pref.caste &&
pref.caste ===
targetUser.caste
) {
score += 5;
}

if (
pref.motherTongue &&
pref.motherTongue ===
targetUser.motherTongue
) {
score += 5;
}

if (
currentUser.dob &&
targetUser.dob
) {
const age1 =
new Date().getFullYear() -
new Date(
currentUser.dob
).getFullYear();


const age2 =
  new Date().getFullYear() -
  new Date(
    targetUser.dob
  ).getFullYear();

const diff = Math.abs(
  age1 - age2
);

if (diff <= 3) {
  score += 5;
}


}

if (
currentUser.profiles?.length &&
targetUser.profiles?.length
) {
score += 10;
}

return Math.min(score, 100);
}

module.exports =
calculateMatchPercentage;
