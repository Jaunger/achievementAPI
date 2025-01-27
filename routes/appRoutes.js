const express = require('express');
const router = express.Router();
const AppController = require('../controllers/appController');


// POST /api/apps
router.post('/', AppController.createApp);

// GET /api/apps
router.get('/', AppController.getAllApps);

// GET /api/apps/:appId
router.get('/:appId', AppController.getAppById);

// PATCH /api/apps/:appId
router.patch('/:appId', AppController.updateApp);

// DELETE /api/apps/:appId
router.delete('/:appId', AppController.deleteApp);

module.exports = router;