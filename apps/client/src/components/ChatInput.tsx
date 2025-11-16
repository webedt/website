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
            // Submit on Cmd/Ctrl + Enter
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit(e);
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
              /* Actual controls or labels */
              <>
                {isExecuting ? (
                  /* Show as text labels when executing */
                  <>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                      {selectedRepo
                        ? repositories.find((r) => r.cloneUrl === selectedRepo)?.fullName ||
                          'No repository'
                        : 'No repository'}
                    </span>
                    {branch && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                        {branch}
                      </span>
                    )}
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {autoCommit ? '✓ Auto-commit/push' : '✗ Auto-commit/push'}
                    </span>
                  </>
                ) : (
                  /* Show as editable controls when not executing */
                  <>
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="text-xs rounded-md border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2"
                      disabled={isLocked}
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
                      disabled={isLocked}
                    />

                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={autoCommit}
                        onChange={(e) => setAutoCommit(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500"
                        disabled={isLocked}
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Auto-commit/push</span>
                    </label>
                  </>
                )}
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
  );
}
