const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: function() { return this.type === 'video'; },
  },
  articleContent: {
    type: String,
    required: function() { return this.type === 'article'; },
  },
  initiativeDetails: {
    type: String,
    required: function() { return this.type === 'initiative'; },
  },
  type: {
    type: String,
    enum: ['video', 'article', 'initiative'],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Resource", resourceSchema);
