import { Link } from 'react-router-dom';
import type { User } from '@webedt/shared';

interface AuthStatusIndicatorProps {
  user: User | null;
}

export function AuthStatusIndicator({ user }: AuthStatusIndicatorProps) {
  const hasGithubAuth = !!user?.githubAccessToken;
  const hasClaudeAuth = !!user?.claudeAuth;

  // If both are configured, don't show the indicator
  if (hasGithubAuth && hasClaudeAuth) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Configuration Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">
              The following authentication methods need to be configured:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                {hasGithubAuth ? (
                  <svg
                    className="mr-2 h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="mr-2 h-5 w-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                <span className={hasGithubAuth ? 'text-green-800' : ''}>
                  GitHub OAuth
                  {!hasGithubAuth && (
                    <Link
                      to="/settings"
                      className="ml-2 font-medium text-yellow-800 underline hover:text-yellow-900"
                    >
                      Configure in Settings
                    </Link>
                  )}
                </span>
              </li>
              <li className="flex items-center">
                {hasClaudeAuth ? (
                  <svg
                    className="mr-2 h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="mr-2 h-5 w-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                <span className={hasClaudeAuth ? 'text-green-800' : ''}>
                  Claude Credentials
                  {!hasClaudeAuth && (
                    <Link
                      to="/settings"
                      className="ml-2 font-medium text-yellow-800 underline hover:text-yellow-900"
                    >
                      Configure in Settings
                    </Link>
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
