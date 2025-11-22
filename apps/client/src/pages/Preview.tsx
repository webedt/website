import { useParams } from 'react-router-dom';
import SessionLayout from '@/components/SessionLayout';

function PreviewPlaceholder() {
  return (
    <div className="h-full bg-base-300 flex flex-col">
      {/* Main preview area */}
      <div className="flex-1 relative bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
        {/* Placeholder content */}
        <div className="text-center space-y-6">
          {/* Large play button */}
          <div className="w-32 h-32 mx-auto rounded-full bg-base-100/10 backdrop-blur-sm border-2 border-base-content/20 flex items-center justify-center hover:bg-base-100/20 transition-colors cursor-not-allowed">
            <svg className="w-16 h-16 text-base-content/40 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-base-content/60">No Preview Available</h2>
            <p className="text-base-content/40">Preview functionality coming soon</p>
          </div>
        </div>

        {/* Settings icon overlay */}
        <div className="absolute top-4 right-4">
          <button className="btn btn-circle btn-sm bg-base-100/10 backdrop-blur-sm border-base-content/20 hover:bg-base-100/20 cursor-not-allowed">
            <svg className="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-base-200 border-t border-base-content/10 px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Playback controls */}
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-circle btn-ghost cursor-not-allowed">
              <svg className="w-4 h-4 text-base-content/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button className="btn btn-sm btn-circle btn-ghost cursor-not-allowed">
              <svg className="w-5 h-5 text-base-content/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14l11-7z"/>
              </svg>
            </button>
            <button className="btn btn-sm btn-circle btn-ghost cursor-not-allowed">
              <svg className="w-4 h-4 text-base-content/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
              </svg>
            </button>
            <button className="btn btn-sm btn-circle btn-ghost cursor-not-allowed">
              <svg className="w-4 h-4 text-base-content/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.58 16.89l5.77-4.07c.56-.4.56-1.24 0-1.63L7.58 7.11C6.91 6.65 6 7.12 6 7.93v8.14c0 .81.91 1.28 1.58.82zM16 7v10h2V7h-2z"/>
              </svg>
            </button>
          </div>

          {/* Time display */}
          <div className="text-sm text-base-content/40 font-mono">
            00:00
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value="0"
              className="range range-xs range-primary opacity-30 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Duration display */}
          <div className="text-sm text-base-content/40 font-mono">
            00:00
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-circle btn-ghost cursor-not-allowed">
              <svg className="w-5 h-5 text-base-content/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value="50"
              className="range range-xs w-20 opacity-30 cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Preview() {
  const { sessionId } = useParams();

  // If accessed via session route, wrap in SessionLayout
  if (sessionId) {
    return (
      <SessionLayout>
        <PreviewPlaceholder />
      </SessionLayout>
    );
  }

  // Otherwise render standalone
  return (
    <div className="min-h-screen bg-base-200">
      <PreviewPlaceholder />
    </div>
  );
}
