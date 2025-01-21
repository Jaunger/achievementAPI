// routes/achievementList.routes.js
const express = require('express');
const router = express.Router();
const checkApiKey = require('../middleware/checkApiKey');

const {
  createList,
  getListById,
  updateList,
  getPlayerAchievementList,
  deleteList
} = require('../controllers/achievementListController');

// Create a new list (not necessarily protected by apiKey; dev logs in some other way)
router.post('/', createList);

// Retrieve a list by ID
router.get('/:listId', getListById);

router.get('/:listId/players/:playerId', getPlayerAchievementList);

// Update a list (protected by apiKey, scenario #2)
router.patch('/:listId', checkApiKey, updateList);

// Delete a list (also protected)
router.delete('/:listId', checkApiKey, deleteList);

module.exports = router;