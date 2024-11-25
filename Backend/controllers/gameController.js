const { Game, GameView } = require('../models/game');

const Company = require('../models/company');

const createGame = async (req, res) => {
    try {
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can create games' });
        }

        const gameName = req.body.name.trim().toLowerCase();


        const existingGame = await Game.findOne({ name: gameName });

        if (existingGame) {
            return res.status(400).json({ message: 'A game with this name already exists' });
        }

        const game = new Game({
            ...req.body,
            company: req.user._id  
        });

        await game.save();

        await Company.findByIdAndUpdate(
            req.user._id,
            { $push: { games: game._id } }
        );

        res.status(201).json(game); 
        
    } catch (error) {
        console.error('Error creating the game:', error);
        res.status(400).json({ message: error.message });
    }
};

const getAllGames = async (req, res) => {
    try {
       
        const query = {};

        if (req.query.category) {
            query.category = { $regex: new RegExp(req.query.category, 'i') }; 
        }

        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = Number(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = Number(req.query.maxPrice);
            }
        }

        if (req.query.system) {
            query['minimumRequirements.system'] = { $regex: new RegExp(req.query.system, 'i') };
        }

        if (req.query.language) {
            query.language = { $regex: new RegExp(req.query.language, 'i') };
        }

        const games = await Game.find(query);
        
        res.json(games);
    } catch (error) {
        console.error('Error retrieving games:', error);
        res.status(500).json({ message: error.message });
    }
};


const getGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);        
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
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
        res.json(updatedGame);
    } catch (error) {
        console.error('Error retrieving the game:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateGame = async (req, res) => {
    try {
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can update games' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this game' });
        }

        Object.assign(game, req.body);
        await game.save();

        res.json(game);
    } catch (error) {
        console.error('Error updating the game:', error);
        res.status(400).json({ message: error.message });
    }
};

const deleteGame = async (req, res) => {
    try {
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can delete games' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this game' });
        }

        await game.deleteOne();

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
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can set game sales' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to set sales for this game' });
        }

        const { discountPercentage, duration } = req.body;

        if (!discountPercentage || discountPercentage <= 0 || discountPercentage >= 100) {
            return res.status(400).json({ 
                message: 'Discount percentage must be between 0 and 100' 
            });
        }

        if (!duration || duration <= 0 || duration > 90) {
            return res.status(400).json({ 
                message: 'Sale duration must be between 1 and 90 days' 
            });
        }

        const saleEndDate = new Date();
        saleEndDate.setDate(saleEndDate.getDate() + duration);

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
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can remove game sales' });
        }

        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to remove sales for this game' });
        }

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
