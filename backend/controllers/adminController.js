const db = require('../config/db');

function logAudit(adminId, action, targetType, targetId, details) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, action, targetType, targetId, typeof details === 'object' ? JSON.stringify(details) : details);
  } catch (e) {
    console.error('Audit log failed:', e);
  }
}

const adminController = {
  // Admin Dashboard Overview Statistics
  getDashboardStats: (req, res) => {
    try {
      const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      const entrepreneurs = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'entrepreneur'").get().count;
      const investors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'investor'").get().count;
      
      const totalIdeas = db.prepare('SELECT COUNT(*) as count FROM ideas').get().count;
      const pendingIdeas = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE status = 'Pending Review'").get().count;
      const publishedIdeas = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE status = 'Published'").get().count;
      const rejectedIdeas = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE status = 'Rejected'").get().count;

      const totalInterests = db.prepare('SELECT COUNT(*) as count FROM investor_interests').get().count;
      const totalEvents = db.prepare('SELECT COUNT(*) as count FROM pitch_events').get().count;
      const totalDocuments = db.prepare('SELECT COUNT(*) as count FROM pitch_documents').get().count;

      // Recent 5 activities
      const recentAudits = db.prepare(`
        SELECT al.*, u.name as admin_name
        FROM audit_logs al
        LEFT JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 5
      `).all();

      return res.json({
        success: true,
        stats: {
          totalUsers,
          entrepreneurs,
          investors,
          totalIdeas,
          pendingIdeas,
          publishedIdeas,
          rejectedIdeas,
          totalInterests,
          totalEvents,
          totalDocuments
        },
        recentAudits
      });
    } catch (err) {
      console.error('getDashboardStats error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
    }
  },

  // Review Submissions: Get all ideas (with filter by status)
  getAllSubmissions: (req, res) => {
    try {
      const { status } = req.query;
      let sql = `
        SELECT i.*, u.name as founder_name, u.email as founder_email, u.city as founder_city,
               (SELECT COUNT(*) FROM pitch_documents pd WHERE pd.idea_id = i.id) as document_count
        FROM ideas i
        JOIN users u ON i.user_id = u.id
      `;
      const params = [];

      if (status && status !== 'All') {
        sql += ' WHERE i.status = ?';
        params.push(status);
      }

      sql += ' ORDER BY i.created_at DESC';

      const ideas = db.prepare(sql).all(...params);

      return res.json({
        success: true,
        count: ideas.length,
        ideas
      });
    } catch (err) {
      console.error('getAllSubmissions error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve submissions.' });
    }
  },

  // Approve or Reject Idea Submission
  reviewSubmission: (req, res) => {
    try {
      const adminId = req.user.id;
      const ideaId = parseInt(req.params.id, 10);
      const { status, admin_feedback } = req.body;

      if (!['Published', 'Rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be Published or Rejected.' });
      }

      const existing = db.prepare('SELECT id, title, user_id, status FROM ideas WHERE id = ?').get(ideaId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Idea not found.' });
      }

      db.prepare(`
        UPDATE ideas
        SET status = ?,
            admin_feedback = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, admin_feedback || '', ideaId);

      logAudit(adminId, `REVIEW_IDEA_${status.toUpperCase()}`, 'ideas', ideaId, {
        ideaTitle: existing.title,
        oldStatus: existing.status,
        newStatus: status,
        feedback: admin_feedback
      });

      return res.json({
        success: true,
        message: `Idea "${existing.title}" is now ${status}.`
      });
    } catch (err) {
      console.error('reviewSubmission error:', err);
      return res.status(500).json({ success: false, message: 'Failed to review submission.' });
    }
  },

  // Create Pitch Event
  createEvent: (req, res) => {
    try {
      const adminId = req.user.id;
      const { title, event_date, description, max_slots = 5 } = req.body;

      if (!title || !event_date || !description) {
        return res.status(400).json({ success: false, message: 'Title, event date/time, and description are required.' });
      }

      const result = db.prepare(`
        INSERT INTO pitch_events (title, event_date, description, max_slots, status)
        VALUES (?, ?, ?, ?, 'Upcoming')
      `).run(title.trim(), event_date, description.trim(), parseInt(max_slots, 10));

      const eventId = result.lastInsertRowid;
      logAudit(adminId, 'CREATE_PITCH_EVENT', 'pitch_events', eventId, { title, event_date });

      const newEvent = db.prepare('SELECT * FROM pitch_events WHERE id = ?').get(eventId);

      return res.status(201).json({
        success: true,
        message: 'Pitch event created successfully.',
        event: newEvent
      });
    } catch (err) {
      console.error('createEvent error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create pitch event.' });
    }
  },

  // Update Pitch Event Status (e.g. Set Live Demo, Completed)
  updateEventStatus: (req, res) => {
    try {
      const adminId = req.user.id;
      const eventId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!['Upcoming', 'Live Demo', 'Completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be Upcoming, Live Demo, or Completed.' });
      }

      db.prepare('UPDATE pitch_events SET status = ? WHERE id = ?').run(status, eventId);
      logAudit(adminId, 'UPDATE_EVENT_STATUS', 'pitch_events', eventId, { status });

      return res.json({
        success: true,
        message: `Event status updated to "${status}".`
      });
    } catch (err) {
      console.error('updateEventStatus error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update event status.' });
    }
  },

  // Review Event Startup Application & Assign Pitch Slot
  reviewEventApplication: (req, res) => {
    try {
      const adminId = req.user.id;
      const appId = parseInt(req.params.appId, 10);
      const { status, pitch_slot } = req.body;

      if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid application status.' });
      }

      db.prepare(`
        UPDATE pitch_applications
        SET status = ?,
            pitch_slot = ?
        WHERE id = ?
      `).run(status, pitch_slot || null, appId);

      logAudit(adminId, 'REVIEW_PITCH_APP', 'pitch_applications', appId, { status, pitch_slot });

      return res.json({
        success: true,
        message: `Startup application updated to ${status}.`
      });
    } catch (err) {
      console.error('reviewEventApplication error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update application.' });
    }
  },

  // Manage Users
  getAllUsers: (req, res) => {
    try {
      const { search, role, status } = req.query;
      let sql = 'SELECT id, name, email, role, city, company, status, created_at FROM users WHERE 1=1';
      const params = [];

      if (search && search.trim()) {
        sql += ' AND (name LIKE ? OR email LIKE ? OR city LIKE ?)';
        params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
      }

      if (role && role !== 'All') {
        sql += ' AND role = ?';
        params.push(role);
      }

      if (status && status !== 'All') {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC';

      const users = db.prepare(sql).all(...params);

      return res.json({
        success: true,
        count: users.length,
        users
      });
    } catch (err) {
      console.error('getAllUsers error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  },

  // Suspend or Activate User
  toggleUserStatus: (req, res) => {
    try {
      const adminId = req.user.id;
      const targetUserId = parseInt(req.params.id, 10);

      if (targetUserId === adminId) {
        return res.status(400).json({ success: false, message: 'Admin cannot suspend their own account.' });
      }

      const user = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(targetUserId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const nextStatus = user.status === 'active' ? 'suspended' : 'active';
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run(nextStatus, targetUserId);

      logAudit(adminId, `USER_${nextStatus.toUpperCase()}`, 'users', targetUserId, {
        targetEmail: user.email,
        newStatus: nextStatus
      });

      return res.json({
        success: true,
        message: `User ${user.name} is now ${nextStatus}.`,
        user: { ...user, status: nextStatus }
      });
    } catch (err) {
      console.error('toggleUserStatus error:', err);
      return res.status(500).json({ success: false, message: 'Failed to change user status.' });
    }
  },

  // Audit Logs
  getAuditLogs: (req, res) => {
    try {
      const logs = db.prepare(`
        SELECT al.*, u.name as admin_name, u.email as admin_email
        FROM audit_logs al
        LEFT JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 50
      `).all();

      return res.json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (err) {
      console.error('getAuditLogs error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
  }
};

module.exports = adminController;
