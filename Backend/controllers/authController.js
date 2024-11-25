const Company = require('../models/company');
const User = require('../models/user');
const { CompanyDto } = require('../dtos/companyDto');
const { UserDto } = require('../dtos/userDto');
const { RegisterDto } = require('../dtos/registerDto');
const crypto = require('crypto');

const registerCompany = async (req, res) => {
    try {
        const { email, companyName, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await Company.findOne({ email });
        const existingCompanyName = await Company.findOne({ companyName });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        if (existingCompanyName) {
            return res.status(400).json({ message: 'Company Name already in use' });
        }

        const company = new Company(req.body);
        await company.save(); 
        const companyDto = new CompanyDto(company);
        const registerDto = new RegisterDto(
            "Company registered successfully",
            companyDto
        );
        res.status(201).json(registerDto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = new User(req.body);
        await user.save();

        const userDto = new UserDto(user);
        const registerDto = new RegisterDto("User registered successfully", userDto);

        res.status(201).json(registerDto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Received credentials:', { email, password });

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let entity = await Company.findOne({ email });
        let isCompany = true;
        if (!entity) {
            entity = await User.findOne({ email });
            isCompany = false;
        }

        if (!entity) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }


        const isPasswordValid = await entity.checkPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!isCompany && entity.resetPasswordExpires) {
            

            if (entity.resetPasswordExpires < Date.now()) {
                return res.status(401).json({
                    message: 'Temporary password has expired. Please use the forgot password feature to get a new one.'
                });
            }
        }
        const token = entity.generateAuthToken();

        if (isCompany) {
            const companyDto = new CompanyDto(entity);

            return res.status(200).json({ company: companyDto, token });
        } else {
            const userDto = new UserDto(entity);
            return res.status(200).json({ user: userDto, token });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login', error: error.message });
    }
};

module.exports = {
    registerCompany,
    registerUser,
    login,
};
