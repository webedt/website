import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api';
import FileBrowser from '@/components/FileBrowser';
import CodeViewer from '@/components/CodeViewer';
import type { ChatSession } from '@webedt/shared';

export default function CodeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Load session details
  const { data: sessionDetailsData, isLoading } = useQuery({
    queryKey: ['session-details', sessionId],
    queryFn: () => sessionsApi.get(Number(sessionId)),
    enabled: !!sessionId,
  });

  const session: ChatSession | undefined = sessionDetailsData?.data;

  useEffect(() => {
    // If no sessionId or invalid session, redirect to dashboard
    if (!sessionId || (sessionDetailsData && !session)) {
      navigate('/');
    }
  }, [sessionId, session, sessionDetailsData, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Session not found</h2>
          <Link to="/" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Extract repository name from URL (if available)
  const getRepoName = (url: string | null) => {
    if (!url) return 'No repository';
    const match = url.match(/\/([^\/]+)\.git$/);
    return match ? match[1] : 'Unknown';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-base-content/70">Repository:</span>
            <span className="font-semibold">{getRepoName(session.repositoryUrl)}</span>
          </div>
          <div className="divider divider-horizontal mx-0"></div>
          <div className="flex items-center gap-2">
            <span className="text-base-content/70">Branch:</span>
            <span className="font-semibold">{session.branch || 'main'}</span>
          </div>
          <div className="divider divider-horizontal mx-0"></div>
          <div className="flex items-center gap-2">
            <span className="text-base-content/70">Auto-commit:</span>
            <span className="font-semibold">{session.autoCommit ? 'On' : 'Off'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="btn btn-sm btn-ghost">
            Dashboard
          </Link>
          <Link to="/new-session" className="btn btn-sm btn-primary">
            New Session
          </Link>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File browser sidebar */}
        <div className="w-64 border-r border-base-300 bg-base-100 flex-shrink-0">
          {session.id && session.aiWorkerSessionId ? (
            <FileBrowser
              sessionId={session.id}
              onFileSelect={setSelectedFile}
              className="h-full"
            />
          ) : (
            <div className="p-4 text-center text-base-content/50">
              <p className="text-sm">No active code session</p>
            </div>
          )}
        </div>

        {/* Code viewer */}
        <div className="flex-1 bg-base-100">
          {session.id ? (
            <CodeViewer
              sessionId={session.id}
              filePath={selectedFile}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-base-content/50">
                <p>No session loaded</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
