import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi, githubApi } from '@/lib/api';
import { useEventSource } from '@/hooks/useEventSource';
import { useAuthStore } from '@/lib/store';
import type { Message, GitHubRepository } from '@webedt/shared';

export default function Chat() {
  const { sessionId } = useParams();
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [autoCommit, setAutoCommit] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  // Load existing session if sessionId provided
  const { data: sessionData } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.getMessages(Number(sessionId)),
    enabled: !!sessionId,
  });

  // Load repositories
  const { data: reposData } = useQuery({
    queryKey: ['repos'],
    queryFn: githubApi.getRepos,
    enabled: !!user?.githubAccessToken,
  });

  const repositories: GitHubRepository[] = reposData?.data || [];

  useEffect(() => {
    if (sessionData?.data?.messages) {
      setMessages(sessionData.data.messages);
    }
  }, [sessionData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { isConnected } = useEventSource(streamUrl, {
    onMessage: (data) => {
      // Log all events to see what we're receiving
      console.log('Received SSE event:', data);

      // Extract content from various possible locations
      let content = null;
      let messageType: 'assistant' | 'system' = 'assistant';

      // Skip system events
      if (data.type === 'connected' || data.type === 'completed') {
        return;
      }

      // Extract from direct message property
      if (data.message) {
        content = data.message;
      }
      // Extract from github_pull_progress
      else if (data.type === 'github_pull_progress' && data.data?.message) {
        content = data.data.message;
      }
      // Extract from Claude API response format (assistant_message)
      else if (data.data && typeof data.data === 'object') {
        // Skip system/init messages
        if (data.data.type === 'system' || data.data.subtype === 'init') {
          return;
        }

        // Extract from Claude message format
        if (data.data.content && Array.isArray(data.data.content)) {
          const textBlocks = data.data.content
            .filter((block: any) => block.type === 'text' && block.text)
            .map((block: any) => block.text);

          if (textBlocks.length > 0) {
            content = textBlocks.join('\n');
          }
        }
        // Extract from tool result or other formats
        else if (data.data.result) {
          content = data.data.result;
        } else if (data.data.text) {
          content = data.data.text;
        }
      }

      // Skip if no meaningful content
      if (!content) {
        return;
      }

      messageIdCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + messageIdCounter.current,
          chatSessionId: Number(sessionId) || 0,
          type: messageType,
          content: content,
          timestamp: new Date(),
        },
      ]);
    },
    onConnected: () => {
      setIsExecuting(true);
    },
    onCompleted: () => {
      setIsExecuting(false);
      setStreamUrl(null);
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Coding Assistant</h1>

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

      {/* Messages */}
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

      {/* Input */}
      <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 ${messages.length === 0 ? 'flex items-center justify-center flex-1' : ''}`}>
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
            {user?.githubAccessToken && repositories.length > 0 && (
              <div className="absolute bottom-3 left-3 right-14 flex flex-wrap gap-2 items-center">
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="text-xs rounded-md border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2"
                  disabled={isExecuting}
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
                  disabled={isExecuting}
                />

                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={autoCommit}
                    onChange={(e) => setAutoCommit(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500"
                    disabled={isExecuting}
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Auto-commit/push</span>
                </label>
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
    </div>
  );
}
