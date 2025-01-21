const mongoose = require('mongoose');
const { Schema } = mongoose;

const achievementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['progress', 'milestone'], required: true },
  progressGoal: { type: Number, default: null }, // If type = "progress"
  isHidden: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' },
  order: { type: Number, default: 0 }, // New field for ordering
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);