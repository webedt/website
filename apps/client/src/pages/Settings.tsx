import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const [claudeAuthJson, setClaudeAuthJson] = useState('');
  const [claudeError, setClaudeError] = useState('');
  const queryClient = useQueryClient();

  const disconnectGitHub = useMutation({
    mutationFn: githubApi.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      alert('GitHub disconnected successfully');
    },
    onError: (error) => {
      alert(`Failed to disconnect GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const saveClaudeAuth = useMutation({
    mutationFn: userApi.updateClaudeAuth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setClaudeAuthJson('');
      alert('Claude authentication saved successfully');
    },
    onError: (error) => {
      setClaudeError(error instanceof Error ? error.message : 'Failed to save Claude auth');
    },
  });

  const handleClaudeAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaudeError('');

    try {
      const claudeAuth = JSON.parse(claudeAuthJson);

      // Validate structure
      if (!claudeAuth.accessToken || !claudeAuth.refreshToken) {
        setClaudeError('Invalid Claude auth JSON. Must include accessToken and refreshToken.');
        return;
      }

      saveClaudeAuth.mutate(claudeAuth);
    } catch (error) {
      setClaudeError('Invalid JSON format');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">User ID:</span> {user?.id}
            </p>
          </div>
        </div>

        {/* GitHub Integration */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            GitHub Integration
          </h2>

          {user?.githubAccessToken ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-green-800 dark:text-green-200">
                    GitHub connected (ID: {user.githubId})
                  </span>
                </div>
                <button
                  onClick={() => disconnectGitHub.mutate()}
                  disabled={disconnectGitHub.isPending}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your GitHub account to access repositories and enable automatic commits.
              </p>
              <button
                onClick={githubApi.connect}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Connect GitHub
              </button>
            </div>
          )}
        </div>

        {/* Claude Authentication */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Claude Authentication
          </h2>

          {user?.claudeAuth ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Claude credentials configured
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Subscription: {user.claudeAuth.subscriptionType} | Rate Limit:{' '}
                {user.claudeAuth.rateLimitTier}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add your Claude OAuth credentials to enable AI coding assistance. You can obtain these
                from the browser DevTools while logged into claude.ai (see ai-coding-worker
                CREDENTIALS.md).
              </p>

              <form onSubmit={handleClaudeAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Claude Auth JSON
                  </label>
                  <textarea
                    value={claudeAuthJson}
                    onChange={(e) => setClaudeAuthJson(e.target.value)}
                    placeholder='{"accessToken": "...", "refreshToken": "...", "expiresAt": 123456789, "scopes": [...], "subscriptionType": "...", "rateLimitTier": "..."}'
                    rows={6}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                  />
                  {claudeError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{claudeError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Claude Credentials
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
