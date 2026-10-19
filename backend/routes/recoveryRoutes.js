
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

router.post('/admin', async (req, res) => {
  const suppliedKey = req.get('x-recovery-key') || '';
  const expectedKey = process.env.ADMIN_RECOVERY_KEY || '';
  const newPassword = process.env.ADMIN_RECOVERY_PASSWORD || '';

  if (
    !expectedKey ||
    !suppliedKey ||
    !crypto.timingSafeEqual(
      Buffer.from(suppliedKey),
      Buffer.from(expectedKey)
    )
  ) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  if (newPassword.length < 12) {
    return res.status(500).json({
      message: 'Set ADMIN_RECOVERY_PASSWORD to at least 12 characters.'
    });
  }

  try {
    const admin = db.prepare(
      `SELECT id FROM users
       WHERE LOWER(TRIM(email)) = ?
       AND role = 'admin'`
    ).get('admin@ideologist.com');

    if (!admin) {
      return res.status(404).json({
        message: 'Admin account not found in the live database.'
      });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    db.prepare(
      `UPDATE users SET password_hash = ?
       WHERE id = ? AND role = 'admin'`
    ).run(hash, admin.id);

    return res.json({
      success: true,
      message: 'Admin password updated. Other records were not modified.'
    });
  } catch (error) {
    console.error('[Recovery] Admin password update failed:', error.message);
    return res.status(500).json({ message: 'Recovery failed.' });
  }
});

module.exports = router;
