import { useParams } from 'react-router-dom';
import SessionLayout from '@/components/SessionLayout';

export default function Images() {
  const { sessionId } = useParams();

  // If accessed via session route, wrap in SessionLayout
  if (sessionId) {
    return (
      <SessionLayout>
        <div className="h-full bg-base-200 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-primary mb-6">
              <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l-3-4 4-5 3 4 2-2.5 4 5H10z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-base-content mb-4">Images and Animations</h1>
            <p className="text-lg text-base-content/70">Image and animation tools coming soon...</p>
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
          <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l-3-4 4-5 3 4 2-2.5 4 5H10z"/>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-base-content mb-4">Images and Animations</h1>
        <p className="text-lg text-base-content/70">Image and animation tools coming soon...</p>
      </div>
    </div>
  );
}
