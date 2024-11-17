const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Log the secret key here
  console.log('JWT_SECRET (middleware):', process.env.JWT_SECRET);

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'Access denied. Token missing or malformed.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
