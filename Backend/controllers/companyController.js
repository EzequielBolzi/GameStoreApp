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
        const user = await Company.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email address.' });
        }

        const resetToken = user.generateResetPasswordToken();
        await user.save();

        // Configurar el transporter de nodemailer (ajusta según tu proveedor de correo)
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `http://${req.headers.host}/api/companies/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password reset',
            text: `You have requested to reset your password. Please click on the following link to reset your password: ${resetUrl}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Mail sent' });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await Company.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Password reset failed' });
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
    resetPassword,
};
