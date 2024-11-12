// controllers/user.controller.js

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { Comment } = require('../models/comment');
const { Game, GameView } = require('../models/game');
const User = require('../models/user');
const { UserDto } = require('../dtos/userDto');
const Purchase = require ('../models/purchase');

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

const getCurrentUser = (req, res) => {
    const userDto = new UserDto(req.user);
    res.status(200).json(userDto);
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const userDtos = users.map(user => new UserDto(user));
        res.status(200).json(userDtos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const user = await User.findById(userId);
        if (user.purchasedGames.includes(gameId)) {
            return res.status(400).json({ message: 'You already own this game' });
        }

        const hasStoredPaymentInfo = user.cardNumber && user.cardExpiration && user.cardCVV;
        
        let paymentInfo;

        if (hasStoredPaymentInfo) {
            paymentInfo = {
                cardNumber: user.cardNumber,
                cardExpiration: user.cardExpiration,
                cardCVV: user.cardCVV
            };
        } else {
            const { cardNumber, cardExpiration, cardCVV } = req.body;
            
            if (!cardNumber || !cardExpiration || !cardCVV) {
                return res.status(400).json({ 
                    message: 'No stored payment information found. Please provide card details.',
                    requiredFields: ['cardNumber', 'cardExpiration', 'cardCVV']
                });
            }

            paymentInfo = { cardNumber, cardExpiration, cardCVV };
        }

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

        let purchase;

        if (game.isOnSale) {
        purchase = new Purchase({
            user: userId,
            game: gameId,
            amount: game.salePrice,
            purchaseDate: new Date(),
            paymentStatus: 'completed',
            paymentMethod: hasStoredPaymentInfo ? 'stored_card' : 'new_card'
        });
        }
        else{
        purchase = new Purchase({
            user: userId,
            game: gameId,
            amount: game.price,
            purchaseDate: new Date(),
            paymentStatus: 'completed',
            paymentMethod: hasStoredPaymentInfo ? 'stored_card' : 'new_card'
        });}
        
        await purchase.save();

        if (req.user) {
             const existingView = await GameView.findOne({
                    game: game._id,
                    user: req.user._id
                });
        
            if (!existingView) {
                await GameView.create({
                game: game._id,
                user: req.user._id
                        });
        
            await Game.findByIdAndUpdate(
                    game._id,
                    { $inc: { uniqueViews: 1 } },
                    { new: true }
                    );
                }
            }
        await User.findByIdAndUpdate(
            userId,
            { 
                $addToSet: { purchasedGames: gameId },
                $pull: { wishlist: gameId }
            }
        );

        let purchaseAmount;
        if(game.isOnSale){
            purchaseAmount = game.salePrice; 
            await Game.findByIdAndUpdate(
                gameId,
                {
                    $inc: { 
                        revenue: purchaseAmount,
                        purchases: 1 
                    }
                },
                { new: true }
            );
        }
        else{
            purchaseAmount = game.price; 
            await Game.findByIdAndUpdate(
                gameId,
                {
                    $inc: { 
                        revenue: purchaseAmount,
                        purchases: 1 
                    }
                },
                { new: true }
            );

        }


        if(game.isOnSale){
        res.status(200).json({
            message: 'Game purchased successfully',
            purchase: {
                gameId: game._id,
                gameName: game.title,
                price: game.salePrice,
                purchaseDate: purchase.purchaseDate,
                paymentMethod: hasStoredPaymentInfo ? 'Used stored card' : 'Used new card'
            }
        });
        }
        else{
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
            }

        if (req.user) {
            const existingView = await GameView.findOne({
                game: game._id,
                user: req.user._id
            });

            if (!existingView) {
                await GameView.create({
                    game: game._id,
                    user: req.user._id
                });

                await Game.findByIdAndUpdate(
                    game._id,
                    { $inc: { uniqueViews: 1 } },
                    { new: true }
                );
            }
        }
        const updatedGame = await Game.findById(req.params.id);

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ 
            message: 'An error occurred during purchase',
            error: error.message 
        });
    }
};

const addGameToWishlist = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.wishlist.includes(gameId) || user.purchasedGames.includes(gameId)) {
            return res.status(400).json({ message: 'You have already added this game to your wishlist or already purchased it' });
        }

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
const removeGameFromWishlist = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.wishlist.includes(gameId)) {
            return res.status(400).json({ message: 'Game not found in your wishlist' });
        }

        const game = await Game.findById(gameId); // Corrected this line to use gameId
        if (!game) {
            return res.status(404).json({ message: 'Game not found' }); // Added this check
        }

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