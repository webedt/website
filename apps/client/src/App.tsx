import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Chat from '@/pages/Chat';
import NewSession from '@/pages/NewSession';
import Settings from '@/pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Check if user is already authenticated
    authApi
      .getSession()
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        // User not authenticated
        setUser(null);
      });
  }, [setUser]);

  // Detect base path for React Router
  // In development: BASE_URL is './'
  // In production with Strip Path: we need to detect the actual path from the URL
  const getBasename = () => {
    // If BASE_URL is set to something other than './' or '/', use it
    const viteBase = import.meta.env.BASE_URL;
    if (viteBase && viteBase !== './' && viteBase !== '/') {
      return viteBase;
    }

    // Detect from current pathname for path-based routing
    // Example: https://github.etdofresh.com/webedt/website/branch/ -> /webedt/website/branch
    const pathname = window.location.pathname;

    // Check if we're in a path-based deployment (3+ path segments)
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 3 && !['login', 'register', 'chat', 'settings', 'new-session'].includes(pathSegments[0])) {
      // Assume format: /owner/repo/branch/...
      return `/${pathSegments[0]}/${pathSegments[1]}/${pathSegments[2]}`;
    }

    return '/';
  };

  const basename = getBasename();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-session"
              element={
                <ProtectedRoute>
                  <NewSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:sessionId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
