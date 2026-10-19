const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../middleware/authMiddleware');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, city, bio, company, investment_range, preferred_industries } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
      }

      // Explicit security rule: prevent users from registering as admin
      if (role !== 'entrepreneur' && role !== 'investor') {
        return res.status(400).json({
          success: false,
          message: 'Invalid role selection. Only Entrepreneur and Investor roles can register publicly.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }

      // Check existing email
      const normalizedEmail = email.toLowerCase().trim();
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const result = db.prepare(`
        INSERT INTO users (name, email, password_hash, role, city, bio, company, investment_range, preferred_industries)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        name.trim(),
        normalizedEmail,
        password_hash,
        role,
        city || '',
        bio || '',
        company || '',
        investment_range || '',
        preferred_industries || ''
      );

      const user = db.prepare('SELECT id, name, email, role, city, bio, company, investment_range, preferred_industries, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
      const token = signToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Safe user object without password
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        bio: user.bio,
        company: user.company,
        investment_range: user.investment_range,
        preferred_industries: user.preferred_industries,
        status: user.status,
        created_at: user.created_at
      };

      const token = signToken(safeUser);

      return res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: safeUser
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
  },

  getMe: (req, res) => {
    return res.json({
      success: true,
      user: req.user
    });
  },

  updateProfile: (req, res) => {
    try {
      const { name, city, bio, company, investment_range, preferred_industries } = req.body;
      const userId = req.user.id;

      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            city = COALESCE(?, city),
            bio = COALESCE(?, bio),
            company = COALESCE(?, company),
            investment_range = COALESCE(?, investment_range),
            preferred_industries = COALESCE(?, preferred_industries)
        WHERE id = ?
      `).run(name, city, bio, company, investment_range, preferred_industries, userId);

      const updated = db.prepare('SELECT id, name, email, role, city, bio, company, investment_range, preferred_industries, status, created_at FROM users WHERE id = ?').get(userId);

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: updated
      });
    } catch (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }
};

module.exports = authController;
