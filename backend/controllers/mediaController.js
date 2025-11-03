
// ============================================

// backend/controllers/mediaController.js
const Media = require('../models/Media');
const path = require('path');
const fs = require('fs').promises;

// Upload Media
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Determine file type
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Create media document
    const media = new Media({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `uploads/${req.file.filename}`,
      fileType: fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      storageType: 'local'
    });

    await media.save();

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      media: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message
    });
  }
};

// Get User Media with Pagination and Filtering
exports.getMedia = async (req, res) => {
  try {
    const { page = 1, limit = 12, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { userId: req.userId };
    if (type && ['image', 'video'].includes(type)) {
      query.fileType = type;
    }

    // Get media with pagination
    const media = await Media.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      media: media,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: error.message
    });
  }
};

// Delete Media
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // Find media
    const media = await Media.findOne({ _id: id, userId: req.userId });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Delete file from storage
    if (media.storageType === 'local') {
      const filePath = path.join(__dirname, '..', 'uploads', media.filename);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Delete from database
    await Media.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete media',
      error: error.message
    });
  }
};

// Get Media Statistics
exports.getMediaStats = async (req, res) => {
  try {
    const stats = await Media.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      images: 0,
      videos: 0,
      totalSize: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats.totalSize += stat.totalSize;
      if (stat._id === 'image') formattedStats.images = stat.count;
      if (stat._id === 'video') formattedStats.videos = stat.count;
    });

    res.status(200).json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};