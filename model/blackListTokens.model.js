const mongoose = require('mongoose');

const blackListTokensSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds
  }
});

module.exports = mongoose.model('BlackListTokens', blackListTokensSchema);