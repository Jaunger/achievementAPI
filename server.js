// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Route modules
const achievementListRoutes = require('./routes/achievementListRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes'); // <== or wherever
const appRoutes = require('./routes/appRoutes');
const playerRoutes = require('./routes/playerRoutes.js');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Mongo connection error:', err));

// Mount routes
app.use('/api/lists', achievementListRoutes);  // => /api/lists/...
app.use('/api', achievementRoutes);            // => /api/achievements? ...
app.use('/api/apikeys', apiKeyRoutes);         // => /api/apikeys
app.use('/api/apps', playerRoutes);            // => /api/apps
app.use('/api/apps', appRoutes);               // => /api/apps

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // Export for testingx