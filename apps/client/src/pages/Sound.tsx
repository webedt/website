import { useParams } from 'react-router-dom';
import SessionLayout from '@/components/SessionLayout';

export default function Sound() {
  const { sessionId } = useParams();

  // If accessed via session route, wrap in SessionLayout
  if (sessionId) {
    return (
      <SessionLayout>
        <div className="h-full bg-base-200 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-primary mb-6">
              <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-base-content mb-4">Sound and Music</h1>
            <p className="text-lg text-base-content/70">Audio tools coming soon...</p>
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
            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-base-content mb-4">Sound and Music</h1>
        <p className="text-lg text-base-content/70">Audio tools coming soon...</p>
      </div>
    </div>
  );
}
