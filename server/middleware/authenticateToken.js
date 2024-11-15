const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.header('Authorization');

  console.log('Request Headers:', req.headers);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Access denied. Token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  // Log the Authorization header for debugging
  console.log('Authorization Header:', authHeader);

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to the request object
    next(); // Call next middleware or route handler
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
