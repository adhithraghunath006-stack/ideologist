
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

router.post('/admin', async (req, res) => {
  const suppliedKey = req.get('x-recovery-key') || '';
  const expectedKey = process.env.ADMIN_RECOVERY_KEY || '';
  const newPassword = process.env.ADMIN_RECOVERY_PASSWORD || '';

  // Validate the recovery key safely, even if lengths differ.
  const suppliedBuffer = Buffer.from(suppliedKey);
  const expectedBuffer = Buffer.from(expectedKey);

  if (
    !expectedKey ||
    !suppliedKey ||
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return res.status(401).json({
      success: false,
      message: 'Recovery key is missing or incorrect.'
    });
  }

  if (newPassword.length < 12) {
    return res.status(400).json({
      success: false,
      message: 'Set ADMIN_RECOVERY_PASSWORD to at least 12 characters in Render.'
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
        success: false,
        message: 'Admin account not found in the live database.'
      });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    const result = db.prepare(
      `UPDATE users SET password_hash = ?
       WHERE id = ? AND role = 'admin'`
    ).run(hash, admin.id);

    if (Number(result.changes) !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Admin password was not updated.'
      });
    }

    return res.json({
      success: true,
      message: 'Admin password updated successfully.'
    });
  } catch (error) {
    console.error('[Recovery] Admin password update failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Recovery failed. Check Render logs.'
    });
  }
});

module.exports = router;
