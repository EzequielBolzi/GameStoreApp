const Company = require('../models/company');
const { CompanyDto } = require('../dtos/companyDto');
const { Game } = require('../models/game');
const nodemailer = require('nodemailer');


// Get current company info
const getCurrentCompany = async (req, res) => {
    try {
        const games = await Game.find({ company: req.user._id });

        const totalUniqueView = games.reduce((acc, game) => acc + (game.uniqueViews || 0), 0);
        const totalRevenue = games.reduce((acc, game) => acc + (game.revenue || 0), 0);
        const totalWishListAdded = games.reduce((acc, game) => acc + (game.wishlistCount || 0), 0);

        const companyDto = new CompanyDto(req.user);
        const response = {
            ...companyDto,
            totalUniqueView,
            totalRevenue,
            totalWishListAdded
        };

        res.json(response);
        
    } catch (error) {
        console.error('Error fetching company data:', error);
        res.status(500).json({ message: 'Error fetching company data' });
    }
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

// Get a company by ID
const getCompanyById = async (req, res) => {
    try {
        
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const companyDto = new CompanyDto(company);
        res.json(companyDto);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company data', error: error.message });
    }
};

const updateCompanyProfile = async (req, res) => {
    try {
        const updates = req.body;


        const company = await Company.findById(req.user._id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        Object.keys(updates).forEach(update => {
            if (update === 'password' && updates[update] === '') {
                delete updates[update];
            } else {
                company[update] = updates[update];
            }
        });

        try {
            await company.save();
            const companyDto = new CompanyDto(company);
            res.json(companyDto);
        } catch (error) {
            console.error('Error saving company:', error);
            res.status(400).json({ error: error.message });
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        if (!res.headersSent) {
            res.status(400).json({ error: error.message });
        }
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

        const temporaryPassword = crypto.randomBytes(2).toString('hex');
        
        console.log('Temporary password generated:', temporaryPassword); // For debugging

        if (!temporaryPassword) {
            throw new Error('Failed to generate temporary password');
        }

        user.password = temporaryPassword;
        user.resetPasswordExpires = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // 31 days from now

        await user.save();

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

module.exports = {
    getCurrentCompany,
    getAllCompanies,
    updateCompanyProfile,
    forgotPassword,
    getCompanyById,
};
