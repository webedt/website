import { useState, useEffect } from 'react';
import { filesApi } from '@/lib/api';

interface FileEntry {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
}

interface FileBrowserProps {
  sessionId: number;
  onFileSelect: (path: string) => void;
  className?: string;
}

export default function FileBrowser({ sessionId, onFileSelect, className = '' }: FileBrowserProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']));

  useEffect(() => {
    loadFiles(currentPath);
  }, [sessionId, currentPath]);

  const loadFiles = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await filesApi.list(sessionId, path);
      setFiles(response.data.entries || []);
    } catch (err) {
      console.error('Failed to load files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectory = (dirName: string) => {
    const dirPath = currentPath === '/' ? `/${dirName}` : `${currentPath}/${dirName}`;
    const newExpanded = new Set(expandedDirs);

    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }

    setExpandedDirs(newExpanded);
  };

  const handleFileClick = (file: FileEntry) => {
    if (file.type === 'directory') {
      toggleDirectory(file.name);
    } else {
      const filePath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      onFileSelect(filePath);
    }
  };

  const getFileIcon = (type: 'file' | 'directory', name: string) => {
    if (type === 'directory') return '📁';

    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return '🔷';
      case 'js':
      case 'jsx':
        return '📜';
      case 'json':
        return '🗂️';
      case 'css':
        return '🎨';
      case 'md':
        return '📝';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  if (loading && files.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-sm"></span>
          <span className="ml-2">Loading files...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button className="btn btn-sm mt-2" onClick={() => loadFiles(currentPath)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-base-300 flex items-center justify-between">
        <h3 className="font-semibold uppercase text-xs text-base-content/70">Explorer</h3>
        <button
          className="btn btn-xs btn-ghost"
          onClick={() => loadFiles(currentPath)}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="text-center text-base-content/50 text-sm py-4">
            No files found
          </div>
        ) : (
          <ul className="menu menu-sm gap-0.5">
            {files.map((file) => (
              <li key={file.name}>
                <button
                  onClick={() => handleFileClick(file)}
                  className="flex items-center gap-2 text-sm hover:bg-base-200 rounded px-2 py-1.5"
                >
                  <span>{getFileIcon(file.type, file.name)}</span>
                  <span className="flex-1 text-left truncate">{file.name}</span>
                  {file.size !== undefined && (
                    <span className="text-xs text-base-content/50">
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
