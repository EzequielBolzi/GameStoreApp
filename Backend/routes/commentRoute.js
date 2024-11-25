const express = require('express');
const { getCommentById } = require('../controllers/commentController');
const router = express.Router();

// Get a comment by ID
router.get('/:id', getCommentById);

module.exports = router;
