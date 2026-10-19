const express = require('express');
const router = express.Router();
const investorController = require('../controllers/investorController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Investor actions
router.post('/saved/toggle', authenticate, requireRole('investor', 'admin'), investorController.toggleSaveIdea);
router.get('/saved', authenticate, requireRole('investor', 'admin'), investorController.getSavedIdeas);
router.post('/interest', authenticate, requireRole('investor', 'admin'), investorController.expressInterest);
router.get('/sent-interests', authenticate, requireRole('investor', 'admin'), investorController.getMySentInterests);

// Entrepreneur managing received investor requests
router.get('/received-interests', authenticate, requireRole('entrepreneur', 'admin'), investorController.getReceivedInterests);
router.put('/interest/:id/respond', authenticate, requireRole('entrepreneur', 'admin'), investorController.respondToInterest);

module.exports = router;
