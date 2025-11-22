import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { authApi, sessionsApi, githubApi } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ThemeSelector from './ThemeSelector';
import { VERSION } from '@/version';
import type { GitHubRepository } from '@webedt/shared';

interface SessionLayoutProps {
  selectedRepo?: string;
  branch?: string;
  autoCommit?: boolean;
  onRepoChange?: (repo: string) => void;
  onBranchChange?: (branch: string) => void;
  onAutoCommitChange?: (autoCommit: boolean) => void;
  repositories?: GitHubRepository[];
  isLoadingRepos?: boolean;
  isLocked?: boolean;
  children: React.ReactNode;
}

export default function SessionLayout({
  selectedRepo: selectedRepoProp,
  branch: branchProp,
  autoCommit: autoCommitProp,
  onRepoChange,
  onBranchChange,
  onAutoCommitChange,
  repositories: repositoriesProp,
  isLoadingRepos: isLoadingReposProp,
  isLocked: isLockedProp,
  children,
}: SessionLayoutProps) {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch session data when sessionId exists and no props provided
  const { data: sessionData } = useQuery({
    queryKey: ['session-for-layout', sessionId],
    queryFn: () => sessionsApi.get(Number(sessionId)),
    enabled: !!sessionId && !selectedRepoProp,
  });

  // Fetch repositories when needed
  const { data: reposData, isLoading: isLoadingReposQuery } = useQuery({
    queryKey: ['repos'],
    queryFn: githubApi.getRepos,
    enabled: !!user?.githubAccessToken && !!sessionId && !repositoriesProp,
  });

  // Use fetched data if props not provided
  const selectedRepo = selectedRepoProp ?? sessionData?.data?.repositoryUrl ?? '';
  const branch = branchProp ?? sessionData?.data?.branch ?? '';
  const autoCommit = autoCommitProp ?? sessionData?.data?.autoCommit ?? true;
  const repositories = repositoriesProp ?? reposData?.data ?? [];
  const isLoadingRepos = isLoadingReposProp ?? isLoadingReposQuery;
  const isLocked = isLockedProp ?? (!!sessionId && !!sessionData?.data);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const hasRepository = !!selectedRepo;

  // Get user initials for avatar
  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-base-100 border-b border-base-300">
        <div className="px-4">
          <div className="flex items-center h-14">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex flex-col justify-center py-2"
              >
                <span className="font-semibold text-lg leading-tight">WebEDT</span>
                <span className="text-[9px] text-base-content/40 leading-tight">
                  v{VERSION}
                </span>
              </Link>
            </div>

            {/* Center - Navigation Items */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-1">
                {sessionId ? (
                  <Link
                    to={`/session/${sessionId}/chat`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-primary hover:bg-base-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                    </svg>
                    Chat
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/30 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                    </svg>
                    Chat
                  </button>
                )}

                {sessionId ? (
                  <Link
                    to={`/session/${sessionId}/code`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    Code
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/30 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    Code
                  </button>
                )}

                {sessionId ? (
                  <Link
                    to={`/session/${sessionId}/images`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l-3-4 4-5 3 4 2-2.5 4 5H10z"/>
                    </svg>
                    Images and Animations
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/30 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l-3-4 4-5 3 4 2-2.5 4 5H10z"/>
                    </svg>
                    Images and Animations
                  </button>
                )}

                {sessionId ? (
                  <Link
                    to={`/session/${sessionId}/sound`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    Sound and Music
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/30 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    Sound and Music
                  </button>
                )}

                {sessionId ? (
                  <Link
                    to={`/session/${sessionId}/scene-editor`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
                    </svg>
                    Scene Editor
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/30 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
                    </svg>
                    Scene Editor
                  </button>
                )}

                {sessionId ? (
                  <Link
                    to={`/session/${sessionId}/preview`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    Preview
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/30 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    Preview
                  </button>
                )}
              </div>
            </div>

            {/* Right side - Theme, User menu */}
            <div className="flex items-center gap-3">
              <ThemeSelector />

              {/* User Avatar with Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-content font-semibold text-sm hover:opacity-80 transition-opacity"
                  aria-label="User menu"
                >
                  {userInitials}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-base-100 rounded-lg shadow-xl border border-base-300 py-2 z-50">
                    {/* User email - non-clickable */}
                    <div className="px-4 py-2 text-sm text-base-content/70 border-b border-base-300">
                      📧 {user?.email}
                    </div>

                    {/* Dashboard link */}
                    <Link
                      to="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-base-content hover:bg-base-200 transition-colors"
                    >
                      🏠 Dashboard
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 transition-colors"
                    >
                      🚪 Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Second Bar - Repository Controls or New Session */}
      <div className="bg-base-100 border-b border-base-300">
        <div className="px-4 h-12 flex items-center justify-center gap-4">
          {hasRepository ? (
            <>
              {isLocked ? (
                <>
                  {/* Read-only repository info when locked */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-base-content/70">Repository:</span>
                    <span className="text-sm text-base-content">
                      {repositories.find((repo: GitHubRepository) => repo.cloneUrl === selectedRepo)?.fullName || selectedRepo}
                    </span>
                  </div>

                  {/* Read-only branch when locked */}
                  {branch && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-base-content/70">Branch:</span>
                      <span className="text-sm text-base-content">{branch}</span>
                    </div>
                  )}

                  {/* Read-only auto-commit status when locked */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-base-content/70">Auto-commit:</span>
                    <span className="text-sm text-base-content">
                      {autoCommit ? 'On' : 'Off'}
                    </span>
                  </div>

                  {/* New Session Button */}
                  <Link
                    to="/new-session"
                    className="btn btn-sm btn-primary ml-2"
                  >
                    New Session
                  </Link>
                </>
              ) : (
                <>
                  {/* Editable repository controls when not locked */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-base-content/70">Repository:</span>
                    <select
                      value={selectedRepo}
                      onChange={(e) => onRepoChange?.(e.target.value)}
                      disabled={isLoadingRepos}
                      className="select select-sm select-bordered"
                    >
                      <option value="">No repository</option>
                      {repositories.map((repo: GitHubRepository) => (
                        <option key={repo.id} value={repo.cloneUrl}>
                          {repo.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-base-content/70">Branch:</span>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => onBranchChange?.(e.target.value)}
                      className="input input-sm input-bordered w-32"
                      placeholder="main"
                    />
                  </div>

                  {/* Auto-commit */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-base-content/70">Auto-commit:</span>
                    <input
                      type="checkbox"
                      checked={autoCommit}
                      onChange={(e) => onAutoCommitChange?.(e.target.checked)}
                      className="toggle toggle-sm toggle-primary"
                    />
                    <span className="text-sm text-base-content/50">
                      {autoCommit ? 'On' : 'Off'}
                    </span>
                  </div>

                  {/* New Session Button */}
                  <Link
                    to="/new-session"
                    className="btn btn-sm btn-primary"
                  >
                    New Session
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              {/* Only New Session button when no repository */}
              <Link
                to="/new-session"
                className="btn btn-sm btn-primary"
              >
                New Session
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
