const express = require('express');
const router = express.Router();
const {

  createApiKey,
  getApiKeysByList,
  deleteApiKey,
  getAchievementKeyData // this is the new/renamed function that returns { listId, appId }
} = require('../controllers/apiKeyController');

// GET /api/apikeys?key=TEST_API_KEY_123
// This route returns { listId, appId } for the given API key
router.get('/', getAchievementKeyData);

// Create a new API Key: POST /api/apikeys/:listId
router.post('/:listId', createApiKey);

// Get all API Keys for a specific AchievementList: GET /api/apikeys/list/:listId
router.get('/list/:listId', getApiKeysByList);

// Delete an API Key: DELETE /api/apikeys/:apiKeyId
router.delete('/:apiKeyId', deleteApiKey);

module.exports = router;