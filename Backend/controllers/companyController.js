// controllers/company.controller.js
const Company = require('../models/company');
const { CompanyDto } = require('../dtos/companyDto');
const { RegisterDto } = require('../dtos/registerDto');
const nodemailer = require('nodemailer');

// Company registration
const register = async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        const companyDto = new CompanyDto(company);
        const registerDto = new RegisterDto(
            "User registered successfully",
            companyDto
        );
        res.status(201).json(registerDto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Company login
const login = async (req, res) => {
    try {
        const company = await Company.findOne({ email: req.body.email });
        if (!company || !(await company.checkPassword(req.body.password))) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }
        const token = company.generateAuthToken();
        const companyDto = new CompanyDto(company);
        res.json({ company: companyDto, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get current company info
const getCurrentCompany = async (req, res) => {
    const companyDto = new CompanyDto(req.user);
    res.json(companyDto);
};

// Get all companies
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        const companyDtos = companies.map(company => new CompanyDto(company));
        res.json(companyDtos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update company profile
const updateCompanyProfile = async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['companyName', 'country', 'city', 'street', 'address', 'phoneNumber'];
        const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const company = await Company.findById(req.user._id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        Object.keys(updates).forEach(update => company[update] = updates[update]);
        await company.save();

        const companyDto = new CompanyDto(company);
        res.json(companyDto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate a random temporary password
        const temporaryPassword = crypto.randomBytes(2).toString('hex');
        
        console.log('Temporary password generated:', temporaryPassword); // For debugging

        if (!temporaryPassword) {
            throw new Error('Failed to generate temporary password');
        }

        // Update user's password in the database
        user.password = temporaryPassword;
        user.resetPasswordExpires = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // 31 days from now

        await user.save();

        // Email sending logic
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Temporary Password',
            text: `Your temporary password is: ${temporaryPassword}\nThis password will be valid for 31 days. Please log in and change your password as soon as possible.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Temporary password sent to your email' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
};

// Export the controller methods
module.exports = {
    register,
    login,
    getCurrentCompany,
    getAllCompanies,
    updateCompanyProfile,
    forgotPassword,
};
