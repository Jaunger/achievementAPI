const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const next = require('next');
const path = require('path');
const achievementListRoutes = require('./routes/achievementListRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const appRoutes = require('./routes/appRoutes');
const playerRoutes = require('./routes/playerRoutes.js');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: __dirname });
const handle = nextApp.getRequestHandler();

require('dotenv').config();


nextApp.prepare().then(() => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Middleware for logging
  app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);

    // Log query parameters
    if (Object.keys(req.query).length > 0) {
      console.log('Query Params:', req.query);
    } else {
      console.log('Query Params: None');
    }

    // Log route parameters
    if (Object.keys(req.params).length > 0) {
      console.log('Route Params:', req.params);
    } else {
      console.log('Route Params: None');
    }

    // Log body if available
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request Body:', req.body);
    } else {
      console.log('Request Body: None');
    }

    next();
  });

  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Mongo connection error:', err));

  // Mount API routes
  app.use('/api/lists', achievementListRoutes); // => /api/lists/...
  app.use('/api', achievementRoutes); // => /api/achievements? ...
  app.use('/api/apikeys', apiKeyRoutes); // => /api/apikeys
  app.use('/api/players', playerRoutes); // => /api/players
  app.use('/api/apps', appRoutes); // => /api/apps

  // Handle Next.js pages
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

  // Start the server if not in test mode
  if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  module.exports = app; // Export for testing
});