// models/Player.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const achievementProgressSchema = new Schema({
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  progress: { type: Number, default: 0 },
  dateUnlocked: { type: Date, default: null }
}, { _id: false });

const playerSchema = new Schema({
  appId: { type: Schema.Types.ObjectId, ref: 'App', required: true },
  playerId: { type: String, required: true }, // final combined ID

  achievementsProgress: {
    type: [achievementProgressSchema],
    default: []
  },

}, { timestamps: true });

// unique compound index => one doc per (appId + playerId)
playerSchema.index({ appId: 1, playerId: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema);