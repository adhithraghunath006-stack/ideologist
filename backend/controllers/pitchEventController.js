const db = require('../config/db');

const pitchEventController = {
  // Get all pitch events
  getAllEvents: (req, res) => {
    try {
      const events = db.prepare(`
        SELECT pe.*,
               (SELECT COUNT(*) FROM pitch_applications pa WHERE pa.event_id = pe.id AND pa.status = 'Approved') as approved_startups_count,
               (SELECT COUNT(*) FROM pitch_questions pq WHERE pq.event_id = pe.id) as questions_count
        FROM pitch_events pe
        ORDER BY 
          CASE pe.status
            WHEN 'Live Demo' THEN 1
            WHEN 'Upcoming' THEN 2
            WHEN 'Completed' THEN 3
            ELSE 4
          END,
          pe.event_date ASC
      `).all();

      return res.json({
        success: true,
        count: events.length,
        events
      });
    } catch (err) {
      console.error('getAllEvents error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve pitch events.' });
    }
  },

  // Get single event with applications, pitches, and Q&A thread
  getEventById: (req, res) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      const event = db.prepare('SELECT * FROM pitch_events WHERE id = ?').get(eventId);

      if (!event) {
        return res.status(404).json({ success: false, message: 'Pitch event not found.' });
      }

      // Approved startups slotted in this session
      const pitches = db.prepare(`
        SELECT pa.id as application_id, pa.status as app_status, pa.pitch_slot, pa.notes,
               i.id as idea_id, i.title, i.tagline, i.industry, i.stage, i.target_city,
               i.funding_target, i.equity_offered, i.viability_score,
               u.id as founder_id, u.name as founder_name, u.email as founder_email
        FROM pitch_applications pa
        JOIN ideas i ON pa.idea_id = i.id
        JOIN users u ON i.user_id = u.id
        WHERE pa.event_id = ? AND pa.status = 'Approved'
        ORDER BY COALESCE(pa.pitch_slot, 99) ASC
      `).all(eventId);

      // Questions with replies
      const questions = db.prepare(`
        SELECT pq.*, u.name as asker_name, u.role as asker_role,
               i.title as idea_title
        FROM pitch_questions pq
        JOIN users u ON pq.user_id = u.id
        JOIN ideas i ON pq.idea_id = i.id
        WHERE pq.event_id = ?
        ORDER BY pq.created_at DESC
      `).all(eventId);

      // Check if user has applied with any idea
      let myApplication = null;
      if (req.user && req.user.role === 'entrepreneur') {
        myApplication = db.prepare(`
          SELECT pa.*, i.title as idea_title
          FROM pitch_applications pa
          JOIN ideas i ON pa.idea_id = i.id
          WHERE pa.event_id = ? AND i.user_id = ?
        `).get(eventId, req.user.id);
      }

      return res.json({
        success: true,
        event,
        pitches,
        questions,
        myApplication
      });
    } catch (err) {
      console.error('getEventById error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve event details.' });
    }
  },

  // Entrepreneur applies with a published startup
  applyToEvent: (req, res) => {
    try {
      const userId = req.user.id;
      const eventId = parseInt(req.params.id, 10);
      const { idea_id, notes } = req.body;

      if (!idea_id) {
        return res.status(400).json({ success: false, message: 'Must select an idea to apply.' });
      }

      const idea = db.prepare('SELECT id, user_id, title, status FROM ideas WHERE id = ?').get(idea_id);
      if (!idea || idea.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Idea not found or not owned by you.' });
      }

      if (idea.status !== 'Published') {
        return res.status(400).json({
          success: false,
          message: 'Only published and approved ideas can apply to Virtual Shark Tank pitching events.'
        });
      }

      const existing = db.prepare('SELECT id, status FROM pitch_applications WHERE event_id = ? AND idea_id = ?').get(eventId, idea_id);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `This startup has already applied to this event (Current Status: ${existing.status}).`
        });
      }

      const result = db.prepare(`
        INSERT INTO pitch_applications (event_id, idea_id, notes, status)
        VALUES (?, ?, ?, 'Pending')
      `).run(eventId, idea_id, notes || 'Eager to present to angel syndicate.');

      return res.status(201).json({
        success: true,
        message: 'Pitch application submitted for Admin slot allocation!',
        applicationId: result.lastInsertRowid
      });
    } catch (err) {
      console.error('applyToEvent error:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit pitch application.' });
    }
  },

  // Submit Q&A question during pitching event
  submitQuestion: (req, res) => {
    try {
      const userId = req.user.id;
      const eventId = parseInt(req.params.id, 10);
      const { idea_id, question } = req.body;

      if (!idea_id || !question || !question.trim()) {
        return res.status(400).json({ success: false, message: 'Idea ID and question text are required.' });
      }

      const result = db.prepare(`
        INSERT INTO pitch_questions (event_id, idea_id, user_id, question)
        VALUES (?, ?, ?, ?)
      `).run(eventId, idea_id, userId, question.trim());

      const createdQuestion = db.prepare(`
        SELECT pq.*, u.name as asker_name, u.role as asker_role, i.title as idea_title
        FROM pitch_questions pq
        JOIN users u ON pq.user_id = u.id
        JOIN ideas i ON pq.idea_id = i.id
        WHERE pq.id = ?
      `).get(result.lastInsertRowid);

      return res.status(201).json({
        success: true,
        message: 'Question posted to pitch floor.',
        question: createdQuestion
      });
    } catch (err) {
      console.error('submitQuestion error:', err);
      return res.status(500).json({ success: false, message: 'Failed to post question.' });
    }
  },

  // Founder replies to question
  replyToQuestion: (req, res) => {
    try {
      const userId = req.user.id;
      const questionId = parseInt(req.params.questionId, 10);
      const { reply } = req.body;

      if (!reply || !reply.trim()) {
        return res.status(400).json({ success: false, message: 'Reply text is required.' });
      }

      const questionRecord = db.prepare(`
        SELECT pq.*, i.user_id as owner_id
        FROM pitch_questions pq
        JOIN ideas i ON pq.idea_id = i.id
        WHERE pq.id = ?
      `).get(questionId);

      if (!questionRecord) {
        return res.status(404).json({ success: false, message: 'Question not found.' });
      }

      if (questionRecord.owner_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only the startup founder or admin can reply.' });
      }

      db.prepare(`
        UPDATE pitch_questions
        SET reply = ?,
            replied_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(reply.trim(), questionId);

      const updated = db.prepare(`
        SELECT pq.*, u.name as asker_name, u.role as asker_role, i.title as idea_title
        FROM pitch_questions pq
        JOIN users u ON pq.user_id = u.id
        JOIN ideas i ON pq.idea_id = i.id
        WHERE pq.id = ?
      `).get(questionId);

      return res.json({
        success: true,
        message: 'Reply submitted successfully.',
        question: updated
      });
    } catch (err) {
      console.error('replyToQuestion error:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit reply.' });
    }
  }
};

module.exports = pitchEventController;
