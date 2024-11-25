const express = require('express');
const router = express.Router();
const { createGame, getAllGames, getGame, updateGame, deleteGame,getStatistics, setGameSale, removeSale, checkGame } = require('../controllers/gameController');
const auth = require('../middleware/auth'); 
const roleAuth = require('../middleware/roleAuth');


router.post('/', auth, roleAuth(['company']), createGame);

router.get('/', getAllGames);

router.get('/:id', auth,getGame);

router.patch('/:id', auth, roleAuth(['company']), updateGame);

router.delete('/:id', auth, roleAuth(['company']), deleteGame);

router.get('/statistics/:id', auth, roleAuth(['company']), getStatistics);

router.post('/sales/:id', auth, roleAuth(['company']), setGameSale);

router.delete('/sales/:id', auth, roleAuth(['company']), removeSale);


module.exports = router;