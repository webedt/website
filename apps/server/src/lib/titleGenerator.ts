import type { ClaudeAuth } from '@webedt/shared';

/**
 * Generate a concise 3-6 word session title based on user's request
 * Uses ai-coding-worker to create meaningful titles
 */
export async function generateSessionTitle(
  userRequest: string | any[],
  claudeAuth: ClaudeAuth,
  aiWorkerUrl: string
): Promise<string> {
  // Create abort controller outside try block so it's accessible in catch
  const controller = new AbortController();
  let timeout: NodeJS.Timeout | undefined;

  try {
    // Extract text from content blocks if userRequest is an array
    let requestText: string;
    if (Array.isArray(userRequest)) {
      const textBlocks = userRequest.filter((block: any) => block.type === 'text');
      requestText = textBlocks.map((block: any) => block.text).join('\n');
    } else {
      requestText = userRequest;
    }

    // Make a one-off request to ai-coding-worker for title generation
    const titlePrompt = `Generate a concise 3-6 word title for a chat session based on this user request. Only respond with the title, nothing else.

User request: ${requestText}

Title:`;

    // Set 60 second timeout for title generation
    timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${aiWorkerUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        userRequest: titlePrompt,
        codingAssistantProvider: 'ClaudeAgentSDK',
        codingAssistantAuthentication: claudeAuth,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`AI worker request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body from AI worker');
    }

    // Parse SSE stream to extract title
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let title = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue;

          const data = line.substring(5).trim();
          try {
            const eventData = JSON.parse(data);

            // Extract title from assistant_message event
            if (eventData.type === 'assistant_message' && eventData.data?.message?.content) {
              const contentBlocks = eventData.data.message.content;
              if (Array.isArray(contentBlocks)) {
                const textContent = contentBlocks
                  .filter((block: any) => block.type === 'text')
                  .map((block: any) => block.text)
                  .join(' ');
                if (textContent) {
                  title = textContent.trim();
                }
              }
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (title) {
      // Clean up the title
      title = title.replace(/^["']|["']$/g, ''); // Remove quotes
      title = title.replace(/^Title:\s*/i, ''); // Remove "Title:" prefix if present

      // Ensure title is not too long (max 60 characters)
      if (title.length > 60) {
        title = title.substring(0, 57) + '...';
      }

      return title;
    }

    // Fallback to first 50 characters of request
    const fallbackText = Array.isArray(userRequest)
      ? userRequest.filter((b: any) => b.type === 'text').map((b: any) => b.text).join(' ')
      : userRequest;
    const firstLine = fallbackText.split('\n')[0].trim();
    return firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
  } catch (error) {
    // Clear timeout if error occurs
    if (timeout) {
      clearTimeout(timeout);
    }
    console.error('[Title Generator] Error generating session title:', error);

    // Fallback: use first line of user request (max 50 chars)
    const fallbackText = Array.isArray(userRequest)
      ? userRequest.filter((b: any) => b.type === 'text').map((b: any) => b.text).join(' ')
      : userRequest;

    const firstLine = fallbackText.split('\n')[0].trim();
    return firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
  }
}
