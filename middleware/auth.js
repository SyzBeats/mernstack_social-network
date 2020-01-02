const jwt = require("jsonwebtoken");
const config = require("config");
//* route:  GET /api/auth
//* desc:   Test
//* access: Public

module.exports = function(req, res, next) {
  // Get Token from HEader
  const token = req.header("x-auth-token");

  //Check if not token
  if (!token) {
    return res.status(401).json({ message: "You are not authorized - no token" });
  }

  //Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "token not valid" });
  }
};
