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

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);

  // Log query parameters
  if (Object.keys(req.query).length > 0) {
      console.log('Query Params:', req.query);
  } else {
      console.log('Query Params: None');
  }
  //add
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

module.exports = app; // Export for testing