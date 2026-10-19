const express = require('express');
const router = express.Router();
const pitchEventController = require('../controllers/pitchEventController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', pitchEventController.getAllEvents);
router.get('/:id', optionalAuth, pitchEventController.getEventById);

// Entrepreneur application
router.post('/:id/apply', authenticate, requireRole('entrepreneur', 'admin'), pitchEventController.applyToEvent);

// Q&A
router.post('/:id/questions', authenticate, pitchEventController.submitQuestion);
router.put('/questions/:questionId/reply', authenticate, requireRole('entrepreneur', 'admin'), pitchEventController.replyToQuestion);

module.exports = router;
