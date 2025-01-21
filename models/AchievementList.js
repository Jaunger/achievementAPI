const mongoose = require('mongoose');
const { Schema } = mongoose;

const achievementListSchema = new Schema({
  appId: { 
    type: Schema.Types.ObjectId, 
    ref: 'App', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  // Array of references to Achievements
  achievements: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('AchievementList', achievementListSchema);