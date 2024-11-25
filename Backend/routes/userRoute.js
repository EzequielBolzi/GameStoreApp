const express = require('express');
const { getCurrentUser, getAllUsers, updateProfile,forgotPassword, createCommentAndRate, deleteCommentAndRate,purchaseGame,addGameToWishlist,removeGameFromWishlist} = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();


router.get('/me', auth, roleAuth(['user']), getCurrentUser);

router.get('/', auth, getAllUsers); 

router.patch('/profile', auth, roleAuth(['user']), updateProfile);


router.post('/commentAndRate/:gameId', auth, roleAuth(['user']), createCommentAndRate);

router.delete('/commentAndRate/:commentId', auth, roleAuth(['user']), deleteCommentAndRate);

router.post('/forgot-password', forgotPassword);

router.post('/orders', auth, roleAuth(['user']), purchaseGame);


router.post('/wishlist/:gameId', auth, roleAuth(['user']), addGameToWishlist);

router.delete('/wishlist/:gameId', auth, roleAuth(['user']), removeGameFromWishlist);

module.exports = router;