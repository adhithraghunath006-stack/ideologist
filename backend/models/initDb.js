const db = require('../config/db');

function initDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('entrepreneur', 'investor', 'admin')),
      city TEXT,
      bio TEXT,
      company TEXT,
      investment_range TEXT,
      preferred_industries TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      tagline TEXT NOT NULL,
      problem TEXT NOT NULL,
      solution TEXT NOT NULL,
      industry TEXT NOT NULL,
      stage TEXT NOT NULL CHECK(stage IN ('Idea', 'Prototype', 'MVP', 'Early Traction', 'Scaling')),
      target_city TEXT NOT NULL,
      target_customer TEXT NOT NULL,
      funding_target REAL NOT NULL,
      equity_offered REAL NOT NULL,
      startup_cost REAL NOT NULL,
      monthly_revenue REAL NOT NULL,
      monthly_expense REAL NOT NULL,
      demand_score INTEGER DEFAULT 75,
      competition_score INTEGER DEFAULT 60,
      viability_score INTEGER NOT NULL DEFAULT 50,
      status TEXT DEFAULT 'Pending Review' CHECK(status IN ('Draft', 'Pending Review', 'Published', 'Rejected')),
      admin_feedback TEXT,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pitch_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      investor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(investor_id, idea_id)
    );

    CREATE TABLE IF NOT EXISTS investor_interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      investor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Accepted', 'Declined')),
      meeting_date TEXT,
      founder_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pitch_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Live Demo', 'Completed')),
      max_slots INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pitch_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES pitch_events(id) ON DELETE CASCADE,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      pitch_slot INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, idea_id)
    );

    CREATE TABLE IF NOT EXISTS pitch_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES pitch_events(id) ON DELETE CASCADE,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      reply TEXT,
      replied_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indices for query performance
    CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
    CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
    CREATE INDEX IF NOT EXISTS idx_ideas_industry ON ideas(industry);
    CREATE INDEX IF NOT EXISTS idx_ideas_city ON ideas(target_city);
    CREATE INDEX IF NOT EXISTS idx_saved_ideas_investor ON saved_ideas(investor_id);
    CREATE INDEX IF NOT EXISTS idx_investor_interests_idea ON investor_interests(idea_id);
    CREATE INDEX IF NOT EXISTS idx_investor_interests_investor ON investor_interests(investor_id);
    CREATE INDEX IF NOT EXISTS idx_pitch_apps_event ON pitch_applications(event_id);
    CREATE INDEX IF NOT EXISTS idx_pitch_questions_event ON pitch_questions(event_id);
  `;

  db.exec(schema);
  console.log('[Database] Tables and indexes verified/created successfully.');
}

module.exports = { initDatabase };
