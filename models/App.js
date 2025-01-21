const mongoose = require('mongoose');
const { Schema } = mongoose;

const appSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('App', appSchema);