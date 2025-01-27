const express = require('express');
const router = express.Router();
const PlayerController = require('../controllers/playerController');

// Create or fetch a Player in a given App
router.post('/:appId/players', PlayerController.createOrFetchPlayer);

// Get all players for an App
router.get('/:appId/players', PlayerController.getAllPlayersByApp);

// Get a single player by pId (the player's ID)
router.get('/:appId/players/:pId', PlayerController.getPlayerById);

// Update Player's Achievement progress
router.patch('/:appId/players/:pId/progress', PlayerController.updatePlayerProgress);

// Delete a player
router.delete('/:appId/players/:pId', PlayerController.deletePlayer);

module.exports = router;