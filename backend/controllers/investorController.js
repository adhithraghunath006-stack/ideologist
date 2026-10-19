const db = require('../config/db');
const { calculateViability } = require('../utils/scoringEngine');

const investorController = {
  // Toggle bookmark / saved idea
  toggleSaveIdea: (req, res) => {
    try {
      const investorId = req.user.id;
      const ideaId = parseInt(req.body.idea_id, 10);

      if (!ideaId) {
        return res.status(400).json({ success: false, message: 'Valid idea_id is required.' });
      }

      const existing = db.prepare('SELECT id FROM saved_ideas WHERE investor_id = ? AND idea_id = ?').get(investorId, ideaId);

      if (existing) {
        db.prepare('DELETE FROM saved_ideas WHERE id = ?').run(existing.id);
        return res.json({
          success: true,
          saved: false,
          message: 'Idea removed from your saved bookmarks.'
        });
      } else {
        db.prepare('INSERT INTO saved_ideas (investor_id, idea_id) VALUES (?, ?)').run(investorId, ideaId);
        return res.json({
          success: true,
          saved: true,
          message: 'Idea saved to your investment watchlist.'
        });
      }
    } catch (err) {
      console.error('toggleSaveIdea error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update saved ideas.' });
    }
  },

  // Get saved ideas for logged in investor
  getSavedIdeas: (req, res) => {
    try {
      const investorId = req.user.id;

      const savedList = db.prepare(`
        SELECT i.*, u.name as founder_name, u.city as founder_city,
               si.created_at as saved_at,
               (SELECT COUNT(*) FROM pitch_documents pd WHERE pd.idea_id = i.id) as document_count,
               (SELECT COUNT(*) FROM investor_interests ii WHERE ii.idea_id = i.id) as interest_count
        FROM saved_ideas si
        JOIN ideas i ON si.idea_id = i.id
        JOIN users u ON i.user_id = u.id
        WHERE si.investor_id = ?
        ORDER BY si.created_at DESC
      `).all(investorId);

      const enhanced = savedList.map(item => ({
        ...item,
        is_saved: true,
        analysis: calculateViability(item)
      }));

      return res.json({
        success: true,
        count: enhanced.length,
        savedIdeas: enhanced
      });
    } catch (err) {
      console.error('getSavedIdeas error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve saved opportunities.' });
    }
  },

  // Express interest / Request meeting
  expressInterest: (req, res) => {
    try {
      const investorId = req.user.id;
      const { idea_id, message, meeting_date } = req.body;

      if (!idea_id || !message) {
        return res.status(400).json({
          success: false,
          message: 'Idea ID and an introductory note/message are required.'
        });
      }

      const idea = db.prepare("SELECT id, user_id, title FROM ideas WHERE id = ? AND status = 'Published'").get(idea_id);
      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Published startup opportunity not found.'
        });
      }

      if (idea.user_id === investorId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot express investor interest in your own startup idea.'
        });
      }

      const existingInterest = db.prepare('SELECT id, status FROM investor_interests WHERE investor_id = ? AND idea_id = ?').get(investorId, idea_id);

      if (existingInterest) {
        return res.status(400).json({
          success: false,
          message: `You have already sent an interest request for "${idea.title}" (Status: ${existingInterest.status}).`
        });
      }

      const result = db.prepare(`
        INSERT INTO investor_interests (investor_id, idea_id, message, meeting_date, status)
        VALUES (?, ?, ?, ?, 'Pending')
      `).run(investorId, idea_id, message.trim(), meeting_date || null);

      return res.status(201).json({
        success: true,
        message: 'Your expression of interest and meeting request has been dispatched to the founder!',
        interestId: result.lastInsertRowid
      });
    } catch (err) {
      console.error('expressInterest error:', err);
      return res.status(500).json({ success: false, message: 'Failed to dispatch interest request.' });
    }
  },

  // Get interests sent by the logged-in investor
  getMySentInterests: (req, res) => {
    try {
      const investorId = req.user.id;

      const interests = db.prepare(`
        SELECT ii.*, i.title as idea_title, i.industry, i.target_city, i.funding_target, i.equity_offered,
               u.name as founder_name, u.email as founder_email
        FROM investor_interests ii
        JOIN ideas i ON ii.idea_id = i.id
        JOIN users u ON i.user_id = u.id
        WHERE ii.investor_id = ?
        ORDER BY ii.created_at DESC
      `).all(investorId);

      return res.json({
        success: true,
        count: interests.length,
        interests
      });
    } catch (err) {
      console.error('getMySentInterests error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve your sent interests.' });
    }
  },

  // Get interests received by the logged-in entrepreneur for their startups
  getReceivedInterests: (req, res) => {
    try {
      const entrepreneurId = req.user.id;

      const interests = db.prepare(`
        SELECT ii.*, i.title as idea_title,
               u.name as investor_name, u.email as investor_email, u.company as investor_company,
               u.investment_range as investor_range, u.bio as investor_bio
        FROM investor_interests ii
        JOIN ideas i ON ii.idea_id = i.id
        JOIN users u ON ii.investor_id = u.id
        WHERE i.user_id = ?
        ORDER BY ii.created_at DESC
      `).all(entrepreneurId);

      return res.json({
        success: true,
        count: interests.length,
        interests
      });
    } catch (err) {
      console.error('getReceivedInterests error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve received investor inquiries.' });
    }
  },

  // Founder responds to investor interest (Accept / Decline / Reply)
  respondToInterest: (req, res) => {
    try {
      const entrepreneurId = req.user.id;
      const interestId = parseInt(req.params.id, 10);
      const { status, founder_reply, meeting_date } = req.body;

      if (!['Accepted', 'Declined', 'Pending'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be Accepted, Declined, or Pending.' });
      }

      // Verify that this interest belongs to an idea owned by this entrepreneur
      const record = db.prepare(`
        SELECT ii.*, i.user_id as owner_id
        FROM investor_interests ii
        JOIN ideas i ON ii.idea_id = i.id
        WHERE ii.id = ?
      `).get(interestId);

      if (!record) {
        return res.status(404).json({ success: false, message: 'Investor request not found.' });
      }

      if (record.owner_id !== entrepreneurId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to respond to this request.' });
      }

      db.prepare(`
        UPDATE investor_interests
        SET status = ?,
            founder_reply = COALESCE(?, founder_reply),
            meeting_date = COALESCE(?, meeting_date)
        WHERE id = ?
      `).run(status, founder_reply, meeting_date, interestId);

      const updated = db.prepare('SELECT * FROM investor_interests WHERE id = ?').get(interestId);

      return res.json({
        success: true,
        message: `Investor request updated to ${status}.`,
        interest: updated
      });
    } catch (err) {
      console.error('respondToInterest error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update interest request response.' });
    }
  }
};

module.exports = investorController;
