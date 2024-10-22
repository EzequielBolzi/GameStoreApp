// routes/game.routes.js
const express = require('express');
const router = express.Router();
const { createGame, getAllGames, getGame, updateGame, deleteGame,getStatistics } = require('../controllers/gameController');
const auth = require('../middleware/auth'); 
const roleAuth = require('../middleware/roleAuth');


// Create a new game (only authenticated companies can create games)
router.post('/', auth, roleAuth(['company']), createGame);

// Get all games with filters
router.get('/', getAllGames);

// Get a specific game (public route)
router.get('/:id', getGame);

// Update a game (only the owning company can update)
router.patch('/:id', auth, roleAuth(['company']), updateGame);

// Delete a game (only the owning company can delete)
router.delete('/:id', auth, roleAuth(['company']), deleteGame);

// Get Statistics
router.get('/statistics/:id', auth, roleAuth(['company']), getStatistics);

module.exports = router;