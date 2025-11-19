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
  let chatSession: any;

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
    chatSession = (await db
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
      .returning())[0];

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

    // Send session ID immediately so client can navigate
    res.write(`event: session-created\n`);
    res.write(`data: ${JSON.stringify({ chatSessionId: chatSession.id })}\n\n`);

    // Prepare request to ai-coding-worker
    const executePayload: any = {
      userRequest: (userRequest as string) || 'Resume previous session',
      codingAssistantProvider: 'ClaudeAgentSDK',
      codingAssistantAuthentication: claudeAuth,
    };

    console.log(`[Execute] Session resumption debug:
      - resumeSessionId from query: ${resumeSessionId || 'N/A'}
      - chatSession.id: ${chatSession.id}
      - chatSession.aiWorkerSessionId: ${chatSession.aiWorkerSessionId || 'N/A'}
    `);

    if (resumeSessionId) {
      executePayload.resumeSessionId = resumeSessionId;
      console.log(`[Execute] Added resumeSessionId to payload: ${resumeSessionId}`);
    } else {
      console.log(`[Execute] No resumeSessionId provided, starting new session`);
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
              if (eventData.sessionId) {
                console.log(`[Execute] Received sessionId from AI worker: ${eventData.sessionId}, current aiWorkerSessionId: ${chatSession.aiWorkerSessionId || 'N/A'}`);

                if (!chatSession.aiWorkerSessionId) {
                  await db
                    .update(chatSessions)
                    .set({ aiWorkerSessionId: eventData.sessionId })
                    .where(eq(chatSessions.id, chatSession.id));

                  // Update local chatSession object
                  chatSession.aiWorkerSessionId = eventData.sessionId;
                  console.log(`[Execute] Stored aiWorkerSessionId: ${eventData.sessionId} for chatSession: ${chatSession.id}`);
                } else {
                  console.log(`[Execute] aiWorkerSessionId already set, skipping update`);
                }
              } else {
                console.log(`[Execute] No sessionId in event data:`, JSON.stringify(eventData).substring(0, 200));
              }

              // Store assistant messages (extract content from various event structures)
              let messageContent: string | null = null;

              // Extract content from different event types
              if (eventData.type === 'message' && eventData.message) {
                messageContent = eventData.message;
              } else if (eventData.type === 'session_name' && eventData.sessionName) {
                messageContent = `Session: ${eventData.sessionName}`;
              } else if (eventData.type === 'assistant_message' && eventData.data) {
                const msgData = eventData.data;

                // Handle assistant message with Claude response
                if (msgData.type === 'assistant' && msgData.message?.content) {
                  const contentBlocks = msgData.message.content;
                  if (Array.isArray(contentBlocks)) {
                    const textParts = contentBlocks
                      .filter((block: any) => block.type === 'text' && block.text)
                      .map((block: any) => block.text);
                    if (textParts.length > 0) {
                      messageContent = textParts.join('\n');
                    }
                  }
                }
                // Handle result type
                else if (msgData.type === 'result' && msgData.result) {
                  messageContent = typeof msgData.result === 'string' ? msgData.result : JSON.stringify(msgData.result);
                }
              }
              // Fallback to direct fields
              else if (eventData.message) {
                messageContent = eventData.message;
              } else if (eventData.content) {
                messageContent = typeof eventData.content === 'string' ? eventData.content : JSON.stringify(eventData.content);
              } else if (eventData.text) {
                messageContent = eventData.text;
              }

              // Save to database if we extracted content
              if (messageContent) {
                await db.insert(messages).values({
                  chatSessionId: chatSession.id,
                  type: 'assistant',
                  content: messageContent,
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
      try {
        await db
          .update(chatSessions)
          .set({ status: 'completed', completedAt: new Date() })
          .where(eq(chatSessions.id, chatSession.id));
      } catch (dbError) {
        console.error('Failed to update session status to completed:', dbError);
        // Continue anyway to send completion event to client
      }

      // Check if response is still writable before writing
      if (!res.writableEnded) {
        res.write(`event: completed\n`);
        res.write(`data: ${JSON.stringify({ chatSessionId: chatSession.id, completed: true })}\n\n`);
        res.end();
      }
    } catch (streamError) {
      console.error('Streaming error:', streamError);

      // Try to update session status, but don't fail if it doesn't work
      try {
        await db
          .update(chatSessions)
          .set({ status: 'error', completedAt: new Date() })
          .where(eq(chatSessions.id, chatSession.id));
      } catch (dbError) {
        console.error('Failed to update session status to error:', dbError);
        // Continue anyway to send error event to client
      }

      // Check if response is still writable before writing
      if (!res.writableEnded) {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
        res.write(`event: completed\n`);
        res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
        res.end();
      }
    }
  } catch (error) {
    console.error('Execute error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Try to update session status if session was created, but don't fail if it doesn't work
    if (chatSession?.id) {
      try {
        await db
          .update(chatSessions)
          .set({ status: 'error', completedAt: new Date() })
          .where(eq(chatSessions.id, chatSession.id));
      } catch (dbError) {
        console.error('Failed to update session status in error handler:', dbError);
      }
    }

    // Check if headers were already sent (SSE stream started)
    if (res.headersSent) {
      // Send error through SSE stream only if response is still writable
      if (!res.writableEnded) {
        try {
          res.write(`event: error\n`);
          res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
          res.write(`event: completed\n`);
          res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
          res.end();
        } catch (writeError) {
          console.error('Failed to write error to SSE stream:', writeError);
          // Connection is likely already closed, nothing more we can do
        }
      }
    } else {
      // Send JSON error response
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

export default router;
