const express = require('express');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {  getCurrentCompany, getAllCompanies, updateCompanyProfile,forgotPassword,getCompanyById } = require('../controllers/companyController');
const router = express.Router();


router.get('/me', auth, roleAuth(['company']), getCurrentCompany); 

router.get('/', getAllCompanies); 

router.get('/:id', getCompanyById); 

router.patch('/profile', auth, roleAuth(['company']), updateCompanyProfile);


router.post('/forgot-password', forgotPassword);

module.exports = router; 
