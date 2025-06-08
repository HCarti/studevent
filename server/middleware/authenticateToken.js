// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Authorization required',
      code: 'UNAUTHORIZED'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: err.name === 'TokenExpiredError' 
          ? 'Session expired' 
          : 'Invalid token',
        code: err.name === 'TokenExpiredError' 
          ? 'TOKEN_EXPIRED' 
          : 'INVALID_TOKEN',
        expiredAt: err.expiredAt // Only present for expired tokens
      });
    }
    
    req.user = user;
    next();
  });
};

// Add the restrictTo middleware here
authenticateToken.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    
    next();
  };
};

module.exports = authenticateToken;