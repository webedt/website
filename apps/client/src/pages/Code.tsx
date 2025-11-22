import { useParams } from 'react-router-dom';
import SessionLayout from '@/components/SessionLayout';

export default function Code() {
  const { sessionId } = useParams();

  // If accessed via session route, wrap in SessionLayout
  if (sessionId) {
    return (
      <SessionLayout>
        <div className="h-full bg-base-200 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-primary mb-6">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-base-content mb-4">Code</h1>
            <p className="text-lg text-base-content/70">Code editor coming soon...</p>
          </div>
        </div>
      </SessionLayout>
    );
  }

  // Otherwise render standalone
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-primary mb-6">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-base-content mb-4">Code</h1>
        <p className="text-lg text-base-content/70">Code editor coming soon...</p>
      </div>
    </div>
  );
}
