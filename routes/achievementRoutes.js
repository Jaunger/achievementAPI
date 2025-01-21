// routes/achievement.routes.js
const express = require('express');
const router = express.Router();

const checkApiKey = require('../middleware/checkApiKey');
const upload = require('../middleware/upload'); // We'll create this in Step #2
const {
  createAchievement,
  getAchievementsForList,
  updateAchievement,
  deleteAchievement,
  uploadAchievementImage,
  reorderAchievements,
  updateAchievements, // Newly added controller
} = require('../controllers/achievementController');

// Create a new Achievement (max 10 per list)
router.post('/lists/:listId/achievements',checkApiKey, createAchievement);

// Get all Achievements in a list
router.get('/lists/:listId/achievements', checkApiKey, getAchievementsForList);

// Update an Achievement
router.patch('/lists/:listId/achievements/:achievementId', checkApiKey, updateAchievement);

// Delete an Achievement
router.delete('/lists/:listId/achievements/:achievementId', checkApiKey, deleteAchievement);

router.patch('/lists/:listId/achievements/reorder', checkApiKey, reorderAchievements);

router.put('/lists/:listId/achievements', checkApiKey, updateAchievements);

// Upload an image for an Achievement
router.post(
  '/lists/:listId/achievements/:achievementId/uploadImage',
  checkApiKey,
  upload.single('image'), 
  uploadAchievementImage
);

module.exports = router;