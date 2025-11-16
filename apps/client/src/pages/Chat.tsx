import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, githubApi } from '@/lib/api';
import { useEventSource } from '@/hooks/useEventSource';
import { useAuthStore } from '@/lib/store';
import type { Message, GitHubRepository, ChatSession } from '@webedt/shared';

export default function Chat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [autoCommit, setAutoCommit] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [deletingSession, setDeletingSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(
    sessionId ? Number(sessionId) : null
  );
  const [isLocked, setIsLocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  // Load existing session if sessionId provided
  const { data: sessionData } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.getMessages(Number(sessionId)),
    enabled: !!sessionId,
  });

  // Load session details
  const { data: sessionDetailsData } = useQuery({
    queryKey: ['session-details', sessionId],
    queryFn: () => sessionsApi.get(Number(sessionId)),
    enabled: !!sessionId,
  });

  const session: ChatSession | undefined = sessionDetailsData?.data;

  // Load current session details to check if locked
  const { data: currentSessionData } = useQuery({
    queryKey: ['currentSession', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return null;
      const response = await fetch(`/api/sessions/${currentSessionId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    enabled: !!currentSessionId,
  });

  // Load repositories
  const { data: reposData, isLoading: isLoadingRepos } = useQuery({
    queryKey: ['repos'],
    queryFn: githubApi.getRepos,
    enabled: !!user?.githubAccessToken,
  });

  const repositories: GitHubRepository[] = reposData?.data || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      sessionsApi.update(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-details', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setEditingTitle(false);
      setEditTitle('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sessionsApi.delete(id),
    onSuccess: () => {
      navigate('/dashboard');
    },
  });

  const handleEditTitle = () => {
    if (session) {
      setEditTitle(session.userRequest);
      setEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (sessionId && editTitle.trim()) {
      updateMutation.mutate({ id: Number(sessionId), title: editTitle.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingTitle(false);
    setEditTitle('');
  };

  const handleDeleteSession = () => {
    setDeletingSession(true);
  };

  const confirmDelete = () => {
    if (sessionId) {
      deleteMutation.mutate(Number(sessionId));
    }
  };

  const cancelDelete = () => {
    setDeletingSession(false);
  };

  // Handle Enter key in delete modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (deletingSession && e.key === 'Enter' && !deleteMutation.isPending) {
        e.preventDefault();
        confirmDelete();
      }
    };

    if (deletingSession) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [deletingSession, deleteMutation.isPending]);

  useEffect(() => {
    if (sessionData?.data?.messages) {
      setMessages(sessionData.data.messages);
    }
  }, [sessionData]);

  // Update locked state when session data changes
  useEffect(() => {
    if (currentSessionData?.data?.locked) {
      setIsLocked(true);
      // Also set repo/branch from session if locked
      if (currentSessionData.data.repositoryUrl) {
        setSelectedRepo(currentSessionData.data.repositoryUrl);
      }
      if (currentSessionData.data.branch) {
        setBranch(currentSessionData.data.branch);
      }
    }
  }, [currentSessionData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { isConnected } = useEventSource(streamUrl, {
    onMessage: (event) => {
      // Log all events to see what we're receiving
      console.log('Received SSE event:', event);
      console.log('Full event data structure:', JSON.stringify(event, null, 2));

      const { eventType, data } = event;

      // Skip system events
      if (eventType === 'connected' || eventType === 'completed') {
        return;
      }

      // Extract content from various possible locations
      let content = null;
      let messageType: 'assistant' | 'system' = 'assistant';
      let eventLabel = '';

      // Set event label for different types
      switch (eventType) {
        case 'status':
          eventLabel = '📊 Status';
          break;
        case 'thought':
          eventLabel = '💭 Thinking';
          break;
        case 'tool_use':
          eventLabel = '🔧 Using tool';
          break;
        case 'result':
          eventLabel = '✅ Result';
          break;
        case 'assistant_message':
          eventLabel = '🤖 Assistant';
          break;
        case 'session_name':
          eventLabel = '📝 Session';
          break;
        default:
          eventLabel = '';
      }

      // Handle AI worker event structure: data.type with nested data.data
      if (data.type === 'message' && data.message) {
        // Simple message with data.message
        content = data.message;
      } else if (data.type === 'session_name' && data.sessionName) {
        // Session name
        content = `Session: ${data.sessionName}`;
      } else if (data.type === 'assistant_message' && data.data) {
        // Nested assistant message structure
        const messageData = data.data;

        if (messageData.type === 'assistant' && messageData.message?.content) {
          // Extract text from content blocks
          const contentBlocks = messageData.message.content;
          if (Array.isArray(contentBlocks)) {
            const textBlocks = contentBlocks
              .filter((block: any) => block.type === 'text' && block.text)
              .map((block: any) => block.text);

            if (textBlocks.length > 0) {
              content = textBlocks.join('\n');
            }

            // Also show tool uses
            const toolUses = contentBlocks
              .filter((block: any) => block.type === 'tool_use')
              .map((block: any) => `🔧 Using ${block.name}`);

            if (toolUses.length > 0 && !content) {
              content = toolUses.join('\n');
            }
          }
        } else if (messageData.type === 'user' && messageData.message?.content) {
          // Tool results
          const contentBlocks = messageData.message.content;
          if (Array.isArray(contentBlocks)) {
            const results = contentBlocks
              .filter((block: any) => block.type === 'tool_result')
              .map((block: any) => block.content)
              .filter(Boolean);

            if (results.length > 0) {
              eventLabel = '✅ Tool Result';
              content = results.join('\n');
            }
          }
        } else if (messageData.type === 'result' && messageData.result) {
          // Final result
          eventLabel = '✅ Complete';
          content = messageData.result;
        }
      }
      // Fallback to original extraction logic
      else if (typeof data === 'string') {
        content = data;
      } else if (data.message) {
        content = data.message;
      } else if (data.content) {
        if (Array.isArray(data.content)) {
          const textBlocks = data.content
            .filter((block: any) => block.type === 'text' && block.text)
            .map((block: any) => block.text);

          if (textBlocks.length > 0) {
            content = textBlocks.join('\n');
          }
        } else if (typeof data.content === 'string') {
          content = data.content;
        }
      } else if (data.text) {
        content = data.text;
      } else if (data.result) {
        content = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
      }

      // Skip if no meaningful content
      if (!content) {
        console.log('Skipping event with no content:', event);
        console.log('Data keys:', typeof data === 'object' ? Object.keys(data) : typeof data);
        return;
      }

      // Add event label if present
      const finalContent = eventLabel ? `${eventLabel}\n${content}` : content;

      messageIdCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + messageIdCounter.current,
          chatSessionId: Number(sessionId) || 0,
          type: messageType,
          content: finalContent,
          timestamp: new Date(),
        },
      ]);
    },
    onConnected: () => {
      setIsExecuting(true);
    },
    onCompleted: (data) => {
      setIsExecuting(false);
      setStreamUrl(null);
      // Capture session ID from completion event
      if (data?.chatSessionId) {
        setCurrentSessionId(data.chatSessionId);
      }
    },
    onError: (error) => {
      console.error('Stream error:', error);
      messageIdCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + messageIdCounter.current,
          chatSessionId: Number(sessionId) || 0,
          type: 'error',
          content: error.message,
          timestamp: new Date(),
        },
      ]);
      setIsExecuting(false);
      setStreamUrl(null);
    },
    autoReconnect: false, // Disable auto-reconnect to prevent infinite loops
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isExecuting) return;

    // Add user message
    messageIdCounter.current += 1;
    const userMessage: Message = {
      id: Date.now() + messageIdCounter.current,
      chatSessionId: Number(sessionId) || 0,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Build stream URL
    const params = new URLSearchParams({
      userRequest: input,
    });

    if (selectedRepo) {
      params.append('repositoryUrl', selectedRepo);
    }

    if (branch) {
      params.append('branch', branch);
    }

    if (autoCommit) {
      params.append('autoCommit', 'true');
    }

    setStreamUrl(`/api/execute?${params}`);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {editingTitle && session ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  onClick={handleSaveTitle}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  disabled={updateMutation.isPending}
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {session ? session.userRequest : 'Chat Session'}
                </h1>
                {session && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleEditTitle}
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title="Edit session title"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDeleteSession}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete session"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {isLocked && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This session is locked to repository {selectedRepo} on branch {branch}. Repository and branch cannot be changed.
              </p>
            </div>
          )}

          {!user?.githubAccessToken && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Connect GitHub in settings to work with repositories
              </p>
            </div>
          )}

          {!user?.claudeAuth && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">
                Add Claude credentials in settings to use the AI assistant
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages or Centered Input */}
      {messages.length === 0 ? (
        /* Centered input for new session */
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl w-full -mt-12">
            {/* Multi-line input with controls and submit button inside */}
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what you want to code..."
                rows={4}
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-lg focus:border-blue-500 focus:ring-blue-500 resize-none pr-14 text-base p-4 pb-16"
                disabled={isExecuting || !user?.claudeAuth}
                onKeyDown={(e) => {
                  // Submit on Cmd/Ctrl + Enter
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              {/* Controls inside the box */}
              {user?.githubAccessToken && (
                <div className="absolute bottom-3 left-3 right-14 flex flex-wrap gap-2 items-center">
                  {isLoadingRepos ? (
                    /* Skeleton loading state */
                    <>
                      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                      <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                      <div className="h-4 w-28 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                    </>
                  ) : repositories.length > 0 ? (
                    /* Actual controls */
                    <>
                      <select
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        className="text-xs rounded-md border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2"
                        disabled={isExecuting || isLocked}
                      >
                        <option value="">No repository</option>
                        {repositories.map((repo) => (
                          <option key={repo.id} value={repo.cloneUrl}>
                            {repo.fullName}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="main"
                        className="text-xs rounded-md border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2 w-24"
                        disabled={isExecuting || isLocked}
                      />

                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={autoCommit}
                          onChange={(e) => setAutoCommit(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500"
                          disabled={isExecuting || isLocked}
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Auto-commit/push</span>
                      </label>
                    </>
                  ) : null}
                </div>
              )}

              {/* Submit button inside textarea */}
              <button
                type="submit"
                disabled={isExecuting || !input.trim() || !user?.claudeAuth}
                className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Send message (Cmd/Ctrl + Enter)"
              >
                {isExecuting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Messages area with bottom input panel */
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isConnected && isExecuting && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Processing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input panel at bottom when messages exist */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full">
              {/* Multi-line input with controls and submit button inside */}
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe what you want to code..."
                  rows={4}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-lg focus:border-blue-500 focus:ring-blue-500 resize-none pr-14 text-base p-4 pb-16"
                  disabled={isExecuting || !user?.claudeAuth}
                  onKeyDown={(e) => {
                    // Submit on Cmd/Ctrl + Enter
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />

                {/* Controls inside the box */}
                {user?.githubAccessToken && (
                  <div className="absolute bottom-3 left-3 right-14 flex flex-wrap gap-2 items-center">
                    {isLoadingRepos ? (
                      /* Skeleton loading state */
                      <>
                        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                        <div className="h-4 w-28 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                      </>
                    ) : repositories.length > 0 ? (
                      /* Actual controls */
                      <>
                        <select
                          value={selectedRepo}
                          onChange={(e) => setSelectedRepo(e.target.value)}
                          className="text-xs rounded-md border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2"
                          disabled={isExecuting || isLocked}
                        >
                          <option value="">No repository</option>
                          {repositories.map((repo) => (
                            <option key={repo.id} value={repo.cloneUrl}>
                              {repo.fullName}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          placeholder="main"
                          className="text-xs rounded-md border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2 w-24"
                          disabled={isExecuting || isLocked}
                        />

                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={autoCommit}
                            onChange={(e) => setAutoCommit(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500"
                            disabled={isExecuting || isLocked}
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">Auto-commit/push</span>
                        </label>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Submit button inside textarea */}
                <button
                  type="submit"
                  disabled={isExecuting || !input.trim() || !user?.claudeAuth}
                  className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Send message (Cmd/Ctrl + Enter)"
                >
                  {isExecuting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deletingSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-80 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Session
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this session? This action cannot be undone and will
              delete all messages in this session.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
