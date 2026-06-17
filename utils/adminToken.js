const jwt = require("jsonwebtoken");

const generateAdminToken = (id) => {
  return jwt.sign(
    {
      id,
      role: "admin"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d"
    }
  );
};

module.exports = generateAdminToken;