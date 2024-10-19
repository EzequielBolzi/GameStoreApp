// routes/company.route.js
const express = require('express');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { register, login, getCurrentCompany, getAllCompanies, updateCompanyProfile,forgotPassword } = require('../controllers/companyController');
const router = express.Router();

// Company registration
router.post('/', register); // Use the register method

// Company login
router.post('/sessions',login); // Use the login method

// Protected route - Get current company info
router.get('/me', auth, roleAuth(['company']), getCurrentCompany); // Use the getCurrentCompany method

// Get all companies
router.get('/', auth, roleAuth(['company']), getAllCompanies); // Añade la ruta para obtener todas las compañías

router.patch('/profile', auth, roleAuth(['company']), updateCompanyProfile);


// Reset password
router.post('/forgot-password', forgotPassword);

module.exports = router; 
