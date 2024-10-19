// routes/user.route.js
const express = require('express');
const { register, login, getCurrentUser, getAllUsers, updateProfile,forgotPassword, createCommentAndRate, deleteCommentAndRate,purchaseGame,addGameToWishlist,removeGameFromWishlist} = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// User registration
router.post('/', register);

// User login
router.post('/sessions',login);

// Get current user info
router.get('/me', auth, roleAuth(['user']), getCurrentUser);

// Get all users
router.get('/', auth, roleAuth(['user']), getAllUsers); 

// Update profile
router.patch('/profile', auth, roleAuth(['user']), updateProfile);


// Comment and rate a game 
router.post('/commendAndRate/:gameId', auth, roleAuth(['user']), createCommentAndRate);

router.delete('/commendAndRate/:commentId', auth, roleAuth(['user']), deleteCommentAndRate);

// Reset password
router.post('/forgot-password', forgotPassword);

// Buy a game
router.post('/orders/:gameId', auth, roleAuth(['user']), purchaseGame);


// Add a game to wishlist
router.post('/wishlist/:gameId', auth, roleAuth(['user']), addGameToWishlist);

// Remove a game to wishlist
router.delete('/wishlist/:gameId', auth, roleAuth(['user']), removeGameFromWishlist);

module.exports = router;