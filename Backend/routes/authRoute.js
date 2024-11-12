const express = require('express');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const  {  registerCompany, registerUser, login } = require('../controllers/authController');
const router = express.Router();

router.post('/companies', registerCompany);


router.post('/users', registerUser);


router.post('/sessions', login);

module.exports = router;