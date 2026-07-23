// Must run AFTER the regular `auth` middleware, since it relies on req.user
// (which auth.js populates from the decoded JWT: { id, name, email, isAdmin }).
module.exports = function (req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ msg: 'Admin access required.' });
  }
  next();
};
