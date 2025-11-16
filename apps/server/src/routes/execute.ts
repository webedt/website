import { Router } from 'express';
import { db } from '../db/index';
import { chatSessions, messages, users } from '../db/index';
import { eq, and } from 'drizzle-orm';
import type { AuthRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { ensureValidToken } from '../lib/claudeAuth';
import type { ClaudeAuth } from '@webedt/shared';

const router = Router();

// Execute AI coding task with SSE
router.get('/execute', requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;

  try {
    const { userRequest, repositoryUrl, branch, autoCommit, resumeSessionId } = req.query;

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

    // Parse autoCommit from string to boolean
    const autoCommitBool = autoCommit === 'true';

    // Check if there's already a locked session for this repo/branch combination
    if (repositoryUrl && branch) {
      const existingLockedSession = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.userId, authReq.user.id),
            eq(chatSessions.repositoryUrl, repositoryUrl as string),
            eq(chatSessions.branch, branch as string),
            eq(chatSessions.locked, true)
          )
        )
        .limit(1);

      if (existingLockedSession.length > 0) {
        res.status(400).json({
          success: false,
          error: `Repository ${repositoryUrl} on branch ${branch} is locked by an existing session. Please complete or delete the existing session first.`,
        });
        return;
      }
    }

    // Create chat session in database
    const [chatSession] = await db
      .insert(chatSessions)
      .values({
        userId: authReq.user.id,
        userRequest: (userRequest as string) || 'Resumed session',
        status: 'pending',
        repositoryUrl: (repositoryUrl as string) || null,
        branch: (branch as string) || null,
        autoCommit: autoCommitBool,
        locked: false, // Will be locked after first message
      })
      .returning();

    // Store user message and lock the session
    if (userRequest) {
      await db.insert(messages).values({
        chatSessionId: chatSession.id,
        type: 'user',
        content: userRequest as string,
      });

      // Lock the session after first message if it has a repository
      if (repositoryUrl && branch) {
        await db
          .update(chatSessions)
          .set({ locked: true })
          .where(eq(chatSessions.id, chatSession.id));
      }
    }

    // Ensure Claude token is valid, refresh if needed
    let claudeAuth: ClaudeAuth = authReq.user.claudeAuth;
    let tokenWasRefreshed = false;

    try {
      const refreshedAuth = await ensureValidToken(claudeAuth);
      if (refreshedAuth !== claudeAuth) {
        claudeAuth = refreshedAuth;
        tokenWasRefreshed = true;

        // Save refreshed token to database
        await db
          .update(users)
          .set({ claudeAuth: refreshedAuth })
          .where(eq(users.id, authReq.user.id));

        console.log(`[Execute] Refreshed and saved Claude token for user ${authReq.user.id}`);
      }
    } catch (error) {
      console.error('[Execute] Failed to refresh Claude token:', error);
      res.status(401).json({
        success: false,
        error: 'Failed to refresh Claude authentication. Please re-authenticate with Claude.',
      });
      return;
    }

    // Setup SSE manually
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Prepare request to ai-coding-worker
    const executePayload: any = {
      userRequest: (userRequest as string) || 'Resume previous session',
      codingAssistantProvider: 'ClaudeAgentSDK',
      codingAssistantAuthentication: claudeAuth,
    };

    if (resumeSessionId) {
      executePayload.resumeSessionId = resumeSessionId;
    }

    if (repositoryUrl && authReq.user.githubAccessToken) {
      executePayload.github = {
        repoUrl: repositoryUrl as string,
        branch: (branch as string) || undefined,
        accessToken: authReq.user.githubAccessToken,
      };
      executePayload.autoCommit = autoCommitBool;
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

      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: errorText })}\n\n`);
      res.write(`event: completed\n`);
      res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
      res.end();
      return;
    }

    if (!response.body) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`);
      res.write(`event: completed\n`);
      res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
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

        let currentEvent = '';
        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE format
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
            // Don't write yet - wait for the data line
            continue;
          }

          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();

            try {
              const eventData = JSON.parse(data);

              // If no event type was set from event: line, check data.type
              if (!currentEvent && eventData.type) {
                currentEvent = eventData.type;
              }

              // Store ai-worker session ID
              if (eventData.sessionId && !chatSession.aiWorkerSessionId) {
                await db
                  .update(chatSessions)
                  .set({ aiWorkerSessionId: eventData.sessionId })
                  .where(eq(chatSessions.id, chatSession.id));
              }

              // Store assistant messages (for any event with content)
              if (eventData.message || eventData.content || eventData.text) {
                await db.insert(messages).values({
                  chatSessionId: chatSession.id,
                  type: 'assistant',
                  content: eventData.message || eventData.content || eventData.text || JSON.stringify(eventData),
                });
              }

              // Forward to client - write event and data together as a single SSE message
              if (currentEvent) {
                res.write(`event: ${currentEvent}\n`);
              }
              res.write(`data: ${data}\n\n`);
            } catch (e) {
              // Forward non-JSON data as-is
              if (currentEvent) {
                res.write(`event: ${currentEvent}\n`);
              }
              res.write(`data: ${data}\n\n`);
            }

            currentEvent = ''; // Reset event type
          }
        }
      }

      // Mark as completed
      await db
        .update(chatSessions)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(chatSessions.id, chatSession.id));

      res.write(`event: completed\n`);
      res.write(`data: ${JSON.stringify({ chatSessionId: chatSession.id, completed: true })}\n\n`);
      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);

      await db
        .update(chatSessions)
        .set({ status: 'error', completedAt: new Date() })
        .where(eq(chatSessions.id, chatSession.id));

      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.write(`event: completed\n`);
      res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Execute error:', error);

    // Check if headers were already sent (SSE stream started)
    if (res.headersSent) {
      // Send error through SSE stream
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
      res.write(`event: completed\n`);
      res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
      res.end();
    } else {
      // Send JSON error response
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

export default router;
