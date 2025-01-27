const AchievementList = require('../models/AchievementList');
const Player = require('../models/Player');
const Achievement = require('../models/Achievement');


exports.createList = async (req, res) => {
  try {
    const { appId } = req.body;
    const { title, description } = req.body; // etc.

    const newList = await AchievementList.create({
      appId,
      title,
      description,
      achievements: []
    });

    return res.status(201).json(newList);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};
/**
 * GET /lists/:listId/players/:playerId
 * Merges the player's progress/hidden status with the achievement list.
 */
exports.getPlayerAchievementList = async (req, res) => {
    try {
      const { listId, playerId } = req.params;
  
      // 1) Load the AchievementList
      //    We'll populate its achievements so we have a full array of Achievement docs
      const listDoc = await AchievementList.findById(listId)
        .populate('achievements');
  
      if (!listDoc) {
        return res.status(404).json({ error: 'AchievementList not found' });
      }
  
      // 2) Load the Player doc (split the combined ID if needed or store it as-is)
      //    If your 'playerId' is something like "64afaa123456_guest123", 
      //    you might store it directly in the Player's "playerId" field. 
      //    Or you can parse it if you want. 
      const playerDoc = await Player.findOne({ 
        appId: listDoc.appId, 
        playerId
      });
  
      // If no playerDoc, we can still return achievements but with zero progress.
      // Or handle as 404 if your logic requires a valid player.
      // For now, let's gracefully continue.
      if (!playerDoc) {
        console.log('Player not found. Returning zero-progress data.');
      }
  
      // 3) Merge the data:
      //    We'll create a "mergedAchievements" array that includes each Achievement
      //    plus the player's currentProgress, isHidden, etc. if relevant.
      const mergedAchievements = listDoc.achievements.map((achievement) => {
        // Convert to plain object so we can add fields
        const achObj = achievement.toObject();
  
        // If no playerDoc, all progress = 0, or handle as you wish
        let foundProgress = null;
        if (playerDoc) {
          foundProgress = playerDoc.achievementsProgress.find(
            (ap) => ap.achievementId.toString() === achievement._id.toString()
          );
        }
  
        // If found, merge progress
        if (foundProgress) {
          achObj.currentProgress = foundProgress.progress;
          // Suppose you also want to set "isHidden" from player perspective if needed
          // e.g., if foundProgress says it's hidden, etc.
          // For now, let's assume "isHidden" is stored in the Achievement doc itself.
        } else {
          // If not found in player's progress, default to 0
          achObj.currentProgress = 0;
        }
  
        // Return this new object
        return achObj;
      });
  
      // 4) Build a response object that mimics the shape of `AchievementList`
      //    but with merged achievements
      const responseObj = {
        _id: listDoc._id,
        name: listDoc.name,
        achievements: mergedAchievements
      };
  
      // 5) Return the merged data
      return res.json(responseObj);
  
    } catch (error) {
      console.error('Error in getPlayerAchievementList:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };

// For scenario #2: If the dev has an apiKey and wants to update the list title, etc.
exports.updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const updates = req.body;

    // Check the apiKey
    if (req.apiKey.listId.toString() !== listId) {
      return res.status(403).json({ error: 'API key does not match this list' });
    }

    const updatedList = await AchievementList.findByIdAndUpdate(listId, updates, { new: true });
    if (!updatedList) {
      return res.status(404).json({ error: 'AchievementList not found' });
    }
    return res.json(updatedList);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

exports.getListById = async (req, res) => {
  try {
    const { listId } = req.params;
    // If we want to protect this route, we can check the key as well
    const list = await AchievementList.findById(listId).populate('achievements');
    if (!list) {
      return res.status(404).json({ error: 'AchievementList not found' });
    }
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    // Check the API key matches the list
    if (req.apiKey.listId.toString() !== listId) {
      return res.status(403).json({ error: 'API key does not match this list' });
    }

    const deletedList = await AchievementList.findByIdAndDelete(listId);
    if (!deletedList) {
      return res.status(404).json({ error: 'AchievementList not found' });
    }
    return res.json({ message: 'AchievementList deleted' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};