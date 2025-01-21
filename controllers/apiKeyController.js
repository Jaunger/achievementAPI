// controllers/apiKey.controller.js
const ApiKey = require('../models/ApiKey');
const AchievementList = require('../models/AchievementList');

exports.createApiKey = async (req, res) => {
    try {
      const { listId } = req.params; // e.g., /:listId in your route
      const { key, expDate, appId } = req.body; // We expect appId from the request body
  
      // 1) Confirm the AchievementList exists
      const list = await AchievementList.findById(listId);
      if (!list) {
        return res.status(404).json({ error: 'AchievementList not found' });
      }
  
      // 2) (Optional) Confirm the App exists
      //    If you want to ensure a valid appId, do something like:
      // const app = await AppModel.findById(appId);
      // if (!app) {
      //   return res.status(404).json({ error: 'App not found' });
      // }
  
      // 3) Create the new ApiKey doc with appId
      const newKey = await ApiKey.create({
        key,
        listId,
        appId,         
        expDate
      });
  
      return res.status(201).json(newKey);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
  };

exports.getApiKeysByList = async (req, res) => {
  try {
    const { listId } = req.params;
    const keys = await ApiKey.find({ listId });
    return res.json(keys);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};
exports.getAchievementListId = async (req, res) => {
    try {
      const { key } = req.query;
      if (!key) {
        return res.status(400).json({ error: 'API key is required' });
      }
  
      const apiKeyDoc = await ApiKey.findOne({ key });
      if (!apiKeyDoc) {
        return res.status(404).json({ error: 'API Key not found' });
      }
  
      return res.json({ listId: apiKeyDoc.listId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
  exports.getAchievementKeyData = async (req, res) => {
    try {
      const { key } = req.query; // e.g. /api/apikeys?key=TEST_API_KEY_123
      if (!key) {
        return res.status(400).json({ error: 'API key is required' });
      }
  
      const apiKeyDoc = await ApiKey.findOne({ key });
      if (!apiKeyDoc) {
        return res.status(404).json({ error: 'API Key not found' });
      }
  
      // Return both listId AND appId
      return res.json({
        listId: apiKeyDoc.listId,
        appId:  apiKeyDoc.appId
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
exports.deleteApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    const deleted = await ApiKey.findByIdAndDelete(apiKeyId);
    if (!deleted) {
      return res.status(404).json({ error: 'API Key not found' });
    }
    return res.json({ message: 'API Key revoked successfully' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};