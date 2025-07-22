const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Fix: Ensure headers are accessed properly
  const authHeader = req.headers.authorization; // Use lowercase "authorization"
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};

const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send({ message: `This route is only for ${roles}` });
  }
  next();
};
module.exports = { verifyToken, authorizeRole };
