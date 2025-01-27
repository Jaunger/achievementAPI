const Player = require('../models/Player');
const Achievement = require('../models/Achievement');

/**
 * Create or retrieve a Player in a given App.
 * - This can handle the scenario where you don't want duplicates for (appId + playerId).
 * - If a player doc doesn't exist, create it. If it does exist, return it.
 */
exports.createOrFetchPlayer = async (req, res) => {
    try {
      const { appId } = req.params; // from route /apps/:appId/players
      const { playerId } = req.body; // the final combined ID
  
      // findOne or create
      let player = await Player.findOne({ appId, playerId });
      if (!player) {
        player = await Player.create({ appId, playerId });
      }
  
      return res.status(201).json(player);
    } catch (error) {
      console.error('Error in createOrFetchPlayer:', error);
      return res.status(400).json({ error: error.message });
    }
  };
  

/**
 * Get all Players for a specific App.
 */
exports.getAllPlayersByApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const players = await Player.find({ appId });
    return res.json(players);
  } catch (error) {
    console.error('Error in getAllPlayersByApp:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Get a single Player by (appId + playerId).
 */
exports.getPlayerById = async (req, res) => {
  try {
    const { appId, pId } = req.params; // e.g., /apps/:appId/players/:pId
    const player = await Player.findOne({ appId, playerId: pId });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return res.json(player);
  } catch (error) {
    console.error('Error in getPlayerById:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Update progress for a specific Achievement in a Player's list.
 * - This endpoint increments progress and checks if it's complete.
 */
exports.updatePlayerProgress = async (req, res) => {
  try {
    const { appId, pId } = req.params;
    const { achievementId, progressDelta } = req.body;

    const player = await Player.findOne({ appId, playerId: pId });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Find or create subdoc for this achievement's progress
    let achProgress = player.achievementsProgress.find(
      ap => ap.achievementId.toString() === achievementId
    );
    if (!achProgress) {
      // If the player doesn't have a record yet, push a new subdoc
      achProgress = {
        achievementId,
        progress: parseInt(progressDelta, 10) || 0,
        dateUnlocked: null
      };
      player.achievementsProgress.push(achProgress);
    }

    // Increment the progress
    const delta = parseInt(progressDelta, 10) || 0;
    achProgress.progress += delta;
    console.log('Updated progress:', achProgress.progress); 

    await player.save();
    return res.json(player);
  } catch (error) {
    console.error('Error in updatePlayerProgress:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a Player doc (optional).
 */
exports.deletePlayer = async (req, res) => {
  try {
    const { appId, pId } = req.params;
    const deleted = await Player.findOneAndDelete({ appId, playerId: pId });
    if (!deleted) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error in deletePlayer:', error);
    return res.status(400).json({ error: error.message });
  }
};