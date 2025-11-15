import { Router } from 'express';
import { db } from '../db/index-sqlite';
import { chatSessions, messages } from '../db/schema-sqlite';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Execute AI coding task with SSE
router.post('/execute', requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;

  try {
    const { userRequest, repositoryUrl, branch, autoCommit, resumeSessionId } = req.body;

    if (!userRequest && !resumeSessionId) {
      res.status(400).json({ success: false, error: 'userRequest or resumeSessionId is required' });
      return;
    }

    if (!authReq.user?.claudeAuth) {
      res.status(400).json({
        success: false,
        error: 'Claude authentication not configured. Please add your Claude credentials.',
      });
      return;
    }

    // Create chat session in database
    const [chatSession] = await db
      .insert(chatSessions)
      .values({
        userId: authReq.user.id,
        userRequest: userRequest || 'Resumed session',
        status: 'pending',
        repositoryUrl: repositoryUrl || null,
        branch: branch || null,
        autoCommit: autoCommit || false,
      })
      .returning();

    // Store user message
    if (userRequest) {
      await db.insert(messages).values({
        chatSessionId: chatSession.id,
        type: 'user',
        content: userRequest,
      });
    }

    // Setup SSE manually
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Prepare request to ai-coding-worker
    const executePayload: any = {
      userRequest: userRequest || 'Resume previous session',
      codingAssistantProvider: 'ClaudeAgentSDK',
      codingAssistantAuthentication: authReq.user.claudeAuth,
    };

    if (resumeSessionId) {
      executePayload.resumeSessionId = resumeSessionId;
    }

    if (repositoryUrl && authReq.user.githubAccessToken) {
      executePayload.github = {
        repoUrl: repositoryUrl,
        branch: branch || undefined,
        accessToken: authReq.user.githubAccessToken,
      };
      executePayload.autoCommit = autoCommit || false;
    }

    // Forward to ai-coding-worker
    const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:5001';
    const response = await fetch(`${aiWorkerUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(executePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI worker error:', errorText);

      await db
        .update(chatSessions)
        .set({ status: 'error', completedAt: new Date() })
        .where(eq(chatSessions.id, chatSession.id));

      await db.insert(messages).values({
        chatSessionId: chatSession.id,
        type: 'error',
        content: errorText || 'AI worker request failed',
      });

      res.write(`data: ${JSON.stringify({ error: errorText })}\n\n`);
      res.end();
      return;
    }

    if (!response.body) {
      res.write(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`);
      res.end();
      return;
    }

    // Update session status
    await db
      .update(chatSessions)
      .set({ status: 'running' })
      .where(eq(chatSessions.id, chatSession.id));

    // Stream events from ai-coding-worker to client
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE format
          if (line.startsWith('event:')) {
            continue;
          }

          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();

            try {
              const eventData = JSON.parse(data);

              // Store ai-worker session ID
              if (eventData.sessionId && !chatSession.aiWorkerSessionId) {
                await db
                  .update(chatSessions)
                  .set({ aiWorkerSessionId: eventData.sessionId })
                  .where(eq(chatSessions.id, chatSession.id));
              }

              // Store assistant messages
              if (eventData.message || eventData.content) {
                await db.insert(messages).values({
                  chatSessionId: chatSession.id,
                  type: 'assistant',
                  content: eventData.message || eventData.content || JSON.stringify(eventData),
                });
              }

              // Forward to client
              res.write(`data: ${data}\n\n`);
            } catch (e) {
              // Forward non-JSON data as-is
              res.write(`data: ${data}\n\n`);
            }
          }
        }
      }

      // Mark as completed
      await db
        .update(chatSessions)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(chatSessions.id, chatSession.id));

      res.write(`data: ${JSON.stringify({ chatSessionId: chatSession.id, completed: true })}\n\n`);
      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);

      await db
        .update(chatSessions)
        .set({ status: 'error', completedAt: new Date() })
        .where(eq(chatSessions.id, chatSession.id));

      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
