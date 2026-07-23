const jwt = require('jsonwebtoken');

// This middleware checks the JWT token sent in the request header
// If the token is valid, it attaches userId to req.user and calls next()
// If invalid or missing, it sends a 401 Unauthorized response
module.exports = function (req, res, next) {
  // Get the token from header: "Authorization: Bearer <token>"
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided, authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is invalid or has expired.' });
  }
};
