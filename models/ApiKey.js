// models/ApiKey.js (or similar)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const apiKeySchema = new Schema({
  key:      { type: String, required: true, unique: true },
  listId:   { type: Schema.Types.ObjectId, ref: 'AchievementList', required: true },
  appId:    { type: Schema.Types.ObjectId, ref: 'App', required: true },  // NEW FIELD
  createdAt: { type: Date, default: Date.now },
  expDate:   { type: Date, required: true } // Expiration date
});

module.exports = mongoose.model('ApiKey', apiKeySchema);