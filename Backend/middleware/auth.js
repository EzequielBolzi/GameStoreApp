const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Company = require('../models/company');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    // Check if it's a user or a company based on the role
    if (decoded.role === 'user') {
      user = await User.findOne({ _id: decoded._id });
    } else if (decoded.role === 'company') {
      user = await Company.findOne({ _id: decoded._id });
    }

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    req.role = decoded.role; // Save the role in the request object for further use
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;
