import { Router } from 'express';
import { db } from '../db/index-sqlite';
import { users } from '../db/schema-sqlite';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Update Claude authentication
router.post('/claude-auth', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    let claudeAuth = req.body.claudeAuth || req.body;

    // Handle wrapped format: extract from claudeAiOauth if present
    if (claudeAuth.claudeAiOauth) {
      claudeAuth = claudeAuth.claudeAiOauth;
    }

    // Validate Claude auth structure
    if (!claudeAuth || !claudeAuth.accessToken || !claudeAuth.refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Invalid Claude auth. Must include accessToken and refreshToken.',
      });
      return;
    }

    // Update user with Claude auth
    await db
      .update(users)
      .set({ claudeAuth })
      .where(eq(users.id, authReq.user!.id));

    res.json({
      success: true,
      data: { message: 'Claude authentication updated successfully' },
    });
  } catch (error) {
    console.error('Update Claude auth error:', error);
    res.status(500).json({ success: false, error: 'Failed to update Claude authentication' });
  }
});

// Remove Claude authentication
router.delete('/claude-auth', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    await db
      .update(users)
      .set({ claudeAuth: null })
      .where(eq(users.id, authReq.user!.id));

    res.json({
      success: true,
      data: { message: 'Claude authentication removed' },
    });
  } catch (error) {
    console.error('Remove Claude auth error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove Claude authentication' });
  }
});

export default router;
