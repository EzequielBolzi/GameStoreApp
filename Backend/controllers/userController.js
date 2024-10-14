// controllers/user.controller.js

// External modules
const nodemailer = require('nodemailer');

// Internal modules
const { Comment } = require('../models/comment');
const Game = require('../models/game');
const User = require('../models/user');
const { RegisterDto } = require('../dtos/registerDto');
const { UserDto } = require('../dtos/userDto');

// User registration
const register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        const userDto = new UserDto(user);
        const registerDto = new RegisterDto("User registered successfully", userDto);

        res.status(201).json(registerDto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// User login
const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await user.checkPassword(req.body.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();
        const userDto = new UserDto(user);

        res.status(200).json({ user: userDto, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const allowedUpdates = ['email', 'password', 'confirmPassword', 'cardName', 'cardNumber', 'cardExpiration', 'cardCVV'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates!' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.password && req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: 'New password and confirmation do not match!' });
        }

        updates.forEach(async (update) => {
            user[update] = (update === 'password') ? await bcrypt.hash(req.body[update], 8) : req.body[update];
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({ message: 'Profile updated successfully', user: userResponse });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get current user info
const getCurrentUser = (req, res) => {
    res.status(200).json(req.user);
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const resetToken = user.generateResetPasswordToken();
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `http://${req.headers.host}/api/users/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `Please click the following link to reset your password: ${resetUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email' });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = await bcrypt.hash(password, 8);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Password reset failed' });
    }
};

// Create comment and rate
const createCommentAndRate = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { comment, rating } = req.body;
        const userId = req.user._id;

        if (!comment || rating === undefined || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid comment or rating' });
        }

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newComment = new Comment({ user: userId, game: gameId, comment, rating });
        await newComment.save();

        game.comments.push(newComment._id);
        user.comments.push(newComment._id);

        const allComments = await Comment.find({ game: gameId });
        game.averageRating = allComments.reduce((sum, comment) => sum + comment.rating, 0) / allComments.length;

        await game.save();
        await user.save();

        res.status(201).json({ message: 'Comment and rating added successfully', comment: newComment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete comment and rate
const deleteCommentAndRate = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment || comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized or comment not found' });
        }

        await comment.deleteOne();

        await User.findByIdAndUpdate(req.user._id, { $pull: { comments: comment._id } });
        await Game.findByIdAndUpdate(comment.game, { $pull: { comments: comment._id } });

        const gameComments = await Comment.find({ game: comment.game });
        const totalRating = gameComments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = gameComments.length ? totalRating / gameComments.length : 0;

        await Game.findByIdAndUpdate(comment.game, { averageRating });

        res.status(200).json({ message: 'Comment deleted successfully', comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export the controller methods
module.exports = {
    register,
    login,
    getCurrentUser,
    getAllUsers,
    updateProfile,
    forgotPassword,
    resetPassword,
    createCommentAndRate,
    deleteCommentAndRate,
};
