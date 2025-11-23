import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import ThemeSelector from './ThemeSelector';
import MobileMenu from './MobileMenu';
import { VERSION, VERSION_TIMESTAMP, VERSION_SHA } from '@/version';

export default function Layout() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Always show version number
  const getVersionDisplay = () => {
    return `v${VERSION}`;
  };

  // Format tooltip with short SHA and datetime
  const getVersionTooltip = () => {
    if (!VERSION_TIMESTAMP) return 'Version information';

    const date = new Date(VERSION_TIMESTAMP);
    const formattedDate = date.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    const shortSha = VERSION_SHA ? VERSION_SHA.substring(0, 7) : 'unknown';
    return `${shortSha} [${formattedDate}]`;
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
    return <Outlet />;
  }

  // Get user initials for avatar
  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  // Navigation items for mobile menu
  const navItems = [
    {
      to: '/',
      label: 'Store',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>
    },
    {
      to: '/library',
      label: 'Library',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
    },
    {
      to: '/community',
      label: 'Community',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
    },
    {
      to: '/sessions',
      label: 'Editor',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    }
  ];

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
      />

      {/* Top Navigation Bar */}
      <nav className="bg-base-100 border-b border-base-300">
        <div className="px-4">
          <div className="flex items-center h-14">
            {/* Left side - Hamburger (mobile) & Logo (desktop) */}
            <div className="flex items-center">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-base-200 transition-colors mr-2"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>

              {/* Logo - Desktop Only */}
              <Link
                to="/"
                className="hidden md:flex flex-col justify-center py-2"
              >
                <span className="font-semibold text-lg leading-tight">WebEDT</span>
                <span
                  className="text-[9px] text-base-content/40 leading-tight cursor-help"
                  title={getVersionTooltip()}
                >
                  {getVersionDisplay()}
                </span>
              </Link>
            </div>

            {/* Center - Logo (mobile) & Navigation Items (desktop) */}
            <div className="flex-1 flex items-center justify-center">
              {/* Logo - Mobile Only (Centered) */}
              <Link
                to="/"
                className="md:hidden flex flex-col items-center justify-center py-2"
              >
                <span className="font-semibold text-lg leading-tight">WebEDT</span>
                <span
                  className="text-[9px] text-base-content/40 leading-tight cursor-help"
                  title={getVersionTooltip()}
                >
                  {getVersionDisplay()}
                </span>
              </Link>

              {/* Navigation Items - Desktop Only */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
                  </svg>
                  Store
                </Link>

                <Link
                  to="/library"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                  </svg>
                  Library
                </Link>

                <Link
                  to="/community"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  Community
                </Link>

                <Link
                  to="/sessions"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors text-base-content/70 hover:bg-base-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Editor
                </Link>
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

                    {/* New Session link */}
                    <Link
                      to="/new-session"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-base-content hover:bg-base-200 transition-colors"
                    >
                      ➕ New Session
                    </Link>

                    {/* Settings link */}
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-base-content hover:bg-base-200 transition-colors"
                    >
                      ⚙️ Settings
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

      {/* Second Bar - Context-specific content (hidden on dashboard, new session, sessions, library, community, and quick setup pages) */}
      {!['/', '/new-session', '/sessions', '/library', '/community'].includes(location.pathname) && !location.pathname.startsWith('/quick-setup/') && (
        <div className="bg-base-100 border-b border-base-300">
          <div className="px-4 h-12 flex items-center justify-center gap-4">
            {location.pathname === '/new-session' ? (
              <span className="text-sm text-base-content/70">
                Configure your workspace settings below to create a new session
              </span>
            ) : (
              <Link
                to="/new-session"
                className="btn btn-sm btn-primary"
              >
                New Session
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
