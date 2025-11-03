const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true, // Cloudinary URL
  },
  fileType: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },

  // ✅ Cloudinary integration fields
  storageType: {
    type: String,
    enum: ['cloudinary'],
    default: 'cloudinary',
  },
  publicId: {
    type: String, // Cloudinary's unique identifier for file
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Media', mediaSchema);
