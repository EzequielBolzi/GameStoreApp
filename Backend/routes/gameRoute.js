// routes/game.routes.js
const express = require('express');
const router = express.Router();
const { createGame, getAllGames, getGame, updateGame, deleteGame } = require('../controllers/gameController');
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// Create a new game (only authenticated companies can create games)
router.post('/', auth, createGame);

// Get all games (public route)
router.get('/', getAllGames);

// Get a specific game (public route)
router.get('/:id', getGame);

// Update a game (only the owning company can update)
router.patch('/:id', auth, updateGame);

// Delete a game (only the owning company can delete)
router.delete('/:id', auth, deleteGame);

module.exports = router;