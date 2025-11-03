// ============================================
// backend/controllers/mediaController.js
const Media = require('../models/Media');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Media
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Determine file type
    const fileType = req.file.mimetype.startsWith('image/')
      ? 'image'
      : 'video';

    // Upload to Cloudinary
    const uploadOptions = {
      folder: 'user_media',
      resource_type: fileType === 'video' ? 'video' : 'image',
    };

    const uploadResult = await cloudinary.uploader.upload(
      req.file.path,
      uploadOptions
    );

    // Create media document
    const media = new Media({
      userId: req.userId,
      originalName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      storageType: 'cloudinary',
      cloudinaryId: uploadResult.public_id,
    });

    await media.save();

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      media,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message,
    });
  }
};

// Get User Media with Pagination and Filtering
exports.getMedia = async (req, res) => {
  try {
    const { page = 1, limit = 12, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { userId: req.userId };
    if (type && ['image', 'video'].includes(type)) {
      query.fileType = type;
    }

    const media = await Media.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      media,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: error.message,
    });
  }
};

// Delete Media
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findOne({ _id: id, userId: req.userId });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found',
      });
    }

    // Delete from Cloudinary if applicable
    if (media.storageType === 'cloudinary' && media.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(media.cloudinaryId, {
          resource_type: media.fileType === 'video' ? 'video' : 'image',
        });
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }

    await Media.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media',
      error: error.message,
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
          totalSize: { $sum: '$fileSize' },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      images: 0,
      videos: 0,
      totalSize: 0,
    };

    stats.forEach((stat) => {
      formattedStats.total += stat.count;
      formattedStats.totalSize += stat.totalSize;
      if (stat._id === 'image') formattedStats.images = stat.count;
      if (stat._id === 'video') formattedStats.videos = stat.count;
    });

    res.status(200).json({
      success: true,
      stats: formattedStats,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message,
    });
  }
};
