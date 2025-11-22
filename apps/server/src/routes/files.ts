import { Router } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/index';
import { chatSessions } from '../db/index';
import { eq } from 'drizzle-orm';

const router = Router();
const AI_WORKER_URL = process.env.AI_WORKER_URL || 'http://localhost:5000';

/**
 * Get files list for a session workspace
 * Proxies request to AI worker
 */
router.get('/:sessionId/files', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const sessionId = parseInt(req.params.sessionId);
    const relativePath = (req.query.path as string) || '/';

    if (isNaN(sessionId)) {
      res.status(400).json({ success: false, error: 'Invalid session ID' });
      return;
    }

    // Verify session ownership
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    if (session.userId !== authReq.user!.id) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    if (!session.aiWorkerSessionId) {
      res.status(400).json({ success: false, error: 'Session has no AI worker session' });
      return;
    }

    // Proxy request to AI worker
    const workerUrl = `${AI_WORKER_URL}/sessions/${session.aiWorkerSessionId}/files?path=${encodeURIComponent(relativePath)}`;
    console.log('[Files] Proxying request to:', workerUrl);

    const response = await fetch(workerUrl);
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch files' });
  }
});

/**
 * Get file content
 * Proxies request to AI worker
 */
router.get('/:sessionId/files/*', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const sessionId = parseInt(req.params.sessionId);
    // Get everything after /files/ as the file path
    const filePath = req.params[0] || '';

    if (isNaN(sessionId)) {
      res.status(400).json({ success: false, error: 'Invalid session ID' });
      return;
    }

    // Verify session ownership
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    if (session.userId !== authReq.user!.id) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    if (!session.aiWorkerSessionId) {
      res.status(400).json({ success: false, error: 'Session has no AI worker session' });
      return;
    }

    // Proxy request to AI worker
    const workerUrl = `${AI_WORKER_URL}/sessions/${session.aiWorkerSessionId}/files/${filePath}`;
    console.log('[Files] Proxying file request to:', workerUrl);

    const response = await fetch(workerUrl);
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get file content error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch file content' });
  }
});

export default router;
