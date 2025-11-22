import { useState, useEffect } from 'react';
import { filesApi } from '@/lib/api';

interface CodeViewerProps {
  sessionId: number;
  filePath: string | null;
  className?: string;
}

export default function CodeViewer({ sessionId, filePath, className = '' }: CodeViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setContent('');
      return;
    }

    loadFile(filePath);
  }, [sessionId, filePath]);

  const loadFile = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await filesApi.get(sessionId, path.startsWith('/') ? path.slice(1) : path);
      setContent(response.data.content || '');
    } catch (err) {
      console.error('Failed to load file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  if (!filePath) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-base-content/50">
          <div className="text-6xl mb-4">📄</div>
          <p>Select a file to view its contents</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* File header */}
      <div className="px-4 py-2 border-b border-base-300 flex items-center justify-between bg-base-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{filePath}</span>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-xs btn-ghost" onClick={() => loadFile(filePath)} title="Refresh">
            ↻
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto p-4 bg-base-100">
        <pre className="text-sm font-mono leading-relaxed">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
