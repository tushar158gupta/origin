const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(authMiddleware);

// Media routes
router.post('/upload', upload.single('media'), mediaController.uploadMedia);
router.get('/', mediaController.getMedia);
router.get('/stats', mediaController.getMediaStats);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;