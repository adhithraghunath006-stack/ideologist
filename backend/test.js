/**
 * Automated Test Suite for Ideologist
 * Verifies calculations, auth rules, database relationships, and API logic.
 */

const assert = require('assert');
const { calculateViability } = require('./utils/scoringEngine');
const { getLocationInsight } = require('./utils/locationData');
const db = require('./config/db');

console.log('🧪 Starting Ideologist Automated Test Suite...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// 1. Scoring Engine Tests
test('Viability Engine: Positive Cashflow & Healthy Margin', () => {
  const result = calculateViability({
    startup_cost: 3000000,
    monthly_revenue: 800000,
    monthly_expense: 450000,
    funding_target: 5000000,
    equity_offered: 10,
    demand_score: 85,
    competition_score: 50
  });

  assert.strictEqual(result.metrics.monthlyProfit, 350000);
  assert.strictEqual(result.metrics.breakEvenMonths, 9);
  assert.ok(result.viabilityScore >= 70, `Expected score >= 70, got ${result.viabilityScore}`);
  assert.strictEqual(result.grade, 'High Viability');
});

test('Viability Engine: Zero Monthly Profit (Division by Zero Safety)', () => {
  const result = calculateViability({
    startup_cost: 2000000,
    monthly_revenue: 300000,
    monthly_expense: 300000,
    funding_target: 2000000,
    equity_offered: 15,
    demand_score: 60,
    competition_score: 60
  });

  assert.strictEqual(result.metrics.monthlyProfit, 0);
  assert.strictEqual(result.metrics.breakEvenMonths, null);
  assert.ok(!isNaN(result.viabilityScore));
  assert.ok(result.viabilityScore <= 60);
});

test('Viability Engine: Negative Monthly Cashflow (Burning Capital)', () => {
  const result = calculateViability({
    startup_cost: 5000000,
    monthly_revenue: 100000,
    monthly_expense: 400000,
    funding_target: 10000000,
    equity_offered: 20,
    demand_score: 50,
    competition_score: 80
  });

  assert.strictEqual(result.metrics.monthlyProfit, -300000);
  assert.strictEqual(result.metrics.breakEvenMonths, null);
  assert.ok(!isNaN(result.viabilityScore));
  assert.ok(result.viabilityScore < 45);
});

// 2. Location Insights Tests
test('Location Engine: Tier-1 Hub Benchmarks', () => {
  const info = getLocationInsight('Bengaluru', 'FinTech');
  assert.strictEqual(info.profile.tier, 'Tier 1');
  assert.strictEqual(info.profile.costIndex, 1.35);
  assert.ok(info.mapUrl.includes('openstreetmap.org'));
  assert.strictEqual(info.industryFit, 'High Strategic Alignment');
});

test('Location Engine: Tier-2 Hub Benchmarks & Alternatives', () => {
  const info = getLocationInsight('Indore', 'AgriTech');
  assert.strictEqual(info.profile.tier, 'Tier 2');
  assert.ok(info.profile.costIndex < 1.0);
  assert.strictEqual(info.industryFit, 'High Strategic Alignment');
});

// 3. Database Persistence & Foreign Keys
test('Database: Seed Users Exist and Password Hashed', () => {
  const admin = db.prepare("SELECT * FROM users WHERE email = 'admin@ideologist.com'").get();
  assert.ok(admin, 'Admin account should exist');
  assert.strictEqual(admin.role, 'admin');
  assert.ok(admin.password_hash.startsWith('$2'), 'Password should be hashed');

  const founder = db.prepare("SELECT * FROM users WHERE email = 'founder1@ideologist.com'").get();
  assert.ok(founder, 'Founder account should exist');
  assert.strictEqual(founder.role, 'entrepreneur');
});

test('Database: Seed Startups & Published Filtering', () => {
  const publishedIdeas = db.prepare("SELECT * FROM ideas WHERE status = 'Published'").all();
  assert.ok(publishedIdeas.length >= 6, `Expected at least 6 published ideas, got ${publishedIdeas.length}`);

  const pendingIdeas = db.prepare("SELECT * FROM ideas WHERE status = 'Pending Review'").all();
  assert.ok(pendingIdeas.length >= 1, 'Expected at least 1 pending review idea');
});

test('Database: Pitch Events & Approved Pitches', () => {
  const events = db.prepare('SELECT * FROM pitch_events').all();
  assert.strictEqual(events.length, 2, 'Expected 2 pitch events');

  const liveEvent = events.find(e => e.status === 'Live Demo');
  assert.ok(liveEvent, 'Expected a Live Demo event');

  const slottedPitches = db.prepare("SELECT * FROM pitch_applications WHERE event_id = ? AND status = 'Approved'").all(liveEvent.id);
  assert.ok(slottedPitches.length >= 2, 'Expected at least 2 slotted startups in live event');
});

test('Database: Investor Watchlist / Bookmarks', () => {
  const saved = db.prepare('SELECT * FROM saved_ideas').all();
  assert.ok(saved.length >= 2, 'Expected saved bookmarks');
});

console.log('\n====================================================');
console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
