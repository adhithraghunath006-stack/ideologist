const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const db = require('./config/db');
const { initDatabase } = require('./models/initDb');
const { calculateViability } = require('./utils/scoringEngine');

async function seed() {
  console.log('[Seed] Initializing database tables...');
  initDatabase();

  // Clear existing records to ensure clean demonstration state
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM audit_logs;');
  db.exec('DELETE FROM pitch_questions;');
  db.exec('DELETE FROM pitch_applications;');
  db.exec('DELETE FROM pitch_events;');
  db.exec('DELETE FROM investor_interests;');
  db.exec('DELETE FROM saved_ideas;');
  db.exec('DELETE FROM pitch_documents;');
  db.exec('DELETE FROM ideas;');
  db.exec('DELETE FROM users;');
  db.exec('PRAGMA foreign_keys = ON;');

  console.log('[Seed] Creating demo pitch deck files in uploads directory...');
  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Generate realistic sample deck files
  const sampleDeck1 = path.join(uploadsDir, 'VoltGrid_Pitch_Deck_2026.pdf');
  const sampleDeck2 = path.join(uploadsDir, 'KisanSetu_Agri_SeriesA.pdf');
  const sampleDeck3 = path.join(uploadsDir, 'MedPulse_Executive_Summary.pdf');
  const sampleDeck4 = path.join(uploadsDir, 'SaaSFlow_PitchDeck_v2.docx');

  // Minimal valid PDF binary headers for browser preview
  const mockPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 24 Tf
100 700 Td
(IDEOLOGIST - Official Pitch Deck Demo) Tj
0 -40 Td
/F1 14 Tf
(Academic Demonstration Project - From an idea to an opportunity) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000416 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
498
%%EOF`;

  fs.writeFileSync(sampleDeck1, mockPdfContent);
  fs.writeFileSync(sampleDeck2, mockPdfContent);
  fs.writeFileSync(sampleDeck3, mockPdfContent);
  fs.writeFileSync(sampleDeck4, 'Sample Office OpenXML Pitch Deck document format for Ideologist demonstration.');

  console.log('[Seed] Hashing passwords...');
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const userPasswordHash = await bcrypt.hash('Password123!', 10);

  console.log('[Seed] Inserting users...');
  // 1. Admin
  const adminInsert = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, city, bio, company)
    VALUES (?, ?, ?, 'admin', 'Bengaluru', 'Chief Platform Administrator and Lead Academic Evaluator.', 'Ideologist Platform Governance')
  `).run('Super Admin', 'admin@ideologist.com', adminPasswordHash);
  const adminId = adminInsert.lastInsertRowid;

  // 2. Entrepreneurs
  const founder1 = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, city, bio, company)
    VALUES (?, ?, ?, 'entrepreneur', 'Pune', 'Hardware and EV Systems engineer with 5 years background in Tier-1 automotive manufacturing.', 'VoltGrid Mobility Labs')
  `).run('Aarav Sharma', 'founder1@ideologist.com', userPasswordHash);
  const f1Id = founder1.lastInsertRowid;

  const founder2 = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, city, bio, company)
    VALUES (?, ?, ?, 'entrepreneur', 'Indore', 'Rural agritech innovator passionate about fair pricing mechanisms and supply chain transparency for smallholder farmers.', 'KisanSetu Rural Technologies')
  `).run('Priya Patel', 'founder2@ideologist.com', userPasswordHash);
  const f2Id = founder2.lastInsertRowid;

  // 3. Investors
  const investor1 = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, city, bio, company, investment_range, preferred_industries)
    VALUES (?, ?, ?, 'investor', 'Mumbai', 'Angel investor focused on early-stage CleanTech, EV Infrastructure, and Sustainable Commerce in Tier-2/3 India.', 'Apex Angel Syndicate', '₹25L - ₹1.5Cr', 'CleanTech, EV Charging, AgriTech')
  `).run('Vikramaditya Singhania', 'investor1@ideologist.com', userPasswordHash);
  const inv1Id = investor1.lastInsertRowid;

  const investor2 = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, city, bio, company, investment_range, preferred_industries)
    VALUES (?, ?, ?, 'investor', 'Bengaluru', 'Partner at Bharat Seed Ventures. Backing high-margin B2B SaaS, FinTech rails, and EdTech.', 'Bharat Seed Ventures', '₹50L - ₹3Cr', 'FinTech, SaaS, EdTech')
  `).run('Ananya Deshmukh', 'investor2@ideologist.com', userPasswordHash);
  const inv2Id = investor2.lastInsertRowid;

  console.log('[Seed] Inserting 8 realistic startup ideas...');
  const startups = [
    {
      user_id: f1Id,
      title: 'VoltGrid Mobility',
      tagline: 'Decentralized Smart EV Fast-Charging Hubs for Tier-2 Highways',
      problem: 'EV adoption along inter-city corridors between Tier-2 towns suffers from severe charging station scarcity, unreliable grid uptime, and prolonged queue times during peak transit hours.',
      solution: 'Battery-buffered solar-assisted modular charging pods that integrate with existing petrol pumps and dhabas, offering 15-minute 80% fast-charging with zero grid transformer upgrades.',
      industry: 'EV Charging',
      stage: 'Early Traction',
      target_city: 'Pune',
      target_customer: 'Intercity commercial fleets, logistics drivers, and EV passenger car owners.',
      funding_target: 7500000,
      equity_offered: 12.0,
      startup_cost: 4500000,
      monthly_revenue: 950000,
      monthly_expense: 520000,
      demand_score: 88,
      competition_score: 52,
      status: 'Published',
      pitch_doc: { fileName: 'VoltGrid_Pitch_Deck_2026.pdf', originalName: 'VoltGrid_Pitch_Deck_2026.pdf', path: sampleDeck1, size: 84000, type: 'pdf' }
    },
    {
      user_id: f2Id,
      title: 'KisanSetu Direct',
      tagline: 'Farm-to-Wholesaler AI Pricing and Direct Logistics Rail',
      problem: 'Marginal farmers lose 32-45% of gross produce value to predatory middleman commissions, inefficient aggregation mandis, and lack of real-time wholesale price transparency.',
      solution: 'Hyperlocal digital mandi app with automated weight scale IoT telemetry and consolidated refrigerated pickup routes, delivering farm-gate payments within 24 hours.',
      industry: 'AgriTech',
      stage: 'MVP',
      target_city: 'Indore',
      target_customer: 'Smallholder cereal and horticulture farmers across Central India.',
      funding_target: 5000000,
      equity_offered: 10.0,
      startup_cost: 3200000,
      monthly_revenue: 780000,
      monthly_expense: 460000,
      demand_score: 85,
      competition_score: 45,
      status: 'Published',
      pitch_doc: { fileName: 'KisanSetu_Agri_SeriesA.pdf', originalName: 'KisanSetu_Agri_SeriesA.pdf', path: sampleDeck2, size: 84000, type: 'pdf' }
    },
    {
      user_id: f1Id,
      title: 'MedPulse Diagnostics',
      tagline: 'Low-Cost Point-of-Care Blood Biomarker Screening for Rural Clinics',
      problem: 'Rural primary health centers wait 48-72 hours for basic lipid, thyroid, and blood count panels, leading to delayed diagnoses and high patient travel expenses.',
      solution: 'Microfluidic portable cartridge scanner delivering lab-accurate blood chemistry results in 8 minutes at one-fourth the cost of commercial reference labs.',
      industry: 'HealthTech',
      stage: 'Prototype',
      target_city: 'Hyderabad',
      target_customer: 'Tier-3 nursing homes, semi-urban diagnostic centers, and NGO health camps.',
      funding_target: 9000000,
      equity_offered: 15.0,
      startup_cost: 5800000,
      monthly_revenue: 1100000,
      monthly_expense: 620000,
      demand_score: 92,
      competition_score: 48,
      status: 'Published',
      pitch_doc: { fileName: 'MedPulse_Executive_Summary.pdf', originalName: 'MedPulse_Executive_Summary.pdf', path: sampleDeck3, size: 84000, type: 'pdf' }
    },
    {
      user_id: f2Id,
      title: 'CodeShala Vernacular',
      tagline: 'Gamified Coding & Engineering Upskilling in 8 Indian Languages',
      problem: 'Over 80% of regional polytechnic and tier-3 college engineering students fail tech interviews due to English-only curriculum barriers and lack of practical project mentoring.',
      solution: 'Byte-sized mobile coding IDE with speech-to-code tutorials in Hindi, Marathi, Tamil, and Telugu, coupled with AI-driven automated resume code reviews.',
      industry: 'EdTech',
      stage: 'Early Traction',
      target_city: 'Jaipur',
      target_customer: 'Diploma students, tier-3 engineering graduates, and vocational IT trainees.',
      funding_target: 3500000,
      equity_offered: 8.0,
      startup_cost: 1800000,
      monthly_revenue: 550000,
      monthly_expense: 280000,
      demand_score: 80,
      competition_score: 65,
      status: 'Published',
      pitch_doc: null
    },
    {
      user_id: f1Id,
      title: 'PayVyapar',
      tagline: 'Zero-MDR Credit-Line Embedded QR for Neighborhood Kirana Stores',
      problem: 'Neighborhood retailers struggle with high micro-merchant loan interest rates (up to 36% APR) and cashflow mismatches when purchasing stock from fast-moving distributors.',
      solution: 'UPI-integrated revolving 14-day credit line with supplier direct-settlement, underwritten by daily transaction velocity data instead of traditional balance sheets.',
      industry: 'FinTech',
      stage: 'MVP',
      target_city: 'Mumbai',
      target_customer: 'Independent grocery merchants and small retail stores.',
      funding_target: 12000000,
      equity_offered: 12.5,
      startup_cost: 7000000,
      monthly_revenue: 1450000,
      monthly_expense: 880000,
      demand_score: 90,
      competition_score: 78,
      status: 'Published',
      pitch_doc: null
    },
    {
      user_id: f2Id,
      title: 'EcoPack Solutions',
      tagline: 'Agricultural Crop-Residue Bio-Plastics for E-Commerce Packaging',
      problem: 'Single-use packaging plastic bans are driving up shipping costs, while seasonal stubble burning causes severe Northern Indian atmospheric smog.',
      solution: 'Upcycling paddy straw waste into 100% home-compostable padded mailers and water-resistant packaging boxes priced at parity with bubble mailers.',
      industry: 'CleanTech',
      stage: 'Prototype',
      target_city: 'Delhi NCR',
      target_customer: 'D2C apparel brands, organic food delivery, and e-commerce fulfilment warehouses.',
      funding_target: 6000000,
      equity_offered: 14.0,
      startup_cost: 3800000,
      monthly_revenue: 650000,
      monthly_expense: 390000,
      demand_score: 86,
      competition_score: 40,
      status: 'Published',
      pitch_doc: null
    },
    {
      user_id: f1Id,
      title: 'SaaSFlow Multi-Cloud Ops',
      tagline: 'Automated Kubernetes FinOps & Idle Cloud Waste Reclamation',
      problem: 'Mid-sized software companies unknowingly overspend 28-35% on underutilized AWS/GCP development clusters and unattached persistent volumes.',
      solution: 'Lightweight agent daemon that monitors pod traffic signatures, automatically hibernate dev/staging instances on weekends, and optimizes spot-fleet instances.',
      industry: 'SaaS',
      stage: 'Early Traction',
      target_city: 'Bengaluru',
      target_customer: 'Series-A to Series-C tech companies with monthly cloud spend > ₹5,00,000.',
      funding_target: 8000000,
      equity_offered: 9.5,
      startup_cost: 2500000,
      monthly_revenue: 1200000,
      monthly_expense: 480000,
      demand_score: 84,
      competition_score: 62,
      status: 'Pending Review', // Demonstration pending submission!
      pitch_doc: { fileName: 'SaaSFlow_PitchDeck_v2.docx', originalName: 'SaaSFlow_PitchDeck_v2.docx', path: sampleDeck4, size: 24000, type: 'docx' }
    },
    {
      user_id: f2Id,
      title: 'QuickHaat Hyperlocal',
      tagline: '15-Minute Artisan Bakery and Fresh Produce Aggregation for Gated Communities',
      problem: 'Residents in large suburban residential townships lack access to fresh artisanal baked goods and farm vegetables without paying exorbitant delivery surcharges.',
      solution: 'Community-partnered micro-distribution hubs in township clubhouses providing scheduled early-morning deliveries with zero delivery fees.',
      industry: 'Hyperlocal Commerce',
      stage: 'Idea',
      target_city: 'Bengaluru',
      target_customer: 'Suburban gated societies and apartment complexes with 500+ units.',
      funding_target: 2000000,
      equity_offered: 15.0,
      startup_cost: 1200000,
      monthly_revenue: 350000,
      monthly_expense: 260000,
      demand_score: 72,
      competition_score: 68,
      status: 'Draft', // Demonstration draft
      pitch_doc: null
    }
  ];

  const seededIdeas = [];
  for (const s of startups) {
    const viability = calculateViability({
      startup_cost: s.startup_cost,
      monthly_revenue: s.monthly_revenue,
      monthly_expense: s.monthly_expense,
      funding_target: s.funding_target,
      equity_offered: s.equity_offered,
      demand_score: s.demand_score,
      competition_score: s.competition_score
    });

    const res = db.prepare(`
      INSERT INTO ideas (
        user_id, title, tagline, problem, solution, industry, stage,
        target_city, target_customer, funding_target, equity_offered,
        startup_cost, monthly_revenue, monthly_expense,
        demand_score, competition_score, viability_score, status, views_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      s.user_id, s.title, s.tagline, s.problem, s.solution, s.industry, s.stage,
      s.target_city, s.target_customer, s.funding_target, s.equity_offered,
      s.startup_cost, s.monthly_revenue, s.monthly_expense,
      s.demand_score, s.competition_score, viability.viabilityScore, s.status,
      Math.floor(Math.random() * 80) + 15
    );

    const ideaId = res.lastInsertRowid;
    seededIdeas.push({ id: ideaId, ...s, viabilityScore: viability.viabilityScore });

    if (s.pitch_doc) {
      db.prepare(`
        INSERT INTO pitch_documents (idea_id, file_name, original_name, file_path, file_size, file_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        ideaId,
        s.pitch_doc.fileName,
        s.pitch_doc.originalName,
        s.pitch_doc.path,
        s.pitch_doc.size,
        s.pitch_doc.type
      );
    }
  }

  console.log('[Seed] Inserting saved bookmarks for investors...');
  // Investor 1 saves VoltGrid and MedPulse
  db.prepare('INSERT INTO saved_ideas (investor_id, idea_id) VALUES (?, ?)').run(inv1Id, seededIdeas[0].id);
  db.prepare('INSERT INTO saved_ideas (investor_id, idea_id) VALUES (?, ?)').run(inv1Id, seededIdeas[2].id);
  // Investor 2 saves PayVyapar and EcoPack
  db.prepare('INSERT INTO saved_ideas (investor_id, idea_id) VALUES (?, ?)').run(inv2Id, seededIdeas[4].id);
  db.prepare('INSERT INTO saved_ideas (investor_id, idea_id) VALUES (?, ?)').run(inv2Id, seededIdeas[5].id);

  console.log('[Seed] Inserting investor interest requests...');
  db.prepare(`
    INSERT INTO investor_interests (investor_id, idea_id, message, status, meeting_date, founder_reply)
    VALUES (?, ?, ?, 'Accepted', '2026-10-24 14:00 IST', 'Looking forward to our call Vikram! Sending Google Meet invite shortly.')
  `).run(
    inv1Id,
    seededIdeas[0].id,
    'Great unit economics on the highway pod fast chargers. Apex Syndicate would like to schedule a 30-minute founder diligence discussion.'
  );

  db.prepare(`
    INSERT INTO investor_interests (investor_id, idea_id, message, status, meeting_date)
    VALUES (?, ?, ?, 'Pending', '2026-10-28 11:30 IST')
  `).run(
    inv2Id,
    seededIdeas[1].id,
    'Impressive farm-gate aggregation model. Bharat Seed Ventures is actively evaluating AgriTech supply chains in Central India. Can we connect?'
  );

  console.log('[Seed] Inserting 2 Virtual Shark Tank pitch events...');
  const event1 = db.prepare(`
    INSERT INTO pitch_events (title, event_date, description, status, max_slots)
    VALUES (?, ?, ?, 'Live Demo', 4)
  `).run(
    'Bharat Seed Summit 2026: CleanTech & Mobility',
    '2026-10-22 18:30 IST',
    'Exclusive live demonstration pitch session featuring selected founders building high-impact energy, mobility, and agricultural innovations.'
  );
  const ev1Id = event1.lastInsertRowid;

  const event2 = db.prepare(`
    INSERT INTO pitch_events (title, event_date, description, status, max_slots)
    VALUES (?, ?, ?, 'Upcoming', 5)
  `).run(
    'FinTech & SaaS Frontier Showcase',
    '2026-11-05 17:00 IST',
    'Quarterly venture showcase highlighting next-generation business software, MSME banking rails, and multi-cloud infrastructure tools.'
  );
  const ev2Id = event2.lastInsertRowid;

  console.log('[Seed] Slotted pitches for events...');
  // Event 1 slots VoltGrid and KisanSetu
  db.prepare(`
    INSERT INTO pitch_applications (event_id, idea_id, status, pitch_slot, notes)
    VALUES (?, ?, 'Approved', 1, 'Keynote mobility pitch.')
  `).run(ev1Id, seededIdeas[0].id);

  db.prepare(`
    INSERT INTO pitch_applications (event_id, idea_id, status, pitch_slot, notes)
    VALUES (?, ?, 'Approved', 2, 'AgriTech supply chain presentation.')
  `).run(ev1Id, seededIdeas[1].id);

  // Event 2 slots PayVyapar
  db.prepare(`
    INSERT INTO pitch_applications (event_id, idea_id, status, pitch_slot, notes)
    VALUES (?, ?, 'Approved', 1, 'MSME credit rails presentation.')
  `).run(ev2Id, seededIdeas[4].id);

  console.log('[Seed] Inserting Q&A threads on Live Demo event...');
  const q1 = db.prepare(`
    INSERT INTO pitch_questions (event_id, idea_id, user_id, question, reply, replied_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    ev1Id,
    seededIdeas[0].id,
    inv1Id,
    'How do you manage battery degradation in extreme summer highway conditions?',
    'We employ liquid-immersion cooling on our lithium iron phosphate (LFP) buffer modules, maintaining core cell temps between 22-28°C even in 45°C ambient heat.'
  );

  db.prepare(`
    INSERT INTO pitch_questions (event_id, idea_id, user_id, question)
    VALUES (?, ?, ?, ?)
  `).run(
    ev1Id,
    seededIdeas[1].id,
    inv2Id,
    'What is your current take-rate on the wholesale mandi transactions?'
  );

  console.log('[Seed] Recording audit log entries...');
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (?, 'SEED_DATABASE_INITIALIZED', 'system', 0, 'Database populated with demonstration accounts, startups, events, and pitch decks.')
  `).run(adminId);

  console.log('================================================================');
  console.log('✅ SEED COMPLETED SUCCESSFULLY!');
  console.log('Demonstration Accounts:');
  console.log('  👑 Admin:         admin@ideologist.com      / Admin123!');
  console.log('  🚀 Entrepreneur: founder1@ideologist.com   / Password123!');
  console.log('  🚀 Entrepreneur: founder2@ideologist.com   / Password123!');
  console.log('  💼 Investor:     investor1@ideologist.com  / Password123!');
  console.log('  💼 Investor:     investor2@ideologist.com  / Password123!');
  console.log('================================================================');
}

seed().catch(err => {
  console.error('Seed execution failed:', err);
  process.exit(1);
});
