const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { calculateViability } = require('../utils/scoringEngine');
const { getLocationInsight } = require('../utils/locationData');

const ideaController = {
  // Public & Investor Catalog
  getPublishedIdeas: (req, res) => {
    try {
      const {
        search,
        industry,
        city,
        stage,
        minFunding,
        maxFunding,
        minScore,
        sortBy = 'newest'
      } = req.query;

      let sql = `
        SELECT i.*, u.name as founder_name, u.city as founder_city,
               (SELECT COUNT(*) FROM pitch_documents pd WHERE pd.idea_id = i.id) as document_count,
               (SELECT COUNT(*) FROM investor_interests ii WHERE ii.idea_id = i.id) as interest_count
        FROM ideas i
        JOIN users u ON i.user_id = u.id
        WHERE i.status = 'Published'
      `;
      const params = [];

      if (search && search.trim()) {
        const query = `%${search.trim()}%`;
        sql += ` AND (i.title LIKE ? OR i.tagline LIKE ? OR i.problem LIKE ? OR i.solution LIKE ? OR i.industry LIKE ? OR i.target_city LIKE ?)`;
        params.push(query, query, query, query, query, query);
      }

      if (industry && industry !== 'All') {
        sql += ` AND i.industry = ?`;
        params.push(industry);
      }

      if (city && city !== 'All') {
        sql += ` AND i.target_city = ?`;
        params.push(city);
      }

      if (stage && stage !== 'All') {
        sql += ` AND i.stage = ?`;
        params.push(stage);
      }

      if (minFunding) {
        sql += ` AND i.funding_target >= ?`;
        params.push(parseFloat(minFunding));
      }

      if (maxFunding) {
        sql += ` AND i.funding_target <= ?`;
        params.push(parseFloat(maxFunding));
      }

      if (minScore) {
        sql += ` AND i.viability_score >= ?`;
        params.push(parseInt(minScore, 10));
      }

      switch (sortBy) {
        case 'score_desc':
          sql += ` ORDER BY i.viability_score DESC, i.created_at DESC`;
          break;
        case 'funding_asc':
          sql += ` ORDER BY i.funding_target ASC`;
          break;
        case 'funding_desc':
          sql += ` ORDER BY i.funding_target DESC`;
          break;
        case 'newest':
        default:
          sql += ` ORDER BY i.created_at DESC`;
          break;
      }

      const ideas = db.prepare(sql).all(...params);

      // If user is authenticated investor, attach is_saved flag
      const userId = req.user ? req.user.id : null;
      let savedIdeaIds = new Set();
      if (userId && req.user.role === 'investor') {
        const saved = db.prepare('SELECT idea_id FROM saved_ideas WHERE investor_id = ?').all(userId);
        savedIdeaIds = new Set(saved.map(s => s.idea_id));
      }

      const enhancedIdeas = ideas.map(idea => ({
        ...idea,
        is_saved: savedIdeaIds.has(idea.id),
        analysis: calculateViability(idea)
      }));

      return res.json({
        success: true,
        count: enhancedIdeas.length,
        ideas: enhancedIdeas
      });
    } catch (err) {
      console.error('getPublishedIdeas error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve startup catalog.' });
    }
  },

  // Detail View of a Startup Idea
  getIdeaById: (req, res) => {
    try {
      const ideaId = parseInt(req.params.id, 10);
      if (isNaN(ideaId)) {
        return res.status(400).json({ success: false, message: 'Invalid idea ID.' });
      }

      const idea = db.prepare(`
        SELECT i.*, u.name as founder_name, u.email as founder_email, u.bio as founder_bio, u.city as founder_city
        FROM ideas i
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
      `).get(ideaId);

      if (!idea) {
        return res.status(404).json({ success: false, message: 'Startup idea not found.' });
      }

      // Check view permissions: Published is public; others only creator or admin
      const isOwner = req.user && req.user.id === idea.user_id;
      const isAdmin = req.user && req.user.role === 'admin';

      if (idea.status !== 'Published' && !isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This idea is currently undergoing review and is not publicly accessible.'
        });
      }

      // Increment view counter if not the owner
      if (!isOwner) {
        db.prepare('UPDATE ideas SET views_count = views_count + 1 WHERE id = ?').run(ideaId);
        idea.views_count += 1;
      }

      // Get attached documents
      const documents = db.prepare(`
        SELECT id, file_name, original_name, file_size, file_type, uploaded_at
        FROM pitch_documents
        WHERE idea_id = ?
        ORDER BY uploaded_at DESC
      `).all(ideaId);

      // Check saved status for investor
      let isSaved = false;
      let hasExpressedInterest = false;
      if (req.user && req.user.role === 'investor') {
        const saved = db.prepare('SELECT id FROM saved_ideas WHERE investor_id = ? AND idea_id = ?').get(req.user.id, ideaId);
        isSaved = !!saved;

        const interest = db.prepare('SELECT id, status, message FROM investor_interests WHERE investor_id = ? AND idea_id = ?').get(req.user.id, ideaId);
        hasExpressedInterest = !!interest;
      }

      // Compute transparent viability report
      const analysis = calculateViability(idea);

      // Compute location insights
      const locationInsight = getLocationInsight(idea.target_city, idea.industry);

      return res.json({
        success: true,
        idea: {
          ...idea,
          is_saved: isSaved,
          has_expressed_interest: hasExpressedInterest,
          documents,
          analysis,
          locationInsight
        }
      });
    } catch (err) {
      console.error('getIdeaById error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve startup details.' });
    }
  },

  // Create Startup Idea
  createIdea: (req, res) => {
    try {
      const userId = req.user.id;
      const {
        title,
        tagline,
        problem,
        solution,
        industry,
        stage,
        target_city,
        target_customer,
        funding_target,
        equity_offered,
        startup_cost,
        monthly_revenue,
        monthly_expense,
        demand_score,
        competition_score,
        status = 'Pending Review'
      } = req.body;

      if (!title || !tagline || !problem || !solution || !industry || !stage || !target_city) {
        return res.status(400).json({
          success: false,
          message: 'All core idea fields (Title, Tagline, Problem, Solution, Industry, Stage, Target City) are required.'
        });
      }

      const parsedStartupCost = parseFloat(startup_cost) || 0;
      const parsedMonthlyRev = parseFloat(monthly_revenue) || 0;
      const parsedMonthlyExp = parseFloat(monthly_expense) || 0;
      const parsedFunding = parseFloat(funding_target) || 0;
      const parsedEquity = parseFloat(equity_offered) || 10;
      const parsedDemand = parseInt(demand_score, 10) || 75;
      const parsedCompetition = parseInt(competition_score, 10) || 60;

      // Calculate transparent viability score
      const viabilityCalc = calculateViability({
        startup_cost: parsedStartupCost,
        monthly_revenue: parsedMonthlyRev,
        monthly_expense: parsedMonthlyExp,
        funding_target: parsedFunding,
        equity_offered: parsedEquity,
        demand_score: parsedDemand,
        competition_score: parsedCompetition
      });

      const allowedStatus = status === 'Draft' ? 'Draft' : 'Pending Review';

      const insertResult = db.prepare(`
        INSERT INTO ideas (
          user_id, title, tagline, problem, solution, industry, stage,
          target_city, target_customer, funding_target, equity_offered,
          startup_cost, monthly_revenue, monthly_expense,
          demand_score, competition_score, viability_score, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        title.trim(),
        tagline.trim(),
        problem.trim(),
        solution.trim(),
        industry.trim(),
        stage,
        target_city.trim(),
        target_customer || 'General Consumers / Businesses',
        parsedFunding,
        parsedEquity,
        parsedStartupCost,
        parsedMonthlyRev,
        parsedMonthlyExp,
        parsedDemand,
        parsedCompetition,
        viabilityCalc.viabilityScore,
        allowedStatus
      );

      const ideaId = insertResult.lastInsertRowid;

      // Handle attached file if uploaded
      let documentRecord = null;
      if (req.file) {
        const docResult = db.prepare(`
          INSERT INTO pitch_documents (idea_id, file_name, original_name, file_path, file_size, file_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          ideaId,
          req.file.filename,
          req.file.originalname,
          req.file.path,
          req.file.size,
          path.extname(req.file.originalname).toLowerCase().replace('.', '')
        );

        documentRecord = {
          id: docResult.lastInsertRowid,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size
        };
      }

      const createdIdea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);

      return res.status(201).json({
        success: true,
        message: allowedStatus === 'Draft' 
          ? 'Idea saved as draft.' 
          : 'Idea submitted successfully for Admin review!',
        idea: {
          ...createdIdea,
          analysis: viabilityCalc,
          document: documentRecord
        }
      });
    } catch (err) {
      console.error('createIdea error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create business idea submission.' });
    }
  },

  // Edit Idea (Only owner when in Draft or Pending Review)
  updateIdea: (req, res) => {
    try {
      const ideaId = parseInt(req.params.id, 10);
      const userId = req.user.id;

      const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Startup idea not found.' });
      }

      if (existing.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this idea.' });
      }

      const {
        title,
        tagline,
        problem,
        solution,
        industry,
        stage,
        target_city,
        target_customer,
        funding_target,
        equity_offered,
        startup_cost,
        monthly_revenue,
        monthly_expense,
        demand_score,
        competition_score,
        status
      } = req.body;

      const parsedStartupCost = startup_cost !== undefined ? parseFloat(startup_cost) : existing.startup_cost;
      const parsedMonthlyRev = monthly_revenue !== undefined ? parseFloat(monthly_revenue) : existing.monthly_revenue;
      const parsedMonthlyExp = monthly_expense !== undefined ? parseFloat(monthly_expense) : existing.monthly_expense;
      const parsedFunding = funding_target !== undefined ? parseFloat(funding_target) : existing.funding_target;
      const parsedEquity = equity_offered !== undefined ? parseFloat(equity_offered) : existing.equity_offered;
      const parsedDemand = demand_score !== undefined ? parseInt(demand_score, 10) : existing.demand_score;
      const parsedCompetition = competition_score !== undefined ? parseInt(competition_score, 10) : existing.competition_score;

      const viabilityCalc = calculateViability({
        startup_cost: parsedStartupCost,
        monthly_revenue: parsedMonthlyRev,
        monthly_expense: parsedMonthlyExp,
        funding_target: parsedFunding,
        equity_offered: parsedEquity,
        demand_score: parsedDemand,
        competition_score: parsedCompetition
      });

      let nextStatus = existing.status;
      if (status && ['Draft', 'Pending Review'].includes(status)) {
        nextStatus = status;
      }

      db.prepare(`
        UPDATE ideas
        SET title = COALESCE(?, title),
            tagline = COALESCE(?, tagline),
            problem = COALESCE(?, problem),
            solution = COALESCE(?, solution),
            industry = COALESCE(?, industry),
            stage = COALESCE(?, stage),
            target_city = COALESCE(?, target_city),
            target_customer = COALESCE(?, target_customer),
            funding_target = ?,
            equity_offered = ?,
            startup_cost = ?,
            monthly_revenue = ?,
            monthly_expense = ?,
            demand_score = ?,
            competition_score = ?,
            viability_score = ?,
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        title,
        tagline,
        problem,
        solution,
        industry,
        stage,
        target_city,
        target_customer,
        parsedFunding,
        parsedEquity,
        parsedStartupCost,
        parsedMonthlyRev,
        parsedMonthlyExp,
        parsedDemand,
        parsedCompetition,
        viabilityCalc.viabilityScore,
        nextStatus,
        ideaId
      );

      // Handle new pitch document if provided
      if (req.file) {
        db.prepare(`
          INSERT INTO pitch_documents (idea_id, file_name, original_name, file_path, file_size, file_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          ideaId,
          req.file.filename,
          req.file.originalname,
          req.file.path,
          req.file.size,
          path.extname(req.file.originalname).toLowerCase().replace('.', '')
        );
      }

      const updated = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);

      return res.json({
        success: true,
        message: 'Idea updated successfully.',
        idea: {
          ...updated,
          analysis: viabilityCalc
        }
      });
    } catch (err) {
      console.error('updateIdea error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update idea.' });
    }
  },

  // Delete Idea (Only owner when in Draft or Admin)
  deleteIdea: (req, res) => {
    try {
      const ideaId = parseInt(req.params.id, 10);
      const userId = req.user.id;

      const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Idea not found.' });
      }

      if (existing.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this idea.' });
      }

      // Remove physical files
      const documents = db.prepare('SELECT file_path FROM pitch_documents WHERE idea_id = ?').all(ideaId);
      for (const doc of documents) {
        if (fs.existsSync(doc.file_path)) {
          try {
            fs.unlinkSync(doc.file_path);
          } catch (e) {
            console.error('File cleanup warning:', e);
          }
        }
      }

      db.prepare('DELETE FROM ideas WHERE id = ?').run(ideaId);

      return res.json({
        success: true,
        message: 'Idea and related assets deleted successfully.'
      });
    } catch (err) {
      console.error('deleteIdea error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete idea.' });
    }
  },

  // Get My Ideas (Entrepreneur Dashboard)
  getMyIdeas: (req, res) => {
    try {
      const userId = req.user.id;

      const ideas = db.prepare(`
        SELECT i.*,
               (SELECT COUNT(*) FROM pitch_documents pd WHERE pd.idea_id = i.id) as document_count,
               (SELECT COUNT(*) FROM investor_interests ii WHERE ii.idea_id = i.id) as interest_count,
               (SELECT COUNT(*) FROM saved_ideas si WHERE si.idea_id = i.id) as saved_count
        FROM ideas i
        WHERE i.user_id = ?
        ORDER BY i.created_at DESC
      `).all(userId);

      const enhanced = ideas.map(idea => ({
        ...idea,
        analysis: calculateViability(idea)
      }));

      // Calculate entrepreneur stats
      const totalCreated = ideas.length;
      const totalViews = ideas.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
      const totalInterests = ideas.reduce((acc, curr) => acc + (curr.interest_count || 0), 0);
      const avgScore = totalCreated > 0 
        ? Math.round(ideas.reduce((acc, curr) => acc + curr.viability_score, 0) / totalCreated)
        : 0;

      return res.json({
        success: true,
        stats: {
          totalCreated,
          totalViews,
          totalInterests,
          avgScore
        },
        ideas: enhanced
      });
    } catch (err) {
      console.error('getMyIdeas error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve your business ideas.' });
    }
  },

  // On-the-fly Viability Score Calculation for wizard preview
  calculateRealtimeViability: (req, res) => {
    try {
      const calculation = calculateViability(req.body);
      const location = req.body.target_city ? getLocationInsight(req.body.target_city, req.body.industry) : null;

      return res.json({
        success: true,
        calculation,
        location
      });
    } catch (err) {
      console.error('calculateRealtimeViability error:', err);
      return res.status(500).json({ success: false, message: 'Failed to compute viability score.' });
    }
  },

  // Download / View Pitch Deck Document
  downloadDocument: (req, res) => {
    try {
      const docId = parseInt(req.params.docId, 10);
      const doc = db.prepare('SELECT * FROM pitch_documents WHERE id = ?').get(docId);

      if (!doc) {
        return res.status(404).json({ success: false, message: 'Pitch deck document not found.' });
      }

      if (!fs.existsSync(doc.file_path)) {
        return res.status(404).json({ success: false, message: 'File is missing from storage server.' });
      }

      const ext = path.extname(doc.original_name).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${doc.original_name}"`);
      }

      const stream = fs.createReadStream(doc.file_path);
      stream.pipe(res);
    } catch (err) {
      console.error('downloadDocument error:', err);
      return res.status(500).json({ success: false, message: 'Failed to download document.' });
    }
  }
};

module.exports = ideaController;
