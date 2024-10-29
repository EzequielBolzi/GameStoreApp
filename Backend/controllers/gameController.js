const { Game, GameView } = require('../models/game');

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

// Get all games with optional filters
const getAllGames = async (req, res) => {
    try {
       
        const query = {};

        // Filter by category
        if (req.query.category) {
            query.category = { $regex: new RegExp(req.query.category, 'i') }; // Case-insensitive match
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = Number(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = Number(req.query.maxPrice);
            }
        }

        // Filter by system requirements
        if (req.query.system) {
            query['minimumRequirements.system'] = { $regex: new RegExp(req.query.system, 'i') };
        }

        // Filter by language
        if (req.query.language) {
            query.language = { $regex: new RegExp(req.query.language, 'i') };
        }

        // Execute the query with filters
        const games = await Game.find(query);
        
        res.json(games);
    } catch (error) {
        console.error('Error retrieving games:', error);
        res.status(500).json({ message: error.message });
    }
};


// Get a specific game by ID
const getGame = async (req, res) => {
    try {
        // Retrieve the game by ID
        const game = await Game.findById(req.params.id);        
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Only track views for authenticated users
        if (req.user) {
            // Check if the user has already viewed this game
            const existingView = await GameView.findOne({
                game: game._id,
                user: req.user._id
            });

            // If no existing view is found, create a new one and increment uniqueViews
            if (!existingView) {
                await GameView.create({
                    game: game._id,
                    user: req.user._id
                });

                // Increment the uniqueViews counter only for the first-time view
                await Game.findByIdAndUpdate(
                    game._id,
                    { $inc: { uniqueViews: 1 } },
                    { new: true }
                );
            }
        }
        // Refresh the game data to get updated view count
        const updatedGame = await Game.findById(req.params.id);
        res.json(updatedGame);
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

const getStatistics = async (req, res) => { 
    try {
        const gameId = req.params.id;
        const game = await Game.findById(gameId);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to view the statistics for this game' });
        }
        const statistics = {
            revenue: game.revenue,
            uniqueViews: game.uniqueViews,
            wishlistCount: game.wishlistCount,
        };

        res.json(statistics);

    } catch (err) {
        console.error('Error fetching game statistics:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
const setGameSale = async (req, res) => {
    try {
        // Check if the authenticated user is a company
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can set game sales' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Check that the company owns the game
        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to set sales for this game' });
        }

        const { discountPercentage, duration } = req.body;

        // Validate discount percentage
        if (!discountPercentage || discountPercentage <= 0 || discountPercentage >= 100) {
            return res.status(400).json({ 
                message: 'Discount percentage must be between 0 and 100' 
            });
        }

        // Validate duration (in days)
        if (!duration || duration <= 0 || duration > 90) {
            return res.status(400).json({ 
                message: 'Sale duration must be between 1 and 90 days' 
            });
        }

        // Calculate sale end date
        const saleEndDate = new Date();
        saleEndDate.setDate(saleEndDate.getDate() + duration);

        // Update game with sale information
        game.discountPercentage = discountPercentage;
        game.saleEndDate = saleEndDate;

        await game.save();

        res.json({
            message: 'Sale set successfully',
            game: {
                ...game.toObject(),
                isOnSale: game.isOnSale,
                salePrice: game.salePrice,
                discountPercentage: game.discountPercentage,
            }
        });

    } catch (error) {
        console.error('Error setting game sale:', error);
        res.status(500).json({ message: error.message });
    }
};

const removeSale = async (req, res) => {
    try {
        // Check if the authenticated user is a company
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can remove game sales' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Check that the company owns the game
        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to remove sales for this game' });
        }

        // Remove sale information
        game.salePrice = undefined;
        game.saleEndDate = undefined;
        game.discountPercentage = undefined;

        await game.save();

        res.json({
            message: 'Sale removed successfully',
            game: game.toObject()
        });

    } catch (error) {
        console.error('Error removing game sale:', error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createGame,
    getAllGames,
    getGame,
    updateGame,
    deleteGame,
    getStatistics,
    setGameSale,
    removeSale,
};
