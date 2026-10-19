const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/authMiddleware');
const { uploadPitchDeck } = require('../middleware/uploadMiddleware');

// Public & Catalog routes
router.get('/', optionalAuth, ideaController.getPublishedIdeas);
router.post('/calculate', ideaController.calculateRealtimeViability);
router.get('/documents/:docId/download', ideaController.downloadDocument);

// Entrepreneur personal ideas list (before /:id to prevent route clash)
router.get('/user/my-ideas', authenticate, requireRole('entrepreneur', 'admin'), ideaController.getMyIdeas);

// Single idea detail
router.get('/:id', optionalAuth, ideaController.getIdeaById);

// Idea CRUD for entrepreneurs
router.post('/', authenticate, requireRole('entrepreneur', 'admin'), uploadPitchDeck.single('pitch_deck'), ideaController.createIdea);
router.put('/:id', authenticate, requireRole('entrepreneur', 'admin'), uploadPitchDeck.single('pitch_deck'), ideaController.updateIdea);
router.delete('/:id', authenticate, requireRole('entrepreneur', 'admin'), ideaController.deleteIdea);

module.exports = router;
