import { useParams } from 'react-router-dom';
import SessionLayout from '@/components/SessionLayout';

export default function SceneEditor() {
  const { sessionId } = useParams();

  const content = (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-primary mb-6">
          <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-base-content mb-4">Scene Editor</h1>
        <p className="text-lg text-base-content/70">Scene editor coming soon...</p>
      </div>
    </div>
  );

  // If accessed via session route, wrap in SessionLayout
  if (sessionId) {
    return <SessionLayout>{content}</SessionLayout>;
  }

  // Otherwise render standalone
  return content;
}
