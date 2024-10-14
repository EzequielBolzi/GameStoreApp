// middleware/roleAuth.js
const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.role)) {
      return res.status(403).send({ error: 'Access denied.' });
    }
    next();
  };
};

module.exports = roleAuth; 
