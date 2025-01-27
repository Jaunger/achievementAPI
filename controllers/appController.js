const AppModel = require('../models/App'); 

/**
 * Create a new App
 */
exports.createApp = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newApp = await AppModel.create({ title, description });
    return res.status(201).json(newApp);
  } catch (error) {
    console.error('Error creating App:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Get all Apps
 */
exports.getAllApps = async (req, res) => {
  try {
    const apps = await AppModel.find();
    return res.json(apps);
  } catch (error) {
    console.error('Error getting Apps:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Get a single App by ID
 */
exports.getAppById = async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await AppModel.findById(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    return res.json(app);
  } catch (error) {
    console.error('Error getting App by ID:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Update an App by ID
 */
exports.updateApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const updates = req.body;
    const updatedApp = await AppModel.findByIdAndUpdate(appId, updates, { new: true });
    if (!updatedApp) {
      return res.status(404).json({ error: 'App not found' });
    }
    return res.json(updatedApp);
  } catch (error) {
    console.error('Error updating App:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Delete an App
 */
exports.deleteApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const deleted = await AppModel.findByIdAndDelete(appId);
    if (!deleted) {
      return res.status(404).json({ error: 'App not found' });
    }
    return res.json({ message: 'App deleted successfully' });
  } catch (error) {
    console.error('Error deleting App:', error);
    return res.status(400).json({ error: error.message });
  }
};