import { Link } from 'react-router-dom';
import type { GitHubRepository, User } from '@webedt/shared';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isExecuting: boolean;
  selectedRepo: string;
  setSelectedRepo: (value: string) => void;
  branch: string;
  setBranch: (value: string) => void;
  autoCommit: boolean;
  setAutoCommit: (value: boolean) => void;
  repositories: GitHubRepository[];
  isLoadingRepos: boolean;
  isLocked: boolean;
  user: User | null;
  centered?: boolean;
}

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  isExecuting,
  selectedRepo,
  setSelectedRepo,
  branch,
  setBranch,
  autoCommit,
  setAutoCommit,
  repositories,
  isLoadingRepos,
  isLocked,
  user,
  centered = false,
}: ChatInputProps) {
  const hasGithubAuth = !!user?.githubAccessToken;
  const hasClaudeAuth = !!user?.claudeAuth;

  return (
    <form onSubmit={onSubmit} className={`max-w-4xl ${centered ? 'w-full -mt-12' : 'mx-auto w-full'}`}>
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
            if (e.key === 'Enter') {
              // Shift+Enter → always insert new line (default behavior)
              if (e.shiftKey) {
                return;
              }

              // Cmd/Ctrl+Enter → always submit
              if (e.metaKey || e.ctrlKey) {
                e.preventDefault();
                onSubmit(e);
                return;
              }

              // Plain Enter → submit only if cursor is at the end
              const textarea = e.currentTarget as HTMLTextAreaElement;
              const cursorPos = textarea.selectionStart;
              const textLength = textarea.value.length;

              if (cursorPos === textLength) {
                e.preventDefault();
                onSubmit(e);
              }
              // Otherwise, allow default behavior (insert new line)
            }
          }}
        />

        {/* Controls inside the box */}
        <div className="absolute bottom-3 left-3 right-14 flex flex-wrap gap-2 items-center">
          {hasGithubAuth && (
            <>
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
            </>
          )}

          {/* Status indicators - show if not configured */}
          {(!hasGithubAuth || !hasClaudeAuth) && (
            <div className="flex items-center gap-2 text-xs">
              {!hasGithubAuth && (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  title="GitHub integration required for repository features"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>Connect GitHub</span>
                </Link>
              )}
              {!hasClaudeAuth && (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  title="Claude credentials required to use this service"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Add Credentials</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Submit button inside textarea */}
        <button
          type="submit"
          disabled={isExecuting || !input.trim() || !user?.claudeAuth}
          className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          title="Send message (Enter at end, Cmd/Ctrl+Enter, or click)"
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
  );
}
