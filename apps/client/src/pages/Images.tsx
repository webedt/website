import { useState } from 'react';
import { useParams } from 'react-router-dom';
import SessionLayout from '@/components/SessionLayout';

type EditorType = 'sprite' | 'spritesheet' | 'animation';

function ImagesContent() {
  const [selectedEditor, setSelectedEditor] = useState<EditorType>('sprite');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const mockImages = [
    'character_idle.png',
    'character_walk.png',
    'enemy_type_A.png',
    'background_layer1.png',
    'explosion.png',
  ];

  const mockAnimations = [
    'Player_Idle',
    'Player_Run',
    'Player_Jump',
  ];

  const mockSprites = [
    'idle_0',
    'idle_1',
    'idle_2',
    'idle_3',
  ];

  return (
    <div className="h-full flex bg-base-300">
      {/* Left Sidebar */}
      <div className="w-64 bg-base-100 border-r border-base-300 flex flex-col">
        {/* Project Info */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l-3-4 4-5 3 4 2-2.5 4 5H10z"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-base-content">Project Alpha</div>
              <div className="text-xs text-base-content/60">Images & Animations</div>
            </div>
          </div>
        </div>

        {/* Browse Button */}
        <div className="p-4 border-b border-base-300">
          <button className="btn btn-sm btn-outline w-full gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            Browse
          </button>
        </div>

        {/* Editor Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => setSelectedEditor('sprite')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                selectedEditor === 'sprite'
                  ? 'bg-primary/10 text-primary'
                  : 'text-base-content/70 hover:bg-base-200'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z"/>
              </svg>
              Sprite Editor
            </button>

            <button
              onClick={() => setSelectedEditor('spritesheet')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                selectedEditor === 'spritesheet'
                  ? 'bg-primary/10 text-primary'
                  : 'text-base-content/70 hover:bg-base-200'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
              </svg>
              Sprite Sheet Editor
            </button>

            <button
              onClick={() => setSelectedEditor('animation')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                selectedEditor === 'animation'
                  ? 'bg-primary/10 text-primary'
                  : 'text-base-content/70 hover:bg-base-200'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Animation Editor
            </button>
          </div>

          {/* Assets Section */}
          {selectedEditor !== 'animation' && (
            <div className="p-2 mt-4">
              <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wider px-3 mb-2">
                Images
              </div>
              <div className="space-y-1">
                {mockImages.map((image) => (
                  <button
                    key={image}
                    onClick={() => setSelectedAsset(image)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                      selectedAsset === image
                        ? 'bg-primary/10 text-primary'
                        : 'text-base-content/70 hover:bg-base-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    {image}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedEditor === 'animation' && (
            <div className="p-2 mt-4">
              <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wider px-3 mb-2">
                Animations
              </div>
              <div className="space-y-1">
                {mockAnimations.map((animation) => (
                  <button
                    key={animation}
                    className="w-full text-left px-3 py-1.5 rounded text-sm text-base-content/70 hover:bg-base-200 transition-colors"
                  >
                    {animation}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedEditor === 'spritesheet' && selectedAsset && (
            <div className="p-2 mt-4">
              <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wider px-3 mb-2">
                Sprite List ({mockSprites.length})
              </div>
              <div className="space-y-1">
                {mockSprites.map((sprite) => (
                  <button
                    key={sprite}
                    className="w-full text-left px-3 py-1.5 rounded text-sm text-base-content/70 hover:bg-base-200 transition-colors"
                  >
                    {sprite}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedEditor === 'sprite' && <SpriteEditor />}
        {selectedEditor === 'spritesheet' && <SpritesheetEditor />}
        {selectedEditor === 'animation' && <AnimationEditor />}
      </div>
    </div>
  );
}

function SpriteEditor() {
  return (
    <>
      {/* Toolbar */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-2 flex items-center gap-2">
        <div className="text-sm font-semibold text-base-content/70">Sprite Editor</div>
        <div className="flex-1"></div>
        <button className="btn btn-sm btn-primary gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
          </svg>
          Save
        </button>
        <button className="btn btn-sm btn-primary gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
          </svg>
          Export
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="w-96 h-96 border-2 border-dashed border-base-content/20 rounded-lg flex items-center justify-center bg-base-100/50">
            <div>
              <svg className="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <p className="text-base-content/50">Import an image or create a new file.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-base-100 border-l border-base-300 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Layers */}
          <div>
            <div className="font-semibold text-base-content mb-2 flex items-center justify-between">
              Layers
              <button className="btn btn-xs btn-ghost">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
            <div className="text-sm text-base-content/50">
              This section contains layer controls.
            </div>
          </div>

          {/* Filters */}
          <div className="pt-4 border-t border-base-300">
            <div className="font-semibold text-base-content mb-2">Filters</div>
            <div className="text-sm text-base-content/50">
              This section contains controls for blur, brightness, and contrast.
            </div>
          </div>

          {/* Effects */}
          <div className="pt-4 border-t border-base-300">
            <div className="font-semibold text-base-content mb-2">Effects</div>
            <div className="text-sm text-base-content/50">
              This section contains special effects controls.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SpritesheetEditor() {
  return (
    <>
      {/* Toolbar */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-2 flex items-center gap-4">
        <div className="text-sm font-semibold text-base-content/70">Sprite Sheet Editor</div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-ghost" title="Undo">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </button>
          <button className="btn btn-sm btn-ghost" title="Redo">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </button>
          <button className="btn btn-sm btn-ghost" title="Zoom In">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
            </svg>
          </button>
          <button className="btn btn-sm btn-ghost" title="Zoom Out">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              <path d="M7 9h5v1H7z"/>
            </svg>
          </button>
        </div>
        <div className="flex-1"></div>
        <button className="btn btn-sm btn-primary gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
          </svg>
          Export Sheet
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-base-200 p-8">
        <div className="relative">
          {/* Placeholder sprite sheet visualization */}
          <div className="w-[600px] h-[400px] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border-2 border-dashed border-base-content/20 flex items-center justify-center relative">
            {/* Vertical grid lines */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 border-r-2 border-primary/40"></div>
              <div className="flex-1 border-r-2 border-primary/40"></div>
              <div className="flex-1 border-r-2 border-primary/40"></div>
              <div className="flex-1"></div>
            </div>
            {/* Horizontal line to show slicing */}
            <div className="absolute inset-0">
              <div className="h-1/2 border-b-2 border-primary/40"></div>
            </div>
            <div className="text-center z-10">
              <svg className="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
              </svg>
              <p className="text-base-content/50 text-sm">Import a sprite sheet to slice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-base-100 border-l border-base-300 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Slicing Tools */}
          <div>
            <div className="font-semibold text-base-content mb-3">Slicing Tools</div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button className="btn btn-sm btn-primary flex-1">Automatic</button>
                <button className="btn btn-sm btn-outline flex-1">Manual</button>
              </div>
            </div>
          </div>

          {/* Grid Settings */}
          <div className="pt-4 border-t border-base-300">
            <div className="font-semibold text-base-content mb-3">Grid Settings</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-base-content/70 mb-1 block">By Cell Size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="32"
                    className="input input-sm input-bordered flex-1"
                  />
                  <input
                    type="number"
                    placeholder="32"
                    className="input input-sm input-bordered flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-base-content/70 mb-1 block">By Cell Count</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="4"
                    className="input input-sm input-bordered flex-1"
                  />
                  <input
                    type="number"
                    placeholder="1"
                    className="input input-sm input-bordered flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AnimationEditor() {
  return (
    <>
      {/* Toolbar */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-2 flex items-center gap-4">
        <div className="text-sm font-semibold text-base-content/70">Animation Editor</div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-ghost" title="Undo">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </button>
          <button className="btn btn-sm btn-ghost" title="Redo">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </button>
        </div>
        <div className="flex-1"></div>
        <button className="btn btn-sm btn-ghost gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
          Share
        </button>
        <button className="btn btn-sm btn-primary gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
          </svg>
          Export
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-base-200">
          <div className="text-center">
            <div className="w-96 h-64 border-2 border-dashed border-base-content/20 rounded-lg flex items-center justify-center bg-base-100/50">
              <div className="text-base-content/30 text-sm">Animation Preview Canvas</div>
            </div>
          </div>
        </div>

        {/* Timeline/Frames Area */}
        <div className="bg-base-100 border-t border-base-300 p-4">
          <div className="mb-4 flex items-center justify-center gap-4">
            {/* Playback Controls */}
            <button className="btn btn-sm btn-ghost btn-circle">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button className="btn btn-sm btn-ghost btn-circle">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button className="btn btn-sm btn-ghost btn-circle">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
            <button className="btn btn-sm btn-ghost btn-circle">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
            </button>
            <div className="text-sm text-base-content/70">01:15 / 05:00</div>
          </div>

          {/* Timeline Track */}
          <div className="relative h-2 bg-base-300 rounded-full">
            <div className="absolute left-0 top-0 h-full w-1/4 bg-primary rounded-full"></div>
            <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-pointer"></div>
          </div>

          {/* Frames */}
          <div className="mt-4">
            <div className="text-xs text-base-content/70 mb-2">Frames</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((frame) => (
                <div
                  key={frame}
                  className={`w-16 h-16 border-2 rounded ${
                    frame === 2
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 bg-base-200'
                  } flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors`}
                >
                  <div className="text-xs text-base-content/40">{frame}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-base-100 border-l border-base-300 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Animation Properties */}
          <div>
            <div className="font-semibold text-base-content mb-3">Animation Properties</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-base-content/70 mb-1 block">Animation Name</label>
                <input
                  type="text"
                  placeholder="Player_Run"
                  className="input input-sm input-bordered w-full"
                />
              </div>
              <div>
                <label className="text-xs text-base-content/70 mb-1 block">Frame Duration (ms)</label>
                <input
                  type="number"
                  placeholder="100"
                  className="input input-sm input-bordered w-full"
                />
              </div>
              <div>
                <label className="text-xs text-base-content/70 mb-1 block">Easing</label>
                <select className="select select-sm select-bordered w-full">
                  <option>Linear</option>
                  <option>Ease In</option>
                  <option>Ease Out</option>
                  <option>Ease In Out</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-base-content/70">Loop</label>
                <input type="checkbox" className="toggle toggle-sm toggle-primary" defaultChecked />
              </div>
            </div>
          </div>

          {/* Layers */}
          <div className="pt-4 border-t border-base-300">
            <div className="font-semibold text-base-content mb-3">Layers</div>
            <div className="space-y-2">
              {['Player Body', 'Weapon', 'Background'].map((layer) => (
                <div
                  key={layer}
                  className="flex items-center justify-between p-2 rounded bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <span className="text-sm">{layer}</span>
                  <div className="flex gap-1">
                    <button className="btn btn-xs btn-ghost btn-circle">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                    <button className="btn btn-xs btn-ghost btn-circle">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Images() {
  const { sessionId } = useParams();

  // If accessed via session route, wrap in SessionLayout
  if (sessionId) {
    return (
      <SessionLayout>
        <ImagesContent />
      </SessionLayout>
    );
  }

  // Otherwise render standalone with similar layout structure
  return (
    <div className="min-h-screen bg-base-200">
      <ImagesContent />
    </div>
  );
}
