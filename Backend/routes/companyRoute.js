const express = require('express');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {  getCurrentCompany, getAllCompanies, updateCompanyProfile,forgotPassword,getCompanyById } = require('../controllers/companyController');
const router = express.Router();


// Protected route - Get current company info
router.get('/me', auth, roleAuth(['company']), getCurrentCompany); 

// Get all companies 
router.get('/', getAllCompanies); 

// Get a company by ID
router.get('/:id', getCompanyById); 

router.patch('/profile', auth, roleAuth(['company']), updateCompanyProfile);


// Reset password
router.post('/forgot-password', forgotPassword);

module.exports = router; 
