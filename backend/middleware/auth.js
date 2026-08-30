const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the authenticated user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found or inactive' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

// Restricts access to specific roles, e.g. authorize('admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
