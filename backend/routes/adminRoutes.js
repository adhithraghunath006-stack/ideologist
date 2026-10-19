const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// All admin routes require admin role
router.use(authenticate, requireRole('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/submissions', adminController.getAllSubmissions);
router.put('/submissions/:id/review', adminController.reviewSubmission);

router.post('/events', adminController.createEvent);
router.put('/events/:id/status', adminController.updateEventStatus);
router.put('/applications/:appId/review', adminController.reviewEventApplication);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
