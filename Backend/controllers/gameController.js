const Game = require('../models/game');
const Company = require('../models/company');

// Create a new game
const createGame = async (req, res) => {
    try {
        // Check if the authenticated user is a company
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can create games' });
        }

        // Normalize the game name (remove spaces and convert to lowercase)
        const gameName = req.body.name.trim().toLowerCase();

        console.log(`Checking if a game exists with the name: "${gameName}"`);

        // Check if a game with the same name already exists
        const existingGame = await Game.findOne({ name: gameName });

        if (existingGame) {
            return res.status(400).json({ message: 'A game with this name already exists' });
        }

        // Create the new game with reference to the company
        const game = new Game({
            ...req.body,
            company: req.user._id  // Associate the game with the authenticated company
        });

        await game.save();

        // Update the company to add the new game's ID to the company's games array
        await Company.findByIdAndUpdate(
            req.user._id,
            { $push: { games: game._id } }
        );

        res.status(201).json(game); // Return the created game with a 201 (created) status
        
    } catch (error) {
        console.error('Error creating the game:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all games
const getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        console.error('Error retrieving games:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a specific game by ID
const getGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json(game);
    } catch (error) {
        console.error('Error retrieving the game:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update an existing game
const updateGame = async (req, res) => {
    try {
        // Check if the authenticated user is a company
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can update games' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Check that the company trying to update the game is the one that created it
        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this game' });
        }

        // Update the game fields with the new data
        Object.assign(game, req.body);
        await game.save();

        res.json(game);
    } catch (error) {
        console.error('Error updating the game:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a game
const deleteGame = async (req, res) => {
    try {
        // Check if the authenticated user is a company
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can delete games' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Check that the company trying to delete the game is the one that created it
        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this game' });
        }

        // Delete the game
        await game.deleteOne();

        // Update the company by removing the game from the games array
        await Company.findByIdAndUpdate(
            req.user._id,
            { $pull: { games: game._id } }
        );

        res.status(200).json({ message: 'Game deleted successfully', game });
    } catch (error) {
        console.error('Error deleting the game:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGame,
    getAllGames,
    getGame,
    updateGame,
    deleteGame
};
