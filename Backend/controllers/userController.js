// controllers/user.controller.js

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { Comment } = require('../models/comment');
const Game = require('../models/game');
const User = require('../models/user');
const { RegisterDto } = require('../dtos/registerDto');
const { UserDto } = require('../dtos/userDto');
const Purchase = require ('../models/purchase');

// User registration
const register = async (req, res) => {
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

// User login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await user.checkPassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if it's a temporary password and if it has expired
        if (user.resetPasswordExpires) {
            if (user.resetPasswordExpires < Date.now()) {
                return res.status(401).json({ message: 'Temporary password has expired. Please use the forgot password feature to get a new one.' });
            }
        }

        const token = user.generateAuthToken();
        const userDto = new UserDto(user);

        res.status(200).json({ 
            user: userDto, 
            token
                });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login', error: error.message });
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

        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                return res.status(400).json({ message: 'New password and confirmation do not match!' });
            }
            user.password = req.body.password; 
        }

        updates.forEach((update) => {
            if (update !== 'confirmPassword') {
                user[update] = req.body[update];
            }
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
    const userDto = new UserDto(req.user);
    res.status(200).json(userDto);
};

// Get all users (consider adding pagination)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const userDtos = users.map(user => new UserDto(user));
        res.status(200).json(userDtos);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        const existingComment = await Comment.findOne({ user: userId, game: gameId });
        if (existingComment) {
            return res.status(400).json({ message: 'You have already commented on this game' });
        }

        const newComment = new Comment({ user: userId, game: gameId, comment, rating });
        await newComment.save();

        game.comments.push(newComment._id);
        await User.findByIdAndUpdate(userId, { $push: { comments: newComment._id } });

        const allComments = await Comment.find({ game: gameId });
        game.averageRating = allComments.reduce((sum, comment) => sum + comment.rating, 0) / allComments.length;

        await game.save();

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

const purchaseGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        // Find the game
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Check if user already owns the game
        const user = await User.findById(userId);
        if (user.purchasedGames.includes(gameId)) {
            return res.status(400).json({ message: 'You already own this game' });
        }

        // Check if user has stored payment information
        const hasStoredPaymentInfo = user.cardNumber && user.cardExpiration && user.cardCVV;
        
        // Initialize payment info
        let paymentInfo;

        if (hasStoredPaymentInfo) {
            // Use stored payment information
            paymentInfo = {
                cardNumber: user.cardNumber,
                cardExpiration: user.cardExpiration,
                cardCVV: user.cardCVV
            };
        } else {
            // If no stored payment info, require new payment information
            const { cardNumber, cardExpiration, cardCVV } = req.body;
            
            if (!cardNumber || !cardExpiration || !cardCVV) {
                return res.status(400).json({ 
                    message: 'No stored payment information found. Please provide card details.',
                    requiredFields: ['cardNumber', 'cardExpiration', 'cardCVV']
                });
            }

            paymentInfo = { cardNumber, cardExpiration, cardCVV };
        }

        // Validate card info format (whether stored or new)
        const cardNumberRegex = /^\d{16}$/;
        const cardExpirationRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        const cardCVVRegex = /^\d{3,4}$/;

        if (!cardNumberRegex.test(paymentInfo.cardNumber)) {
            return res.status(400).json({ message: 'Invalid card number format' });
        }

        if (!cardExpirationRegex.test(paymentInfo.cardExpiration)) {
            return res.status(400).json({ message: 'Invalid card expiration format (MM/YYYY)' });
        }

        if (!cardCVVRegex.test(paymentInfo.cardCVV)) {
            return res.status(400).json({ message: 'Invalid CVV format' });
        }

        // Create purchase record
        const purchase = new Purchase({
            user: userId,
            game: gameId,
            amount: game.price,
            purchaseDate: new Date(),
            paymentStatus: 'completed',
            paymentMethod: hasStoredPaymentInfo ? 'stored_card' : 'new_card'
        });

        await purchase.save();

        // Add game to user's purchased games and remove from wishlist
        await User.findByIdAndUpdate(
            userId,
            { 
                $addToSet: { purchasedGames: gameId },
                $pull: { wishlist: gameId }
            }
        );

        // Update game purchase count
        await Game.findByIdAndUpdate(
            gameId,
            { $inc: { purchases: 1 } }
        );

        res.status(200).json({
            message: 'Game purchased successfully',
            purchase: {
                gameId: game._id,
                gameName: game.title,
                price: game.price,
                purchaseDate: purchase.purchaseDate,
                paymentMethod: hasStoredPaymentInfo ? 'Used stored card' : 'Used new card'
            }
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ 
            message: 'An error occurred during purchase',
            error: error.message 
        });
    }
};

// Add game to wishlist
const addGameToWishlist = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        // Check if the game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the game is already in wishlist or purchased
        if (user.wishlist.includes(gameId) || user.purchasedGames.includes(gameId)) {
            return res.status(400).json({ message: 'You have already added this game to your wishlist or already purchased it' });
        }

        // Add the game to wishlist
        user.wishlist.push(gameId);
        game.wishlistCount = (game.wishlistCount || 0) + 1; 
        await user.save();
        await game.save(); 

        return res.status(200).json({ message: 'Game added to wishlist successfully' });
    } catch (error) {
        console.error('Error adding game to wishlist:', error); 
        return res.status(500).json({ message: 'An error occurred', error: error.message }); 
    }
};
// Remove game from wishlist
const removeGameFromWishlist = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the game is in the wishlist
        if (!user.wishlist.includes(gameId)) {
            return res.status(400).json({ message: 'Game not found in your wishlist' });
        }

        // Find the game using the gameId
        const game = await Game.findById(gameId); // Corrected this line to use gameId
        if (!game) {
            return res.status(404).json({ message: 'Game not found' }); // Added this check
        }

        // Remove the game from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== gameId);
        game.wishlistCount = Math.max(game.wishlistCount - 1, 0); 
        await user.save();
        await game.save(); 

        return res.status(200).json({ message: 'Game removed from wishlist successfully' });
    } catch (error) {
        console.error('Error removing game from wishlist:', error); 
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};




module.exports = {
    register,
    login,
    getCurrentUser,
    getAllUsers,
    updateProfile,
    forgotPassword,
    createCommentAndRate,
    deleteCommentAndRate,
    purchaseGame,
    addGameToWishlist,
    removeGameFromWishlist,
};